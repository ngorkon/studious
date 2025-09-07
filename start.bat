@echo off
REM Quick start script for Windows

echo 🚀 Starting Studious - Ultimate Study Companion
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found
    python dev-server.py
) else (
    echo ❌ Python not found. Please install Python 3.x
    echo 📥 Download from: https://python.org/downloads
    echo.
    echo Alternative: Open index.html directly in your browser
    echo 📂 File location: %CD%\index.html
    pause
)
