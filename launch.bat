@echo off
title Graden IA - Demarrage...
color 0B

echo.
echo  ========================================
echo     GRADEN IA - Assistant IA Personnel
echo  ========================================
echo.

echo [1/3] Verification d'Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Demarrage d'Ollama...
    start "" ollama serve
    timeout /t 3 /nobreak >NUL
) else (
    echo [OK] Ollama est deja en cours d'execution
)

echo.
echo [2/3] Verification des modeles...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Attente du demarrage d'Ollama...
    timeout /t 5 /nobreak >NUL
)

echo.
echo [3/3] Demarrage de Graden IA...
echo.

cd /d "%~dp0"
python launch.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] Le demarrage a echoue.
    echo Verifiez que Python et les dependances sont installes.
    echo.
    pause
)
