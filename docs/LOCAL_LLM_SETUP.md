# Local LLM Setup Guide

## 🏠 **Running LLMs Locally - No API Keys Needed!**

### 🚀 **Option 1: Ollama (Recommended - Easiest)**

1. **Install Ollama:**
   ```bash
   # Download from: https://ollama.ai/
   # Or using winget on Windows:
   winget install Ollama.Ollama
   ```

2. **Download a model:**
   ```bash
   # For general use (4GB):
   ollama pull llama2:7b
   
   # For better quality (8GB):
   ollama pull llama2:13b
   
   # For code/technical content (4GB):
   ollama pull codellama:7b
   
   # For latest model (4GB):
   ollama pull llama3:8b
   ```

3. **Start Ollama server:**
   ```bash
   ollama serve
   ```

4. **Test it works:**
   ```bash
   ollama run llama2:7b "Generate a flashcard about photosynthesis"
   ```

### ⚡ **Option 2: LM Studio (GUI Interface)**

1. **Download LM Studio:** https://lmstudio.ai/
2. **Install and launch**
3. **Download a model** from the interface (e.g., Llama 2 7B)
4. **Start local server** in LM Studio
5. **Use OpenAI-compatible API** at `http://localhost:1234`

### 🔧 **Option 3: GPT4All (Lightweight)**

1. **Download GPT4All:** https://gpt4all.io/
2. **Install and run**
3. **Download a model** (e.g., Mistral 7B)
4. **Enable API server** in settings

## 📊 **Model Recommendations for Study App:**

| Model | Size | Best For | Quality |
|-------|------|----------|---------|
| **Llama 3:8B** | 4GB | General flashcards | ⭐⭐⭐⭐⭐ |
| **Mistral:7B** | 4GB | Academic content | ⭐⭐⭐⭐ |
| **CodeLlama:7B** | 4GB | Technical subjects | ⭐⭐⭐⭐ |
| **Phi-3:mini** | 2GB | Quick responses | ⭐⭐⭐ |

## 🎯 **Hardware Requirements:**

- **Minimum:** 8GB RAM, integrated graphics
- **Recommended:** 16GB RAM, dedicated GPU
- **Optimal:** 32GB RAM, RTX 3060+ or Apple M1+

---

**Next:** I'll integrate local LLM support into your app!
