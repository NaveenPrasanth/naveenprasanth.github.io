// Authentication and Cloud Sync Module
class AuthManager {
    constructor() {
        // Load API URL from configuration (environment variables)
        this.apiBaseUrl = window.config ? window.config.getApiBaseUrl() : 'http://localhost:8787';
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.syncInProgress = false;
        
        // Log the API URL being used (for debugging)
        console.log(`🔗 AuthManager using API URL: ${this.apiBaseUrl}`);
        
        // Promise to track when auth initialization is complete
        this.authReadyPromise = this.initializeAuth();
    }

    async initializeAuth() {
        // Test API connectivity first
        await this.testApiConnection();
        
        if (this.token) {
            try {
                // Verify token is still valid by making a test request
                const response = await this.makeAuthenticatedRequest('/api/progress');
                if (response.ok) {
                    // Token is valid, get user info from token payload
                    const payload = this.parseJWT(this.token);
                    this.currentUser = {
                        id: payload.userId,
                        username: payload.username
                    };
                    this.updateAuthUI();
                    this.syncWithCloud();
                } else {
                    // Token is invalid, clear it
                    this.logout();
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                this.logout();
            }
        }
    }

    async testApiConnection() {
        try {
            console.log('Testing API connection to:', `${this.apiBaseUrl}/api/health`);
            const response = await fetch(`${this.apiBaseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API health check successful:', data);
            } else {
                console.error('API health check failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('API connection test failed:', error);
        }
    }

    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    async makeAuthenticatedRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return fetch(`${this.apiBaseUrl}${endpoint}`, {
            ...options,
            headers
        });
    }

    async register(username, email, password) {
        try {
            console.log('Attempting registration to:', `${this.apiBaseUrl}/api/auth/register`);
            
            const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            console.log('Registration response status:', response.status);

            const data = await response.json();
            console.log('Registration response data:', data);

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('auth_token', this.token);
                this.updateAuthUI();
                this.syncWithCloud();
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: `Network error: ${error.message}` };
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('auth_token', this.token);
                this.updateAuthUI();
                this.syncWithCloud();
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async logout() {
        try {
            if (this.token) {
                await this.makeAuthenticatedRequest('/api/auth/logout', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('auth_token');
        this.updateAuthUI();
    }

    updateAuthUI() {
        const userInfo = document.getElementById('user-info');
        const authButtons = document.getElementById('auth-buttons');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            userName.textContent = this.currentUser.username;
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
        } else {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    async syncWithCloud() {
        if (!this.currentUser || this.syncInProgress) return;

        this.syncInProgress = true;
        try {
            // Sync progress
            await this.syncProgress();
            // Sync notes
            await this.syncNotes();
            
            console.log('Cloud sync completed successfully');
        } catch (error) {
            console.error('Cloud sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncProgress() {
        try {
            // Get cloud progress
            const response = await this.makeAuthenticatedRequest('/api/progress');
            if (!response.ok) throw new Error('Failed to fetch cloud progress');
            
            const cloudData = await response.json();
            const cloudProgress = {};
            
            cloudData.progress.forEach(item => {
                cloudProgress[item.problem_id] = item.status;
            });

            // Get local progress
            const localProgress = JSON.parse(localStorage.getItem('problemProgress') || '{}');

            // Merge progress (cloud takes precedence for conflicts)
            const mergedProgress = { ...localProgress, ...cloudProgress };

            // Update local storage
            localStorage.setItem('problemProgress', JSON.stringify(mergedProgress));

            // Sync any local changes to cloud
            for (const [problemId, status] of Object.entries(localProgress)) {
                if (!cloudProgress[problemId] || cloudProgress[problemId] !== status) {
                    await this.updateCloudProgress(problemId, status);
                }
            }

            // Update UI
            if (window.updateStats) {
                window.updateStats();
            }
        } catch (error) {
            console.error('Progress sync failed:', error);
        }
    }

    async syncNotes() {
        try {
            // Get cloud notes
            const response = await this.makeAuthenticatedRequest('/api/notes');
            if (!response.ok) throw new Error('Failed to fetch cloud notes');
            
            const cloudData = await response.json();
            const cloudNotes = {};
            
            cloudData.notes.forEach(item => {
                cloudNotes[item.problem_id] = item.note_text;
            });

            // Get local notes
            const localNotes = JSON.parse(localStorage.getItem('problemNotes') || '{}');

            // Merge notes (cloud takes precedence for conflicts)
            const mergedNotes = { ...localNotes, ...cloudNotes };

            // Update local storage
            localStorage.setItem('problemNotes', JSON.stringify(mergedNotes));

            // Sync any local changes to cloud
            for (const [problemId, noteText] of Object.entries(localNotes)) {
                if (!cloudNotes[problemId] || cloudNotes[problemId] !== noteText) {
                    await this.updateCloudNote(problemId, noteText);
                }
            }
        } catch (error) {
            console.error('Notes sync failed:', error);
        }
    }

    async updateCloudProgress(problemId, status) {
        try {
            const response = await this.makeAuthenticatedRequest(`/api/progress/${problemId}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update cloud progress');
            }
        } catch (error) {
            console.error('Failed to update cloud progress:', error);
        }
    }

    async updateCloudNote(problemId, noteText) {
        try {
            const response = await this.makeAuthenticatedRequest(`/api/notes/${problemId}`, {
                method: 'PUT',
                body: JSON.stringify({ note_text: noteText })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update cloud note');
            }
        } catch (error) {
            console.error('Failed to update cloud note:', error);
        }
    }

    // Hook into existing progress update function
    async onProgressUpdate(problemId, status) {
        // Update local storage first
        const progress = JSON.parse(localStorage.getItem('problemProgress') || '{}');
        progress[problemId] = status;
        localStorage.setItem('problemProgress', JSON.stringify(progress));

        // Sync to cloud if authenticated
        if (this.currentUser) {
            await this.updateCloudProgress(problemId, status);
        }
    }

    // Hook into existing notes update function
    async onNotesUpdate(problemId, noteText) {
        // Update local storage first
        const notes = JSON.parse(localStorage.getItem('problemNotes') || '{}');
        if (noteText && noteText.trim()) {
            notes[problemId] = noteText;
        } else {
            delete notes[problemId];
        }
        localStorage.setItem('problemNotes', JSON.stringify(notes));

        // Sync to cloud if authenticated
        if (this.currentUser) {
            await this.updateCloudNote(problemId, noteText);
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Wait for auth initialization to complete
    async waitForAuthReady() {
        await this.authReadyPromise;
        return this.isAuthenticated();
    }
}

// Initialize auth manager
let authManager;
try {
    authManager = new AuthManager();
    window.authManager = authManager;
    console.log('AuthManager initialized successfully');
} catch (error) {
    console.error('Failed to initialize AuthManager:', error);
}
