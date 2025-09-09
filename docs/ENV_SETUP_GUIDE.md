# 🔧 Environment Setup for AI LLMs

## **Quick Answer: You have 3 options!**

### 🚀 **Option 1: No Environment Setup (Easiest)**
**Just use the browser interface - no env file needed!**

1. Open your app at `http://localhost:8082`
2. Go to Configuration or Settings
3. Enter your API keys directly in the web interface
4. Keys are saved to browser local storage

### 🔒 **Option 2: Environment File (Recommended for Security)**

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file with your actual API keys:**
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key-here
   GOOGLE_API_KEY=your-actual-google-key-here
   DEFAULT_AI_PROVIDER=openai
   ```

3. **The app will automatically detect and use these keys**

### ⚡ **Option 3: Direct Configuration (Quick Testing)**

Edit `assets/js/models/EnvironmentConfig.js` and add your keys directly:

```javascript
loadFromConfig() {
    return {
        openai: 'sk-your-actual-openai-key-here',
        anthropic: 'sk-ant-your-actual-anthropic-key-here',
        google: 'your-actual-google-key-here',
        defaultProvider: 'openai'
    };
}
```

## **🔑 Where to Get API Keys:**

| Provider | Get Your Key Here | Free Tier |
|----------|-------------------|-----------|
| **OpenAI** | https://platform.openai.com/api-keys | $5 free credit |
| **Anthropic** | https://console.anthropic.com/ | $5 free credit |
| **Google Gemini** | https://makersuite.google.com/app/apikey | Free quota |

## **✨ Demo Mode**

**Don't have API keys yet?** No problem! 

The app automatically runs in **Demo Mode** and generates intelligent sample flashcards without any API keys. You can test all features immediately!

## **🔄 Priority System**

The app checks for API keys in this order:
1. Environment variables (`.env` file)
2. Browser local storage (user input)  
3. Direct configuration (hardcoded)
4. Demo mode (if no keys found)

---

**🎯 Recommendation:** Start with **Option 1** (browser interface) for immediate testing, then move to **Option 2** (.env file) for production use.
