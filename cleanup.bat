@echo off
REM Studious - System Cleanup and Optimization Script (Windows)

echo 🧹 Starting Studious System Cleanup...

REM Remove any temporary files
if exist "*.tmp" del /q "*.tmp" 2>nul
if exist "*.log" del /q "*.log" 2>nul

REM Check for and remove any duplicate test files
if exist "test-integration.js" if exist "tests\test-main-app-console.js" (
    echo 📁 Removing duplicate test files...
    del /q "test-integration.js" 2>nul
)

REM Validate critical files exist
echo 🔍 Validating critical files...

set CRITICAL_FILES=index.html assets\js\controllers\AppController.js assets\js\models\LocalLLMProvider.js assets\js\models\AIFlashcardGenerator.js assets\js\controllers\SmartScheduleController.js assets\css\styles.css

for %%f in (%CRITICAL_FILES%) do (
    if exist "%%f" (
        echo ✅ %%f
    ) else (
        echo ❌ Missing: %%f
    )
)

REM Count files in each directory
echo.
echo 📊 Project Statistics:
for /f %%i in ('dir /b assets\js\controllers\*.js 2^>nul ^| find /c /v ""') do echo Controllers: %%i
for /f %%i in ('dir /b assets\js\models\*.js 2^>nul ^| find /c /v ""') do echo Models: %%i
for /f %%i in ('dir /b assets\js\views\*.js 2^>nul ^| find /c /v ""') do echo Views: %%i
for /f %%i in ('dir /b tests\* 2^>nul ^| find /c /v ""') do echo Tests: %%i
for /f %%i in ('dir /b docs\* 2^>nul ^| find /c /v ""') do echo Documentation: %%i

REM Check for Ollama server
echo.
echo 🔗 Checking Ollama server...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Ollama server is running
    
    REM Check for llama3.2:3b model
    curl -s http://localhost:11434/api/tags | findstr "llama3.2:3b" >nul 2>&1
    if %errorlevel%==0 (
        echo ✅ llama3.2:3b model available
    ) else (
        echo ⚠️ llama3.2:3b model not found - run: ollama pull llama3.2:3b
    )
) else (
    echo ❌ Ollama server not running - run: ollama serve
)

echo.
echo 🎉 Cleanup complete! System ready for use.
echo 🚀 To start: Open index.html in your browser or run the development server
pause
