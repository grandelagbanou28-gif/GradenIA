@echo off
title Graden IA - Intelligence Artificielle
color 0A
echo.
echo  ==========================================
echo     GRADEN IA - Demarrage en cours...
echo  ==========================================
echo.

REM Demarrer Ollama en arriere-plan
echo [1/2] Demarrage d'Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    start "" /MIN ollama serve
    timeout /t 5 /nobreak >nul
    echo      Ollama demarre!
) else (
    echo      Ollama deja actif.
)

echo.
echo [2/2] Lancement de Graden IA...
echo.
echo  ------------------------------------------
echo   Interface: http://localhost:8080
echo   Modeles Ollama connectes
echo   APIs: OpenRouter, Gemini
echo  ------------------------------------------
echo.

REM Lancer Graden IA
cd /d "C:\MES PROJETS WEB\AGBANOU GRANDEL GENERAL\iagraden\Graden IA"
".\.venv\Scripts\python.exe" launch.py

pause
