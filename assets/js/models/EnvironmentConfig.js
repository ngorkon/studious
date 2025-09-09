// Environment Configuration for AI APIs
// This provides multiple ways to configure your AI API keys

class EnvironmentConfig {
    constructor() {
        this.config = {
            // Option 1: Environment variables (if running in Node.js environment)
            fromEnv: this.loadFromEnvironment(),
            
            // Option 2: Local storage (browser-based, user enters keys)
            fromStorage: this.loadFromStorage(),
            
            // Option 3: Configuration file (you can modify this directly)
            fromConfig: this.loadFromConfig()
        };
    }

    loadFromEnvironment() {
        // This works if you're running in a Node.js environment
        if (typeof process !== 'undefined' && process.env) {
            return {
                openai: process.env.OPENAI_API_KEY,
                anthropic: process.env.ANTHROPIC_API_KEY,
                google: process.env.GOOGLE_API_KEY,
                defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'openai'
            };
        }
        return {};
    }

    loadFromStorage() {
        // Browser local storage
        try {
            return {
                openai: localStorage.getItem('ai_openai_key'),
                anthropic: localStorage.getItem('ai_anthropic_key'),
                google: localStorage.getItem('ai_google_key'),
                defaultProvider: localStorage.getItem('ai_default_provider') || 'openai'
            };
        } catch (error) {
            console.warn('Local storage not available:', error);
            return {};
        }
    }

    loadFromConfig() {
        // Direct configuration - you can edit these values
        // IMPORTANT: Don't commit real API keys to version control!
        return {
            openai: '', // Add your OpenAI API key here
            anthropic: '', // Add your Anthropic API key here  
            google: '', // Add your Google API key here
            defaultProvider: 'openai'
        };
    }

    getAPIKeys() {
        // Priority: Environment > Storage > Config
        const env = this.config.fromEnv;
        const storage = this.config.fromStorage;
        const config = this.config.fromConfig;

        return {
            openai: env.openai || storage.openai || config.openai,
            anthropic: env.anthropic || storage.anthropic || config.anthropic,
            google: env.google || storage.google || config.google,
            defaultProvider: env.defaultProvider || storage.defaultProvider || config.defaultProvider
        };
    }

    setAPIKey(provider, key) {
        // Save to local storage
        try {
            localStorage.setItem(`ai_${provider}_key`, key);
            return true;
        } catch (error) {
            console.error('Failed to save API key:', error);
            return false;
        }
    }

    setDefaultProvider(provider) {
        try {
            localStorage.setItem('ai_default_provider', provider);
            return true;
        } catch (error) {
            console.error('Failed to save default provider:', error);
            return false;
        }
    }

    hasAnyAPIKey() {
        const keys = this.getAPIKeys();
        return !!(keys.openai || keys.anthropic || keys.google);
    }

    getAvailableProviders() {
        const keys = this.getAPIKeys();
        const providers = [];
        
        if (keys.openai) providers.push('openai');
        if (keys.anthropic) providers.push('anthropic');
        if (keys.google) providers.push('google');
        
        return providers;
    }
}

// Export for use in other modules
window.EnvironmentConfig = EnvironmentConfig;

// Create global instance
window.envConfig = new EnvironmentConfig();
