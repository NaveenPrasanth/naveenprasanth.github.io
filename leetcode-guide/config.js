// Configuration Management
// This file handles environment-specific configuration for the frontend

class Config {
    constructor() {
        // Check if we're running on GitHub Pages or similar production environment
        const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' && 
                           !window.location.hostname.includes('localhost');
        
        // Try to load from environment variables (if available via build process)
        // For production, use your deployed Cloudflare Worker URL
        this.apiBaseUrl = this.getEnvVar('API_BASE_URL') || 
                         this.getEnvVar('VITE_API_BASE_URL') || 
                         (isProduction ? 'https://leetcode-study-api.npsleetcode.workers.dev' : 'http://localhost:8787');
        
        this.environment = this.getEnvVar('NODE_ENV') || (isProduction ? 'production' : 'development');
        
        // Debug logging to help identify the issue
        console.log('🔍 Configuration Debug Info:', {
            hostname: window.location.hostname,
            isProduction: isProduction,
            apiBaseUrl: this.apiBaseUrl,
            environment: this.environment
        });
        
        // Set offline mode only if API URL is explicitly null or empty
        this.offlineMode = !this.apiBaseUrl || this.apiBaseUrl.trim() === '';
        
        // Validate required configuration
        this.validateConfig();
    }

    getEnvVar(key) {
        // Check for environment variables in different formats
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || process.env[`VITE_${key}`];
        }
        
        // Check for Vite-style environment variables
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env[`VITE_${key}`] || import.meta.env[key];
        }
        
        // Check for webpack-style environment variables
        if (typeof __ENV__ !== 'undefined') {
            return __ENV__[key];
        }
        
        return null;
    }

    validateConfig() {
        if (!this.apiBaseUrl) {
            console.warn('⚠️  Running in OFFLINE MODE - no API configured.');
            console.warn('   Authentication and cloud sync features will be disabled.');
            console.warn('   To enable cloud features, set VITE_API_BASE_URL environment variable.');
        } else if (this.environment === 'production' && this.apiBaseUrl && this.apiBaseUrl.includes('localhost')) {
            console.error('❌ Production build detected but API_BASE_URL points to localhost!');
            console.error('   Please set VITE_API_BASE_URL to your production API URL.');
            // Override to offline mode for safety
            this.apiBaseUrl = null;
            this.offlineMode = true;
        } else if (this.apiBaseUrl) {
            console.log('✅ CLOUD MODE - Connected to API:', this.apiBaseUrl);
            console.log('   Authentication and cloud sync features are enabled.');
            this.offlineMode = false;
        }
    }

    // Getter methods for easy access
    getApiBaseUrl() {
        return this.apiBaseUrl;
    }

    getEnvironment() {
        return this.environment;
    }

    isProduction() {
        return this.environment === 'production';
    }

    isDevelopment() {
        return this.environment === 'development';
    }

    isOfflineMode() {
        return this.offlineMode;
    }

    // Method to override config for manual setup (fallback)
    setApiBaseUrl(url) {
        console.log(`🔧 Manually setting API Base URL to: ${url}`);
        this.apiBaseUrl = url;
        this.offlineMode = !url;
    }

    // Method to enable offline mode explicitly
    enableOfflineMode() {
        console.log('🔧 Enabling offline mode - disabling cloud features');
        this.apiBaseUrl = null;
        this.offlineMode = true;
    }
}

// Create global configuration instance
const config = new Config();

// Export for CommonJS modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

// Make available globally for browser usage
window.config = config;

// Log configuration on load
console.log('🚀 Configuration loaded:', {
    apiBaseUrl: config.getApiBaseUrl() || 'OFFLINE MODE',
    environment: config.getEnvironment(),
    offlineMode: config.isOfflineMode()
});

// Note: Removed ES6 export default to work with regular script tags
