// LeetCode Study Guide Interactive App
class StudyGuideApp {
    constructor() {
        this.problems = [];
        this.filteredProblems = [];
        this.currentProblem = null;
        this.userProgress = {};
        this.userNotes = {};
        this.currentView = 'list';
        
        this.setupMarkdownRenderer();
        this.init();
    }

    setupMarkdownRenderer() {
        // Configure marked.js for better rendering
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
                    }
                    return code;
                },
                breaks: true,
                gfm: true,
                sanitize: false,
                smartLists: true,
                smartypants: true
            });
        }
    }

    async init() {
        this.showLoading(true);
        await this.loadData();
        
        // Wait for auth manager to initialize
        await this.waitForAuthManager();
        
        // Load user data (cloud-first if authenticated, local fallback)
        await this.loadUserData();
        
        this.setupEventListeners();
        this.setupAuthEventListeners();
        this.setupNotesEventListeners();
        this.populateFilters();
        this.renderProblems();
        this.updateStats();
        this.showLoading(false);
    }

    async waitForAuthManager() {
        // Wait for auth manager to be available
        let attempts = 0;
        while (!window.authManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    async loadUserData() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            console.log('Loading user data from cloud...');
            await this.loadCloudData();
        } else {
            console.log('Loading user data from local storage...');
            this.loadLocalData();
        }
    }

    async loadCloudData() {
        try {
            // Load progress from cloud
            const progressResponse = await window.authManager.makeAuthenticatedRequest('/api/progress');
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                this.userProgress = {};
                progressData.progress.forEach(item => {
                    this.userProgress[item.problem_id] = item.status;
                });
                console.log('Loaded progress from cloud:', this.userProgress);
            }

            // Load notes from cloud
            const notesResponse = await window.authManager.makeAuthenticatedRequest('/api/notes');
            if (notesResponse.ok) {
                const notesData = await notesResponse.json();
                this.userNotes = {};
                notesData.notes.forEach(item => {
                    this.userNotes[item.problem_id] = item.note_text;
                });
                console.log('Loaded notes from cloud:', this.userNotes);
            }

            // Update local storage as backup
            this.saveLocalData();
            this.showSyncStatus(true);
        } catch (error) {
            console.error('Failed to load cloud data, falling back to local:', error);
            this.loadLocalData();
            this.showSyncStatus(false);
        }
    }

    loadLocalData() {
        this.loadUserProgress();
        this.loadUserNotes();
    }

    saveLocalData() {
        this.saveUserProgress();
        this.saveUserNotes();
    }

    async syncLocalDataToCloud() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        console.log('Syncing existing local data to cloud...');
        
        try {
            // Sync all local progress to cloud
            for (const [problemId, status] of Object.entries(this.userProgress)) {
                if (status && status !== 'not-started') {
                    await this.syncProgressToCloud(problemId, status);
                }
            }

            // Sync all local notes to cloud
            for (const [problemId, noteText] of Object.entries(this.userNotes)) {
                if (noteText && noteText.trim()) {
                    await this.syncNotesToCloud(problemId, noteText);
                }
            }

            console.log('Local data successfully synced to cloud');
        } catch (error) {
            console.error('Failed to sync some local data to cloud:', error);
        }
    }

    // Data Loading
    async loadData() {
        try {
            const response = await fetch('problems.json');
            if (!response.ok) {
                throw new Error('Failed to load problems data');
            }
            this.problems = await response.json();
            this.filteredProblems = [...this.problems];
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load problems data', 'error');
            // Fallback to empty array
            this.problems = [];
            this.filteredProblems = [];
        }
    }

    // Local Storage for Persistence
    loadUserProgress() {
        const saved = localStorage.getItem('problemProgress');
        if (saved) {
            try {
                this.userProgress = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading progress:', error);
                this.userProgress = {};
            }
        }
    }

    loadUserNotes() {
        const saved = localStorage.getItem('problemNotes');
        if (saved) {
            try {
                this.userNotes = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading notes:', error);
                this.userNotes = {};
            }
        }
    }

    saveUserProgress() {
        localStorage.setItem('problemProgress', JSON.stringify(this.userProgress));
        this.updateStats();
    }

    saveUserNotes() {
        localStorage.setItem('problemNotes', JSON.stringify(this.userNotes));
    }

    // Problem Status Management
    async setProblemStatus(problemId, status) {
        // Update local state immediately for responsive UI
        this.userProgress[problemId] = status;
        this.saveUserProgress();
        this.renderProblems();
        this.updateStats();
        
        // Show immediate feedback
        this.showToast(`Problem marked as ${status}`, 'success');
        
        // Sync with cloud if authenticated
        if (window.authManager && window.authManager.isAuthenticated()) {
            try {
                await this.syncProgressToCloud(problemId, status);
                console.log(`Progress synced to cloud: ${problemId} -> ${status}`);
                this.showSyncStatus(true);
            } catch (error) {
                console.error('Failed to sync progress to cloud:', error);
                this.showToast('Progress saved locally (cloud sync failed)', 'warning');
                this.showSyncStatus(false);
            }
        }
    }

    async syncProgressToCloud(problemId, status) {
        const response = await window.authManager.makeAuthenticatedRequest(`/api/progress/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to sync progress: ${response.status}`);
        }
    }

    getProblemStatus(problemId) {
        return this.userProgress[problemId] || 'not-started';
    }

    // Notes Management
    async setProblemNote(problemId, noteText) {
        // Update local state immediately
        if (noteText && noteText.trim()) {
            this.userNotes[problemId] = noteText;
        } else {
            delete this.userNotes[problemId];
        }
        this.saveUserNotes();
        
        // Show immediate feedback
        this.showToast('Notes saved successfully', 'success');
        
        // Sync with cloud if authenticated
        if (window.authManager && window.authManager.isAuthenticated()) {
            try {
                await this.syncNotesToCloud(problemId, noteText);
                console.log(`Notes synced to cloud: ${problemId}`);
                this.showSyncStatus(true);
            } catch (error) {
                console.error('Failed to sync notes to cloud:', error);
                this.showToast('Notes saved locally (cloud sync failed)', 'warning');
                this.showSyncStatus(false);
            }
        }
    }

    async syncNotesToCloud(problemId, noteText) {
        const response = await window.authManager.makeAuthenticatedRequest(`/api/notes/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify({ note_text: noteText || '' })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to sync notes: ${response.status}`);
        }
    }

    getProblemNote(problemId) {
        return this.userNotes[problemId] || '';
    }

    // Event Listeners
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterProblems();
        });

        // Filters
        ['category-filter', 'pattern-filter', 'status-filter', 'difficulty-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterProblems());
            }
        });

        // View controls
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        gridViewBtn?.addEventListener('click', () => this.setView('grid'));
        listViewBtn?.addEventListener('click', () => this.setView('list'));

        // Navigation
        const backToListBtn = document.getElementById('back-to-list');
        backToListBtn?.addEventListener('click', () => this.showProblemList());

        // Problem actions
        const markCompletedBtn = document.getElementById('mark-completed');
        const markInProgressBtn = document.getElementById('mark-in-progress');
        const openLeetCodeBtn = document.getElementById('open-leetcode');

        markCompletedBtn?.addEventListener('click', () => {
            if (this.currentProblem) {
                this.setProblemStatus(this.currentProblem.id, 'completed');
            }
        });

        markInProgressBtn?.addEventListener('click', () => {
            if (this.currentProblem) {
                this.setProblemStatus(this.currentProblem.id, 'in-progress');
            }
        });

        openLeetCodeBtn?.addEventListener('click', () => {
            if (this.currentProblem && this.currentProblem.url) {
                window.open(this.currentProblem.url, '_blank');
            }
        });

        // Quick actions
        const resetProgressBtn = document.getElementById('reset-progress');
        const exportProgressBtn = document.getElementById('export-progress');

        resetProgressBtn?.addEventListener('click', () => this.resetProgress());
        exportProgressBtn?.addEventListener('click', () => this.exportProgress());
    }

    // Authentication Event Listeners
    setupAuthEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const modalOverlay = document.getElementById('modal-overlay');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const loginModalClose = document.getElementById('login-modal-close');
        const registerModalClose = document.getElementById('register-modal-close');

        // Show modals
        loginBtn?.addEventListener('click', () => this.showLoginModal());
        registerBtn?.addEventListener('click', () => this.showRegisterModal());
        
        // Switch between modals
        showRegisterBtn?.addEventListener('click', () => this.showRegisterModal());
        showLoginBtn?.addEventListener('click', () => this.showLoginModal());
        
        // Close modals
        loginModalClose?.addEventListener('click', () => this.hideAuthModals());
        registerModalClose?.addEventListener('click', () => this.hideAuthModals());
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideAuthModals();
            }
        });
        
        // Logout
        logoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // Form submissions
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Notes Event Listeners
    setupNotesEventListeners() {
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        const saveNotesBtn = document.getElementById('save-notes');
        const cancelNotesBtn = document.getElementById('cancel-notes');
        const notesModalClose = document.getElementById('notes-modal-close');

        saveNotesBtn?.addEventListener('click', () => this.saveCurrentNotes());
        cancelNotesBtn?.addEventListener('click', () => this.hideNotesModal());
        notesModalClose?.addEventListener('click', () => this.hideNotesModal());
        
        notesModalOverlay?.addEventListener('click', (e) => {
            if (e.target === notesModalOverlay) {
                this.hideNotesModal();
            }
        });
    }

    // Filtering and Search
    filterProblems() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const patternFilter = document.getElementById('pattern-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const difficultyFilter = document.getElementById('difficulty-filter')?.value || '';

        this.filteredProblems = this.problems.filter(problem => {
            const matchesSearch = !searchTerm || 
                problem.title.toLowerCase().includes(searchTerm) ||
                problem.number.toString().includes(searchTerm) ||
                problem.category.toLowerCase().includes(searchTerm) ||
                problem.pattern.toLowerCase().includes(searchTerm);

            const matchesCategory = !categoryFilter || problem.category === categoryFilter;
            const matchesPattern = !patternFilter || problem.pattern === patternFilter;
            const matchesStatus = !statusFilter || this.getProblemStatus(problem.id) === statusFilter;
            const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;

            return matchesSearch && matchesCategory && matchesPattern && matchesStatus && matchesDifficulty;
        });

        this.renderProblems();
    }

    // UI Rendering
    populateFilters() {
        const categories = [...new Set(this.problems.map(p => p.category))].sort();
        const patterns = [...new Set(this.problems.map(p => p.pattern))].sort();

        this.populateSelect('category-filter', categories);
        this.populateSelect('pattern-filter', patterns);
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Keep the first option (All...)
        const firstOption = select.children[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    setView(view) {
        this.currentView = view;
        const container = document.getElementById('problems-container');
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');

        if (view === 'grid') {
            container?.classList.add('grid-view');
            container?.classList.remove('list-view');
            gridBtn?.classList.add('active');
            listBtn?.classList.remove('active');
        } else {
            container?.classList.add('list-view');
            container?.classList.remove('grid-view');
            listBtn?.classList.add('active');
            gridBtn?.classList.remove('active');
        }
    }

    renderProblems() {
        const container = document.getElementById('problems-container');
        if (!container) return;

        if (this.filteredProblems.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No problems found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProblems.map(problem => {
            const status = this.getProblemStatus(problem.id);
            const contentStatus = problem.has_content ? 
                '<i class="fas fa-check-circle content-available" title="Content available"></i>' : 
                '<i class="fas fa-clock content-in-progress" title="Content in progress"></i>';
            
            return `
                <div class="problem-card ${status}" data-problem-id="${problem.id}">
                    <div class="problem-header">
                        <div>
                            <div class="problem-title">
                                ${problem.title}
                                ${contentStatus}
                            </div>
                            <div class="problem-number">#${problem.number}</div>
                        </div>
                        <div class="problem-status status-${status}">
                            ${status.replace('-', ' ')}
                        </div>
                    </div>
                    <div class="problem-meta">
                        <span class="meta-tag category">${problem.category}</span>
                        <span class="meta-tag pattern">${problem.pattern}</span>
                        ${problem.difficulty ? `<span class="meta-tag difficulty-${problem.difficulty}">${problem.difficulty}</span>` : ''}
                    </div>
                    <div class="problem-description">
                        ${problem.description || 'Click to view full problem details and solution approaches.'}
                    </div>
                    <div class="problem-actions">
                        <button class="btn btn-sm btn-secondary notes-btn" data-problem-id="${problem.id}">
                            <i class="fas fa-sticky-note"></i>
                            ${this.getProblemNote(problem.id) ? 'Edit Notes' : 'Add Notes'}
                        </button>
                        <a href="${problem.url}" target="_blank" class="btn btn-sm btn-primary" title="View on LeetCode">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners to problem cards
        container.querySelectorAll('.problem-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger card click if clicking on action buttons
                if (e.target.closest('.problem-actions')) {
                    return;
                }
                
                const problemId = card.dataset.problemId;
                const problem = this.problems.find(p => p.id === problemId);
                if (problem) {
                    this.showProblemDetail(problem);
                }
            });
        });
        
        // Add click listeners to notes buttons
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

    showProblemDetail(problem) {
        this.currentProblem = problem;
        
        document.getElementById('problem-list-view').style.display = 'none';
        document.getElementById('problem-detail-view').style.display = 'block';

        const contentContainer = document.getElementById('problem-content');
        if (contentContainer) {
            // Render markdown content
            let renderedContent = '';
            if (problem.content && typeof marked !== 'undefined') {
                try {
                    renderedContent = marked.parse(problem.content);
                } catch (error) {
                    console.error('Error parsing markdown:', error);
                    renderedContent = `<pre>${problem.content}</pre>`;
                }
            } else {
                renderedContent = problem.content || '<p>Problem content will be loaded here...</p>';
            }

            contentContainer.innerHTML = `
                <div class="problem-meta-header">
                    <h1>${this.escapeHtml(problem.title)}</h1>
                    <div class="problem-meta">
                        <span class="meta-tag category">📂 ${this.escapeHtml(problem.category)}</span>
                        <span class="meta-tag pattern">🔧 ${this.escapeHtml(problem.pattern)}</span>
                        ${problem.difficulty ? `<span class="meta-tag difficulty-${problem.difficulty}">⭐ ${this.escapeHtml(problem.difficulty)}</span>` : ''}
                    </div>
                    <a href="${problem.url}" target="_blank" class="leetcode-link">
                        🔗 View on LeetCode
                    </a>
                    <div class="problem-detail-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.showNotesModal(app.currentProblem)">
                            <i class="fas fa-sticky-note"></i>
                            ${this.getProblemNote(problem.id) ? 'Edit Notes' : 'Add Notes'}
                        </button>
                    </div>
                </div>
                <hr>
                <div class="markdown-content">
                    ${renderedContent}
                </div>
            `;

            // Highlight code blocks after rendering
            if (typeof hljs !== 'undefined') {
                contentContainer.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        }

        // Update action buttons based on current status
        const status = this.getProblemStatus(problem.id);
        this.updateActionButtons(status);
    }

    // Helper function to escape HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    showProblemList() {
        document.getElementById('problem-detail-view').style.display = 'none';
        document.getElementById('problem-list-view').style.display = 'block';
        this.currentProblem = null;
    }

    updateActionButtons(status) {
        const markCompletedBtn = document.getElementById('mark-completed');
        const markInProgressBtn = document.getElementById('mark-in-progress');

        if (markCompletedBtn) {
            markCompletedBtn.classList.toggle('active', status === 'completed');
        }
        if (markInProgressBtn) {
            markInProgressBtn.classList.toggle('active', status === 'in-progress');
        }
    }

    // Statistics
    updateStats() {
        const totalCount = this.problems.length;
        const completedCount = this.problems.filter(p => 
            this.getProblemStatus(p.id) === 'completed'
        ).length;
        const progressPercentage = totalCount > 0 ? 
            Math.round((completedCount / totalCount) * 100) : 0;

        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
    }

    // Utility Functions
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

    // Add sync status indicator
    showSyncStatus(isOnline = true) {
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

    // Progress Management
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.userProgress = {};
            this.saveUserProgress();
            this.renderProblems();
            this.showToast('Progress reset successfully', 'success');
        }
    }

    exportProgress() {
        const data = {
            exportDate: new Date().toISOString(),
            totalProblems: this.problems.length,
            progress: this.userProgress,
            notes: this.userNotes,
            summary: {
                completed: this.problems.filter(p => this.getProblemStatus(p.id) === 'completed').length,
                inProgress: this.problems.filter(p => this.getProblemStatus(p.id) === 'in-progress').length,
                notStarted: this.problems.filter(p => this.getProblemStatus(p.id) === 'not-started').length
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leetcode-study-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Progress exported successfully', 'success');
    }

    // Authentication Modal Methods
    showLoginModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
        modalOverlay.style.display = 'flex';
        
        // Clear form
        document.getElementById('login-form').reset();
    }

    showRegisterModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
        modalOverlay.style.display = 'flex';
        
        // Clear form
        document.getElementById('register-form').reset();
    }

    hideAuthModals() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (!window.authManager) {
            this.showToast('Authentication system not available', 'error');
            return;
        }

        this.showLoading(true);
        const result = await window.authManager.login(username, password);
        
        if (result.success) {
            this.hideAuthModals();
            this.showToast(`Welcome back, ${result.user.username}!`, 'success');
            
            // Load user data from cloud after successful login
            await this.loadCloudData();
            this.renderProblems();
            this.updateStats();
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

        if (!window.authManager) {
            this.showToast('Authentication system not available', 'error');
            return;
        }

        this.showLoading(true);
        const result = await window.authManager.register(username, email, password);
        
        if (result.success) {
            this.hideAuthModals();
            this.showToast(`Welcome, ${result.user.username}! Account created successfully.`, 'success');
            
            // Sync any existing local data to cloud after registration
            await this.syncLocalDataToCloud();
            
            // Load fresh data from cloud
            await this.loadCloudData();
            this.renderProblems();
            this.updateStats();
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
        
        // Clear cloud data and reload from local storage
        this.userProgress = {};
        this.userNotes = {};
        this.loadLocalData();
        this.renderProblems();
        this.updateStats();
        this.showSyncStatus(false);
        
        this.showToast('Logged out successfully', 'success');
    }

    // Notes Modal Methods
    showNotesModal(problem) {
        if (!problem) return;
        
        this.currentProblem = problem;
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        const notesTextarea = document.getElementById('notes-textarea');
        const modalTitle = document.querySelector('#notes-modal .modal-header h3');
        
        modalTitle.textContent = `Notes for ${problem.title}`;
        notesTextarea.value = this.getProblemNote(problem.id);
        notesModalOverlay.style.display = 'flex';
        
        // Focus on textarea
        setTimeout(() => notesTextarea.focus(), 100);
    }

    hideNotesModal() {
        const notesModalOverlay = document.getElementById('notes-modal-overlay');
        notesModalOverlay.style.display = 'none';
        this.currentProblem = null;
    }

    async saveCurrentNotes() {
        if (!this.currentProblem) return;
        
        const notesTextarea = document.getElementById('notes-textarea');
        const noteText = notesTextarea.value.trim();
        
        await this.setProblemNote(this.currentProblem.id, noteText);
        this.hideNotesModal();
        
        // Update UI if we're viewing the problem detail
        const problemDetailView = document.getElementById('problem-detail-view');
        if (problemDetailView.style.display !== 'none') {
            this.showProblemDetail(this.currentProblem);
        }
        
        // Re-render problems to update notes buttons
        this.renderProblems();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyGuideApp();
});

// Make updateStats globally accessible for auth manager
window.updateStats = function() {
    if (window.app) {
        window.app.updateStats();
    }
};

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
