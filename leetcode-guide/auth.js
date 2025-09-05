// Authentication and Cloud Sync Module
class AuthManager {
    constructor() {
        // Load API URL from configuration (environment variables)
        this.apiBaseUrl = window.config ? window.config.getApiBaseUrl() : null;
        this.offlineMode = window.config ? window.config.isOfflineMode() : true;
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.syncInProgress = false;
        
        // Log the API URL being used (for debugging)
        if (this.offlineMode) {
            console.log('🔗 AuthManager running in OFFLINE MODE - authentication disabled');
        } else {
            console.log(`🔗 AuthManager using API URL: ${this.apiBaseUrl}`);
        }
        
        // Promise to track when auth initialization is complete
        this.authReadyPromise = this.initializeAuth();
    }

    async initializeAuth() {
        // Skip authentication in offline mode
        if (this.offlineMode) {
            console.log('Offline mode: Skipping authentication initialization');
            this.updateAuthUI(); // Update UI to show offline state
            return;
        }
        
        // Check for OAuth callback with token in URL
        const isOAuthLogin = this.handleOAuthCallback();
        
        // Test API connectivity first
        await this.testApiConnection();
        
        if (this.token) {
            // If user info wasn't set by OAuth callback, try to get it from existing token
            if (!this.currentUser) {
                const payload = this.parseJWT(this.token);
                if (payload) {
                    this.currentUser = {
                        id: payload.userId,
                        username: payload.username,
                        email: payload.email,
                        provider: payload.provider || 'password'
                    };
                }
            }
            
            // If we have user info, update UI and try to sync
            if (this.currentUser) {
                console.log('User authenticated:', this.currentUser);
                this.updateAuthUI();
                
                // For OAuth logins, wait a moment before trying to sync to ensure backend session is ready
                if (isOAuthLogin) {
                    console.log('OAuth login detected, waiting before sync...');
                    setTimeout(() => {
                        this.syncWithCloud();
                    }, 2500); // Wait 2.5 seconds for backend session to be fully established
                } else {
                    // For existing sessions, validate token first
                    try {
                        const response = await this.makeAuthenticatedRequest('/api/progress');
                        if (response.ok) {
                            this.syncWithCloud();
                        } else {
                            console.log('Token validation failed, clearing session');
                            this.logout();
                        }
                    } catch (error) {
                        console.error('Token validation error:', error);
                        this.logout();
                    }
                }
            } else {
                // Token exists but can't parse user info - clear it
                console.log('Invalid token detected, clearing session');
                this.logout();
            }
        } else {
            // No token, ensure UI shows logged out state
            this.updateAuthUI();
        }
    }

    async testApiConnection() {
        if (this.offlineMode) {
            console.log('Offline mode: Skipping API connection test');
            return;
        }
        
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
        if (this.offlineMode) {
            return { success: false, error: 'Registration unavailable in offline mode. Please check your internet connection.' };
        }
        
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
        if (this.offlineMode) {
            return { success: false, error: 'Login unavailable in offline mode. Please check your internet connection.' };
        }
        
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

    // Handle OAuth callback with token in URL
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('OAuth error:', error);
            this.showToast('Authentication failed. Please try again.', 'error');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        
        if (token) {
            console.log('OAuth token received, setting up authentication');
            this.token = token;
            localStorage.setItem('auth_token', token);
            
            // Immediately extract user info from JWT token
            const payload = this.parseJWT(token);
            if (payload) {
                this.currentUser = {
                    id: payload.userId,
                    username: payload.username,
                    email: payload.email,
                    provider: payload.provider || 'google'
                };
                console.log('OAuth user authenticated:', this.currentUser);
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show success message
            this.showToast('Successfully signed in with Google!', 'success');
            
            return true; // Indicate successful OAuth login
        }
        
        return false;
    }

    // Initiate Google OAuth login
    async loginWithGoogle() {
        if (this.offlineMode) {
            this.showToast('Google Sign-In unavailable in offline mode. Please check your internet connection.', 'error');
            return { success: false, error: 'Offline mode' };
        }
        
        try {
            // Redirect to Google OAuth
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `${this.apiBaseUrl}/api/auth/google?redirect=${currentUrl}`;
            return { success: true };
        } catch (error) {
            console.error('Google OAuth initiation failed:', error);
            this.showToast('Failed to initiate Google Sign-In. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
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
        this.showToast('Successfully logged out', 'success');
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
        if (this.offlineMode || !this.currentUser || this.syncInProgress) return;

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

// Set up Google Sign-In button event handlers
document.addEventListener('DOMContentLoaded', () => {
    // Google Sign-In button in login modal
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Google login button clicked');
            
            if (window.authManager) {
                try {
                    await window.authManager.loginWithGoogle();
                } catch (error) {
                    console.error('Google login failed:', error);
                    // Show error toast if available
                    if (window.app && window.app.showToast) {
                        window.app.showToast('Google login failed. Please try again.', 'error');
                    }
                }
            } else {
                console.error('AuthManager not available');
            }
        });
    }

    // Google Sign-In button in register modal
    const googleRegisterBtn = document.getElementById('google-register-btn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Google register button clicked');
            
            if (window.authManager) {
                try {
                    await window.authManager.loginWithGoogle();
                } catch (error) {
                    console.error('Google registration failed:', error);
                    // Show error toast if available
                    if (window.app && window.app.showToast) {
                        window.app.showToast('Google registration failed. Please try again.', 'error');
                    }
                }
            } else {
                console.error('AuthManager not available');
            }
        });
    }

    console.log('Google Sign-In event handlers initialized');
});
