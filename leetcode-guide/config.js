// Configuration Management
// This file handles environment-specific configuration for the frontend

class Config {
    constructor() {
        // Try to load from environment variables (if available via build process)
        // or fall back to default values for development
        this.apiBaseUrl = this.getEnvVar('API_BASE_URL') || this.getEnvVar('VITE_API_BASE_URL') || 'http://localhost:8787';
        this.environment = this.getEnvVar('NODE_ENV') || 'development';
        
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
            console.warn('⚠️  API_BASE_URL not configured. Using default localhost URL.');
            console.warn('   Set VITE_API_BASE_URL environment variable for production.');
        }
        
        if (this.environment === 'production' && this.apiBaseUrl.includes('localhost')) {
            console.error('❌ Production build detected but API_BASE_URL points to localhost!');
            console.error('   Please set VITE_API_BASE_URL to your production API URL.');
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

    // Method to override config for manual setup (fallback)
    setApiBaseUrl(url) {
        console.log(`🔧 Manually setting API Base URL to: ${url}`);
        this.apiBaseUrl = url;
    }
}

// Create global configuration instance
const config = new Config();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

// Make available globally
window.config = config;

// Log configuration on load
console.log('🚀 Configuration loaded:', {
    apiBaseUrl: config.getApiBaseUrl(),
    environment: config.getEnvironment()
});

export default config;
