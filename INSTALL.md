# Grden IA - Scripts d'installation

## Windows (install.bat)

```batch
@echo off
title Installation de Grden IA
color 0A

echo.
echo  ========================================
echo     Installation de Grden IA
echo  ========================================
echo.

echo [1/5] Verification de Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installe.
    Telechargez-le sur https://python.org
    pause
    exit /b 1
)
echo [OK] Python detecte

echo.
echo [2/5] Verification de Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe.
    Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js detecte

echo.
echo [3/5] Verification d'Ollama...
ollama --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Ollama n'est pas installe.
    Telechargez-le sur https://ollama.com
    echo Installation d'Ollama...
    curl -fsSL https://ollama.com/install.sh | sh
)
echo [OK] Ollama detecte

echo.
echo [4/5] Installation des dependances Python...
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

echo.
echo [5/5] Installation des dependances Node.js...
npm install
npm run build

echo.
echo  ========================================
echo     Installation terminee !
echo  ========================================
echo.
echo Pour lancer Grden IA, double-cliquez sur launch.bat
echo.
pause
```

## Linux/Mac (install.sh)

```bash
#!/bin/bash

echo ""
echo "  ========================================"
echo "     Installation de Grden IA"
echo "  ========================================"
echo ""

# Verification de Python
echo "[1/5] Verification de Python..."
if ! command -v python3 &> /dev/null; then
    echo "[ERREUR] Python3 n'est pas installe."
    echo "Installez-le avec : sudo apt install python3 python3-pip"
    exit 1
fi
echo "[OK] Python detecte"

# Verification de Node.js
echo ""
echo "[2/5] Verification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installe."
    echo "Installez-le avec : sudo apt install nodejs npm"
    exit 1
fi
echo "[OK] Node.js detecte"

# Verification d'Ollama
echo ""
echo "[3/5] Verification d'Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "[INFO] Ollama n'est pas installe."
    echo "Installation d'Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi
echo "[OK] Ollama detecte"

# Installation des dependances Python
echo ""
echo "[4/5] Installation des dependances Python..."
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Installation des dependances Node.js
echo ""
echo "[5/5] Installation des dependances Node.js..."
npm install
npm run build

echo ""
echo "  ========================================"
echo "     Installation terminee !"
echo "  ========================================"
echo ""
echo "Pour lancer Grden IA : ./launch.sh"
echo ""
```
