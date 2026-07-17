@echo off
echo Configuration de Graden IA pour demarrage automatique...

REM Creer le raccourci sur le Bureau
set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=%DESKTOP%\Graden IA.bat

echo @echo off > "%SHORTCUT%"
echo title Graden IA >> "%SHORTCUT%"
echo cd /d "%SCRIPT_DIR%" >> "%SHORTCUT%"
echo call start-graden.bat >> "%SHORTCUT%"

echo Raccourci cree sur le Bureau: %SHORTCUT%

REM Ajouter Ollama au demarrage automatique
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set OLLAMA_LINK=%STARTUP%\ollama-serve.bat

echo @echo off > "%OLLAMA_LINK%"
echo start "" /MIN ollama serve >> "%OLLAMA_LINK%"

echo Ollama configure pour demarrer automatiquement!

echo.
echo ========================================
echo    Configuration terminee!
echo    - Raccourci Bureau: Graden IA
echo    - Ollama demarrera automatiquement
echo ========================================
pause
