@echo off
echo 🚀 Local LLM Setup for Studious App
echo ===================================
echo.

echo 📋 This script will help you set up local LLMs for your study app.
echo.

echo 🎯 Recommended Option: Ollama (Easiest)
echo.
echo 1. Download Ollama from: https://ollama.ai/
echo 2. Install and run it
echo 3. Open a new command prompt and run these commands:
echo.
echo    ollama pull llama3:8b
echo    ollama pull mistral:7b
echo.
echo 4. Start the Ollama server:
echo    ollama serve
echo.
echo 5. Your app will automatically detect and use local LLMs!
echo.

echo 💡 Alternative Options:
echo.
echo 🎨 LM Studio (GUI Interface):
echo    - Download: https://lmstudio.ai/
echo    - Great for beginners with visual interface
echo.
echo 🔧 GPT4All (Lightweight):
echo    - Download: https://gpt4all.io/
echo    - Good for lower-end hardware
echo.

echo 📊 Model Recommendations:
echo.
echo   Model          Size    Best For
echo   ============== ======= ====================
echo   Llama 3:8B     4GB     General flashcards
echo   Mistral:7B     4GB     Academic content
echo   CodeLlama:7B   4GB     Technical subjects
echo   Phi-3:mini     2GB     Quick responses
echo.

echo 💻 Hardware Requirements:
echo   - Minimum: 8GB RAM
echo   - Recommended: 16GB RAM + GPU
echo.

echo 🔧 Quick Ollama Installation:
if exist "%LOCALAPPDATA%\Programs\Ollama" (
    echo ✅ Ollama appears to be installed!
    echo.
    echo Starting Ollama...
    start "" "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    echo.
    echo 📥 Installing recommended models...
    timeout /t 3 /nobreak >nul
    ollama pull llama3:8b
    ollama pull mistral:7b
    echo.
    echo ✅ Setup complete! Your app can now use local LLMs.
) else (
    echo ❌ Ollama not found.
    echo.
    echo Please install Ollama manually:
    echo 1. Go to: https://ollama.ai/
    echo 2. Download and install
    echo 3. Run this script again
)

echo.
echo 🎉 Once installed, your flashcard app will:
echo    ✅ Automatically detect local LLMs
echo    ✅ Generate flashcards privately on your machine
echo    ✅ Work without internet or API keys
echo    ✅ Be completely free to use
echo.

pause
