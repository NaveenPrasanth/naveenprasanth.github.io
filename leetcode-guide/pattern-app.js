class PatternFocusedApp {
    constructor() {
        this.problems = [];
        this.patterns = new Map();
        this.userProgress = {};
        this.userNotes = {};
        this.currentPattern = null;
        this.currentProblem = null;
        this.currentView = 'patterns'; // 'patterns', 'pattern-focus', 'problem-detail'
        
        // Filtering and sorting preferences
        this.currentFilter = 'all'; // 'all', 'not-started', 'in-progress', 'completed'
        this.currentSort = 'pattern-number'; // 'pattern-number', 'completion-rate', 'alphabetical', 'total-problems'

        this.init();
    }

    async init() {
        console.log('Initializing Pattern-Focused StudyGuideApp v2.0...');
        this.showLoading(true);
        
        try {
            // Load problems data and organize by patterns
            await this.loadData();
            
            // Load local progress and notes first (works offline)
            this.loadLocalData();
            
            // Wait for authentication to fully initialize before checking auth status
            console.log('Waiting for authentication initialization...');
            if (window.authManager) {
                // Check if we're in offline mode
                if (window.authManager.offlineMode) {
                    console.log('Running in offline mode - using local data only');
                } else {
                    const isAuthenticated = await window.authManager.waitForAuthReady();
                    if (isAuthenticated) {
                        console.log('User authenticated after init, loading cloud data...');
                        await this.loadCloudData();
                    } else {
                        console.log('No user authenticated, using local data only');
                    }
                }
            } else {
                console.log('AuthManager not available, using local data only');
            }
            
            this.organizeByPatterns();
            
            // Update authentication UI
            await this.updateAuthUI();
            
            // Set up event listeners
            this.setupEventListeners();
            this.setupAuthEventListeners();
            this.setupNotesEventListeners();
            
            // Show pattern selection view
            this.showPatternSelectionView();
            
        } catch (error) {
            console.error('Error during initialization:', error);
            this.showToast('Failed to initialize app. Please refresh the page.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Data Management
    async loadData() {
        try {
            const response = await fetch('problems.json');
            if (!response.ok) {
                throw new Error('Failed to load problems data');
            }
            this.problems = await response.json();
            console.log(`Loaded ${this.problems.length} problems`);
        } catch (error) {
            console.error('Error loading problems:', error);
            this.showToast('Failed to load problems data', 'error');
        }
    }

    loadLocalData() {
        // Load local progress and notes from localStorage (works offline)
        try {
            this.userProgress = JSON.parse(localStorage.getItem('problemProgress') || '{}');
            this.userNotes = JSON.parse(localStorage.getItem('problemNotes') || '{}');
            console.log(`Loaded local data: ${Object.keys(this.userProgress).length} progress entries, ${Object.keys(this.userNotes).length} notes`);
        } catch (error) {
            console.error('Error loading local data:', error);
            this.userProgress = {};
            this.userNotes = {};
        }
    }

    organizeByPatterns() {
        this.patterns.clear();
        
        // Group problems by pattern
        this.problems.forEach(problem => {
            const pattern = problem.pattern;
            if (!this.patterns.has(pattern)) {
                this.patterns.set(pattern, {
                    name: pattern,
                    problems: [],
                    description: this.getPatternDescription(pattern),
                    totalProblems: 0,
                    completedProblems: 0
                });
            }
            
            this.patterns.get(pattern).problems.push(problem);
            this.patterns.get(pattern).totalProblems++;
            
            // Count completed problems
            const status = this.getProblemStatus(problem.id);
            if (status === 'completed') {
                this.patterns.get(pattern).completedProblems++;
            }
        });

        // Sort problems within each pattern by number
        this.patterns.forEach(pattern => {
            pattern.problems.sort((a, b) => a.number - b.number);
        });

        console.log(`Organized into ${this.patterns.size} patterns`);
    }

    getPatternDescription(pattern) {
        const descriptions = {
            'Two Pointers': 'Master the two pointers technique for efficient array and string problems.',
            'Sliding Window': 'Learn to solve subarray and substring problems with optimal time complexity.',
            'Binary Search': 'Understand binary search variations for sorted arrays and search spaces.',
            'Dynamic Programming': 'Break down complex problems into simpler subproblems.',
            'Backtracking': 'Explore all possible solutions systematically with pruning.',
            'Graph Traversal': 'Navigate graphs using DFS, BFS, and advanced algorithms.',
            'Tree Traversal': 'Master tree algorithms including DFS, BFS, and tree construction.',
            'Greedy': 'Make locally optimal choices to find global solutions.',
            'Heap': 'Use priority queues to solve top-k and scheduling problems.',
            'Stack': 'Leverage LIFO structure for parsing, monotonic, and backtracking problems.',
            'Linked List': 'Manipulate linked list structures with various techniques.',
            'Array': 'Fundamental array manipulation and optimization techniques.',
            'String': 'String processing, pattern matching, and manipulation algorithms.',
            'Hash Table': 'Use hash maps for fast lookups and frequency counting.',
            'Bit Manipulation': 'Optimize solutions using bitwise operations.',
            'Math': 'Apply mathematical concepts and number theory to programming.',
            'Trie': 'Implement prefix trees for string search and autocomplete.',
            'Union Find': 'Solve connectivity and grouping problems efficiently.'
        };
        
        return descriptions[pattern] || `Master the ${pattern} algorithmic pattern.`;
    }

    extractPatternNumber(patternName) {
        // Extract number from pattern names like "Pattern 1:", "Pattern 10:", etc.
        const match = patternName.match(/Pattern\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    }

    getFilteredAndSortedPatterns() {
        let patterns = Array.from(this.patterns.values());
        
        // Apply filters
        if (this.currentFilter !== 'all') {
            patterns = patterns.filter(pattern => {
                if (this.currentFilter === 'completed') {
                    return pattern.completedProblems === pattern.totalProblems && pattern.totalProblems > 0;
                } else if (this.currentFilter === 'in-progress') {
                    return pattern.completedProblems > 0 && pattern.completedProblems < pattern.totalProblems;
                } else if (this.currentFilter === 'not-started') {
                    return pattern.completedProblems === 0;
                }
                return true;
            });
        }
        
        // Apply sorting
        patterns.sort((a, b) => {
            switch (this.currentSort) {
                case 'completion-rate':
                    const aRate = a.totalProblems > 0 ? a.completedProblems / a.totalProblems : 0;
                    const bRate = b.totalProblems > 0 ? b.completedProblems / b.totalProblems : 0;
                    if (aRate !== bRate) return bRate - aRate; // Higher completion first
                    // Fallback to pattern number for ties
                    return this.comparePatternNumbers(a.name, b.name);
                    
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                    
                case 'total-problems':
                    if (a.totalProblems !== b.totalProblems) {
                        return b.totalProblems - a.totalProblems; // More problems first
                    }
                    // Fallback to pattern number for ties
                    return this.comparePatternNumbers(a.name, b.name);
                    
                case 'pattern-number':
                default:
                    return this.comparePatternNumbers(a.name, b.name);
            }
        });
        
        return patterns;
    }
    
    comparePatternNumbers(nameA, nameB) {
        const aPatternNum = this.extractPatternNumber(nameA);
        const bPatternNum = this.extractPatternNumber(nameB);
        
        if (aPatternNum !== null && bPatternNum !== null) {
            return aPatternNum - bPatternNum; // Numerical sort
        }
        
        // Fallback to alphabetical if no numbers found
        return nameA.localeCompare(nameB);
    }

    // View Management
    showPatternSelectionView() {
        this.currentView = 'patterns';
        document.getElementById('pattern-selection-view').style.display = 'block';
        document.getElementById('pattern-focus-view').style.display = 'none';
        document.getElementById('problem-detail-view').style.display = 'none';
        
        this.initializePatternControls();
        this.renderPatternCards();
        this.updateOverallProgress();
    }

    initializePatternControls() {
        // Set filter and sort dropdown values to match current state
        const patternFilter = document.getElementById('pattern-filter');
        if (patternFilter) {
            patternFilter.value = this.currentFilter;
        }

        const patternSort = document.getElementById('pattern-sort');
        if (patternSort) {
            patternSort.value = this.currentSort;
        }
    }

    showPatternFocusView(pattern) {
        this.currentPattern = pattern;
        this.currentView = 'pattern-focus';
        document.getElementById('pattern-selection-view').style.display = 'none';
        document.getElementById('pattern-focus-view').style.display = 'block';
        document.getElementById('problem-detail-view').style.display = 'none';
        
        this.renderPatternFocus();
    }

    showProblemDetailView(problem) {
        this.currentProblem = problem;
        this.currentView = 'problem-detail';
        document.getElementById('pattern-selection-view').style.display = 'none';
        document.getElementById('pattern-focus-view').style.display = 'none';
        document.getElementById('problem-detail-view').style.display = 'block';
        
        this.renderProblemDetail();
    }

    // Rendering Methods
    renderPatternCards() {
        const container = document.getElementById('patterns-grid');
        if (!container) return;

        const filteredAndSortedPatterns = this.getFilteredAndSortedPatterns();

        container.innerHTML = filteredAndSortedPatterns.map(pattern => {
            const completionRate = pattern.totalProblems > 0 ? 
                Math.round((pattern.completedProblems / pattern.totalProblems) * 100) : 0;
            
            return `
                <div class="pattern-card" data-pattern="${pattern.name}">
                    <div class="pattern-card-header">
                        <div class="pattern-title">${pattern.name}</div>
                        <div class="pattern-count">${pattern.totalProblems} problems</div>
                    </div>
                    <div class="pattern-description">${pattern.description}</div>
                    <div class="pattern-progress-bar">
                        <div class="pattern-progress-fill" style="width: ${completionRate}%"></div>
                    </div>
                    <div class="pattern-progress-text">
                        ${pattern.completedProblems} / ${pattern.totalProblems} completed (${completionRate}%)
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.pattern-card').forEach(card => {
            card.addEventListener('click', () => {
                const patternName = card.dataset.pattern;
                const pattern = this.patterns.get(patternName);
                if (pattern) {
                    this.showPatternFocusView(pattern);
                }
            });
        });
    }

    renderPatternFocus() {
        if (!this.currentPattern) return;

        // Update pattern header
        document.getElementById('current-pattern-title').textContent = this.currentPattern.name;
        document.getElementById('current-pattern-description').textContent = this.currentPattern.description;
        
        // Update progress bar
        const completionRate = this.currentPattern.totalProblems > 0 ? 
            (this.currentPattern.completedProblems / this.currentPattern.totalProblems) * 100 : 0;
        
        document.getElementById('pattern-progress-fill').style.width = `${completionRate}%`;
        document.getElementById('pattern-progress-text').textContent = 
            `${this.currentPattern.completedProblems} / ${this.currentPattern.totalProblems} completed`;

        // Render problems for this pattern
        const container = document.getElementById('pattern-problems');
        if (!container) return;

        container.innerHTML = this.currentPattern.problems.map(problem => {
            const status = this.getProblemStatus(problem.id);
            const hasNotes = this.getProblemNote(problem.id);
            const contentStatus = problem.has_content ? 
                '<i class="fas fa-check-circle content-available" title="Content available"></i>' : 
                '<i class="fas fa-clock content-in-progress" title="Content in progress"></i>';

            return `
                <div class="pattern-problem-card ${status}" data-problem-id="${problem.id}">
                    <div class="problem-card-header">
                        <div class="problem-card-title">
                            <span class="problem-number">${problem.number}</span>
                            ${problem.title}
                            ${contentStatus}
                        </div>
                        <div class="problem-status-badge ${status}">
                            ${status.replace('-', ' ')}
                        </div>
                    </div>
                    <div class="problem-card-meta">
                        <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span>
                        <span class="pattern">${problem.pattern}</span>
                    </div>
                    <div class="problem-card-actions">
                        <button class="quick-action-btn notes-btn" data-problem-id="${problem.id}" title="Notes">
                            <i class="fas fa-sticky-note${hasNotes ? '' : '-o'}"></i>
                        </button>
                        <a href="${problem.url}" target="_blank" class="quick-action-btn" title="Open in LeetCode">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.pattern-problem-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.problem-card-actions')) return;
                
                const problemId = card.dataset.problemId;
                const problem = this.problems.find(p => p.id === problemId);
                if (problem) {
                    this.showProblemDetailView(problem);
                }
            });
        });

        // Add notes button listeners
        container.querySelectorAll('.notes-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const problemId = btn.dataset.problemId;
                const problem = this.problems.find(p => p.id === problemId);
                if (problem) {
                    this.showNotesModal(problem);
                }
            });
        });
    }

    renderProblemDetail() {
        if (!this.currentProblem) return;

        // Update problem header
        document.getElementById('detail-problem-title').textContent = this.currentProblem.title;
        document.getElementById('detail-difficulty').textContent = this.currentProblem.difficulty;
        document.getElementById('detail-difficulty').className = `difficulty ${this.currentProblem.difficulty}`;
        document.getElementById('detail-pattern').textContent = this.currentProblem.pattern;
        document.getElementById('detail-leetcode-link').href = this.currentProblem.url;

        // Update status selector
        const statusSelect = document.getElementById('detail-status-select');
        if (statusSelect) {
            statusSelect.value = this.getProblemStatus(this.currentProblem.id);
        }

        // Render problem content
        const contentContainer = document.getElementById('problem-content');
        if (contentContainer && this.currentProblem.content) {
            contentContainer.innerHTML = marked.parse(this.currentProblem.content);
            
            // Highlight code blocks
            contentContainer.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    updateOverallProgress() {
        const totalProblems = this.problems.length;
        const completedProblems = this.problems.filter(p => 
            this.getProblemStatus(p.id) === 'completed'
        ).length;
        
        const patternsMastered = Array.from(this.patterns.values()).filter(pattern => 
            pattern.completedProblems === pattern.totalProblems && pattern.totalProblems > 0
        ).length;
        
        const overallCompletion = totalProblems > 0 ? 
            Math.round((completedProblems / totalProblems) * 100) : 0;

        // Update UI
        const totalCompletedEl = document.getElementById('total-completed');
        const patternsMasteredEl = document.getElementById('patterns-mastered');
        const overallCompletionEl = document.getElementById('overall-completion');

        if (totalCompletedEl) totalCompletedEl.textContent = completedProblems;
        if (patternsMasteredEl) patternsMasteredEl.textContent = patternsMastered;
        if (overallCompletionEl) overallCompletionEl.textContent = `${overallCompletion}%`;

        // Update header stats
        document.getElementById('progress-percentage').textContent = `${overallCompletion}%`;
        document.getElementById('completed-count').textContent = completedProblems;
        document.getElementById('total-count').textContent = totalProblems;
    }

    // Event Listeners
    setupEventListeners() {
        // Back to patterns button
        const backToPatterns = document.getElementById('back-to-patterns');
        if (backToPatterns) {
            backToPatterns.addEventListener('click', () => {
                this.showPatternSelectionView();
            });
        }

        // Back to pattern button
        const backToPattern = document.getElementById('back-to-pattern');
        if (backToPattern) {
            backToPattern.addEventListener('click', () => {
                if (this.currentPattern) {
                    this.showPatternFocusView(this.currentPattern);
                }
            });
        }

        // Problem detail status change with confirmation
        const detailStatusSelect = document.getElementById('detail-status-select');
        if (detailStatusSelect) {
            let previousValue = detailStatusSelect.value;
            
            detailStatusSelect.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                const oldStatus = previousValue;
                
                if (!this.currentProblem || newStatus === oldStatus) {
                    return;
                }
                
                // Show confirmation dialog for status changes
                const confirmed = await this.confirmStatusChange(this.currentProblem, oldStatus, newStatus);
                
                if (confirmed) {
                    await this.updateProblemStatus(this.currentProblem.id, newStatus);
                    previousValue = newStatus;
                } else {
                    // Revert the dropdown to previous value if user cancels
                    detailStatusSelect.value = oldStatus;
                }
            });
            
            // Update previousValue when the dropdown is properly set
            detailStatusSelect.addEventListener('focus', () => {
                previousValue = detailStatusSelect.value;
            });
        }

        // Problem detail notes button
        const detailNotesBtn = document.getElementById('detail-notes-btn');
        if (detailNotesBtn) {
            detailNotesBtn.addEventListener('click', () => {
                if (this.currentProblem) {
                    this.showNotesModal(this.currentProblem);
                }
            });
        }

        // Pattern filter and sort controls
        const patternFilter = document.getElementById('pattern-filter');
        if (patternFilter) {
            patternFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderPatternCards();
            });
        }

        const patternSort = document.getElementById('pattern-sort');
        if (patternSort) {
            patternSort.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderPatternCards();
            });
        }
    }

    setupAuthEventListeners() {
        // Login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (window.authManager && window.authManager.offlineMode) {
                    this.showToast('Authentication unavailable in offline mode. Your progress is saved locally.', 'info');
                    return;
                }
                this.showLoginModal();
            });
        }

        // Register button
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                if (window.authManager && window.authManager.offlineMode) {
                    this.showToast('Registration unavailable in offline mode. Your progress is saved locally.', 'info');
                    return;
                }
                this.showRegisterModal();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideAuthModals());
        });

        // Modal overlay click
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideAuthModals();
                }
            });
        }

        // Form submissions
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Switch between login/register
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        
        if (showRegister) {
            showRegister.addEventListener('click', () => this.switchToRegister());
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', () => this.switchToLogin());
        }
    }

    setupNotesEventListeners() {
        // Notes modal close
        const notesModalClose = document.getElementById('notes-modal-close');
        if (notesModalClose) {
            notesModalClose.addEventListener('click', () => this.hideNotesModal());
        }

        // Notes modal overlay
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        if (notesModalOverlay) {
            notesModalOverlay.addEventListener('click', (e) => {
                if (e.target === notesModalOverlay) {
                    this.hideNotesModal();
                }
            });
        }

        // Save notes button
        const saveNotesBtn = document.getElementById('save-notes');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => this.saveNotes());
        }

        // Cancel notes button
        const cancelNotesBtn = document.getElementById('cancel-notes');
        if (cancelNotesBtn) {
            cancelNotesBtn.addEventListener('click', () => this.hideNotesModal());
        }
    }

    // Progress Management - Cloud-First with Mandatory Authentication
    async updateProblemStatus(problemId, status) {
        // Require authentication to save progress
        if (!this.requireAuthentication('save progress')) {
            return;
        }
        
        try {
            // Update local state immediately for responsive UI
            this.userProgress[problemId] = status;
            
            // Save directly to cloud (no local storage)
            await this.syncProgressToCloud(problemId, status);
            console.log(`Progress saved to cloud: ${problemId} -> ${status}`);
            
            // Re-organize patterns to update counts
            this.organizeByPatterns();
            
            // Update current view
            if (this.currentView === 'patterns') {
                this.renderPatternCards();
                this.updateOverallProgress();
            } else if (this.currentView === 'pattern-focus') {
                this.renderPatternFocus();
                this.updateOverallProgress();
            }
            
            // Show success feedback
            this.showToast(`Problem marked as ${status}`, 'success');
            this.showSyncStatus(true);
            
        } catch (error) {
            console.error('Failed to save progress to cloud:', error);
            // Revert local state on failure
            delete this.userProgress[problemId];
            this.showToast('Failed to save progress. Please try again.', 'error');
            this.showSyncStatus(false);
        }
    }

    getProblemStatus(problemId) {
        return this.userProgress[problemId] || 'not-started';
    }

    getProblemNote(problemId) {
        return this.userNotes[problemId] || '';
    }

    // Authentication Check for Data Operations
    requireAuthentication(action = 'save progress') {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            this.showToast(`Please login to ${action}`, 'warning');
            this.showAuthModal('login');
            return false;
        }
        return true;
    }

    // Confirmation dialog for status changes to prevent accidental updates
    async confirmStatusChange(problem, oldStatus, newStatus) {
        // Don't require confirmation for initial status setting (not-started -> anything)
        if (oldStatus === 'not-started') {
            return true;
        }
        
        const statusLabels = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress', 
            'completed': 'Completed',
            'review': 'Review'
        };
        
        const oldLabel = statusLabels[oldStatus] || oldStatus;
        const newLabel = statusLabels[newStatus] || newStatus;
        
        return confirm(
            `Change status for "${problem.title}" from "${oldLabel}" to "${newLabel}"?\n\n` +
            `This will be saved to your account immediately.`
        );
    }

    // Cloud Sync Methods
    async loadCloudData() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            console.log('Loading user data from cloud...');
            
            // Load progress
            const progressResponse = await window.authManager.makeAuthenticatedRequest('/api/progress');
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                this.userProgress = {};
                progressData.progress.forEach(item => {
                    this.userProgress[item.problem_id] = item.status;
                });
                console.log('Loaded progress from cloud:', this.userProgress);
            }

            // Load notes
            const notesResponse = await window.authManager.makeAuthenticatedRequest('/api/notes');
            if (notesResponse.ok) {
                const notesData = await notesResponse.json();
                this.userNotes = {};
                notesData.notes.forEach(item => {
                    this.userNotes[item.problem_id] = item.note_text;
                });
                console.log('Loaded notes from cloud:', this.userNotes);
            }

            this.showSyncStatus(true);
        } catch (error) {
            console.error('Failed to load cloud data:', error);
            this.showSyncStatus(false);
        }
    }


    async syncProgressToCloud(problemId, status) {
        const response = await window.authManager.makeAuthenticatedRequest(`/api/progress/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to sync progress: ${response.statusText}`);
        }
    }

    async syncNotesToCloud(problemId, noteText) {
        const response = await window.authManager.makeAuthenticatedRequest(`/api/notes/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify({ note_text: noteText || '' })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to sync notes: ${response.statusText}`);
        }
    }

    // Authentication UI Management
    async updateAuthUI() {
        const userInfo = document.getElementById('user-info');
        const authButtons = document.getElementById('auth-buttons');
        const userNameEl = document.getElementById('user-name');

        // Check for offline mode first
        if (window.authManager && window.authManager.offlineMode) {
            // In offline mode, hide all authentication UI elements
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'none';
            this.showSyncStatus(false, 'Offline Mode');
            console.log('UI updated for offline mode - authentication hidden');
            return;
        }

        // Wait for auth to be ready before updating UI
        if (window.authManager) {
            const isAuthenticated = await window.authManager.waitForAuthReady();
            
            if (isAuthenticated) {
                // Show user info, hide auth buttons
                if (userInfo) userInfo.style.display = 'flex';
                if (authButtons) authButtons.style.display = 'none';
                
                // Update username
                const user = window.authManager.getCurrentUser();
                if (userNameEl && user) {
                    userNameEl.textContent = user.username;
                }
                
                this.showSyncStatus(true);
            } else {
                // Hide user info, show auth buttons
                if (userInfo) userInfo.style.display = 'none';
                if (authButtons) authButtons.style.display = 'flex';
                
                this.showSyncStatus(false);
            }
        } else {
            // AuthManager not available, show auth buttons
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            this.showSyncStatus(false);
        }
    }

    // Authentication Methods
    showLoginModal() {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'block';
        document.getElementById('register-modal').style.display = 'none';
    }

    showRegisterModal() {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'block';
    }

    hideAuthModals() {
        document.getElementById('modal-overlay').style.display = 'none';
    }

    switchToRegister() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'block';
    }

    switchToLogin() {
        document.getElementById('register-modal').style.display = 'none';
        document.getElementById('login-modal').style.display = 'block';
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        this.showLoading(true);
        const result = await window.authManager.login(username, password);
        
        if (result.success) {
            this.hideAuthModals();
            this.showToast(`Welcome back, ${result.user.username}!`, 'success');
            
            // Update authentication UI
            await this.updateAuthUI();
            
            // Clear ALL existing data - both memory and localStorage to prevent user confusion
            this.userProgress = {};
            this.userNotes = {};
            
            // Clear localStorage completely to avoid mixing data between users
            localStorage.removeItem('problemProgress');
            localStorage.removeItem('problemNotes');
            console.log('🧹 Cleared local storage on login for fresh user data');
            
            // Load fresh user data from cloud after clearing local data
            await this.loadCloudData();
            this.organizeByPatterns();
            
            // Refresh current view
            if (this.currentView === 'patterns') {
                this.renderPatternCards();
                this.updateOverallProgress();
            } else if (this.currentView === 'pattern-focus') {
                this.renderPatternFocus();
                this.updateOverallProgress();
            }
            
            this.showSyncStatus(true);
        } else {
            this.showToast(result.error || 'Login failed', 'error');
        }
        this.showLoading(false);
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        this.showLoading(true);
        const result = await window.authManager.register(username, email, password);
        
        if (result.success) {
            this.hideAuthModals();
            this.showToast(`Welcome, ${result.user.username}! Account created successfully.`, 'success');
            
            // Update authentication UI
            await this.updateAuthUI();
            
            // Clear ALL existing data - both memory and localStorage for new user
            this.userProgress = {};
            this.userNotes = {};
            
            // Clear localStorage completely for clean start with new account
            localStorage.removeItem('problemProgress');
            localStorage.removeItem('problemNotes');
            console.log('🧹 Cleared local storage for new user registration');
            
            // Load fresh user data from cloud (will be empty for new user)
            await this.loadCloudData();
            this.organizeByPatterns();
            
            // Refresh current view
            if (this.currentView === 'patterns') {
                this.renderPatternCards();
                this.updateOverallProgress();
            } else if (this.currentView === 'pattern-focus') {
                this.renderPatternFocus();
                this.updateOverallProgress();
            }
            
            this.showSyncStatus(true);
        } else {
            this.showToast(result.error || 'Registration failed', 'error');
        }
        this.showLoading(false);
    }

    async handleLogout() {
        if (!window.authManager) {
            return;
        }

        await window.authManager.logout();
        
        // Update authentication UI
        await this.updateAuthUI();
        
        // Clear ALL user data - both memory and localStorage to prevent confusion
        this.userProgress = {};
        this.userNotes = {};
        
        // Clear localStorage completely to avoid data mixing between users
        localStorage.removeItem('problemProgress');
        localStorage.removeItem('problemNotes');
        console.log('🧹 Cleared all local storage data on logout');
        
        this.organizeByPatterns();
        
        // Refresh current view
        if (this.currentView === 'patterns') {
            this.renderPatternCards();
            this.updateOverallProgress();
        } else if (this.currentView === 'pattern-focus') {
            this.renderPatternFocus();
            this.updateOverallProgress();
        }
        
        this.showSyncStatus(false);
        this.showToast('Logged out successfully', 'success');
    }

    // Notes Modal Methods
    showNotesModal(problem) {
        if (!problem) return;
        
        this.currentProblem = problem;
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        const notesTextarea = document.getElementById('notes-textarea');
        
        if (notesModalOverlay && notesTextarea) {
            notesTextarea.value = this.getProblemNote(problem.id);
            notesModalOverlay.style.display = 'flex';
            notesTextarea.focus();
        }
    }

    hideNotesModal() {
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        if (notesModalOverlay) {
            notesModalOverlay.style.display = 'none';
        }
    }

    async saveNotes() {
        if (!this.currentProblem) return;
        
        // Require authentication to save notes
        if (!this.requireAuthentication('save notes')) {
            return;
        }
        
        const notesTextarea = document.getElementById('notes-textarea');
        if (!notesTextarea) return;
        
        const noteText = notesTextarea.value.trim();
        const problemId = this.currentProblem.id;
        
        try {
            // Update local state
            if (noteText) {
                this.userNotes[problemId] = noteText;
            } else {
                delete this.userNotes[problemId];
            }
            
            // Save directly to cloud (no local storage)
            await this.syncNotesToCloud(problemId, noteText);
            console.log(`Notes saved to cloud: ${problemId}`);
            
            // Show success feedback
            this.showToast('Notes saved successfully', 'success');
            this.showSyncStatus(true);
            
            // Hide modal and refresh view if needed
            this.hideNotesModal();
            
            if (this.currentView === 'pattern-focus') {
                this.renderPatternFocus();
            }
            
        } catch (error) {
            console.error('Failed to save notes to cloud:', error);
            // Revert local state on failure
            if (noteText) {
                delete this.userNotes[problemId];
            }
            this.showToast('Failed to save notes. Please try again.', 'error');
            this.showSyncStatus(false);
        }
    }

    // UI Helper Methods
    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const iconMap = {
            'success': 'check',
            'error': 'times',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${iconMap[type] || 'info'}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after duration based on type
        const duration = type === 'error' ? 5000 : type === 'warning' ? 4000 : 3000;
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    showSyncStatus(isOnline = true, customMessage = null) {
        // Check for offline mode - we'll show status in the header stats area instead
        if (window.authManager && window.authManager.offlineMode) {
            this.showOfflineStatus();
            return;
        }

        const userInfo = document.getElementById('user-info');
        if (!userInfo) return;

        let syncIndicator = userInfo.querySelector('.sync-indicator');
        if (!syncIndicator) {
            syncIndicator = document.createElement('span');
            syncIndicator.className = 'sync-indicator';
            userInfo.appendChild(syncIndicator);
        }

        if (window.authManager && window.authManager.isAuthenticated()) {
            syncIndicator.innerHTML = isOnline 
                ? '<i class="fas fa-cloud" title="Synced to cloud"></i>'
                : '<i class="fas fa-wifi" style="opacity: 0.5;" title="Offline mode"></i>';
            syncIndicator.style.display = 'inline';
        } else {
            syncIndicator.style.display = 'none';
        }
    }

    showOfflineStatus() {
        // Add offline indicator to the header stats area
        const headerStats = document.querySelector('.header-stats');
        if (!headerStats) return;

        let offlineIndicator = headerStats.querySelector('.offline-indicator');
        if (!offlineIndicator) {
            offlineIndicator = document.createElement('div');
            offlineIndicator.className = 'stat-item offline-indicator';
            offlineIndicator.innerHTML = `
                <span class="stat-label">Mode</span>
                <span class="stat-value" style="color: #f39c12;">
                    <i class="fas fa-wifi" style="opacity: 0.7;"></i> Offline
                </span>
            `;
            headerStats.appendChild(offlineIndicator);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PatternFocusedApp();
});
