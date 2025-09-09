@echo off
echo 🧪 Testing Local LLM Connection
echo ===============================
echo.

echo 📡 Checking for Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Ollama is running!
    echo.
    echo 📋 Available models:
    curl -s http://localhost:11434/api/tags | findstr name
    echo.
) else (
    echo ❌ Ollama not running on port 11434
)

echo 📡 Checking for LM Studio...
curl -s http://localhost:1234/v1/models >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ LM Studio is running!
) else (
    echo ❌ LM Studio not running on port 1234
)

echo 📡 Checking for GPT4All...
curl -s http://localhost:4891/v1/models >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ GPT4All is running!
) else (
    echo ❌ GPT4All not running on port 4891
)

echo.
if %errorlevel% == 0 (
    echo 🎉 Local LLM detected! Your app should work with local AI.
) else (
    echo 💡 No local LLMs detected. Run setup-local-llm.bat to install.
)

echo.
echo 🚀 Start your app and check the browser console for AI provider status.
echo.
pause
