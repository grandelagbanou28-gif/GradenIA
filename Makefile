# ===========================================
# Grden IA - Fichier de configuration Make
# ===========================================

.PHONY: help install build start stop restart clean dev

# Configuration
PYTHON = python
PIP = pip
NPM = npm
PORT = 8080

help: ## Afficher cette aide
	@echo "Grden IA - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installer toutes les dependances
	$(PYTHON) -m venv .venv
	.venv\Scripts\activate && $(PIP) install -r requirements.txt
	$(NPM) install

build: ## Compiler le frontend
	$(NPM) run build

start: ## Demarrer Grden IA
	$(PYTHON) launch.py

dev: ## Demarrer en mode developpement
	$(NPM) run dev &
	$(PYTHON) launch.py

stop: ## Arreter le serveur
	@taskkill /IM python.exe /F 2>nul || true
	@echo "Serveur arrete"

clean: ## Nettoyer les fichiers temporaires
	@rmdir /S /Q node_modules 2>nul || true
	@rmdir /S /Q .svelte-kit 2>nul || true
	@rmdir /S /Q build 2>nul || true
	@del /Q *.pyc 2>nul || true
	@echo "Nettoyage termine"

status: ## Verifier l'etat du serveur
	@curl -s http://localhost:$(PORT) >nul 2>&1 && echo "Grden IA est en cours d'execution sur http://localhost:$(PORT)" || echo "Grden IA n'est pas en cours d'execution"

logs: ## Afficher les logs
	@echo "Logs en temps reel..."
	@tail -f logs/*.log 2>nul || echo "Pas de logs disponibles"

update: ## Mettre a jour les dependances
	$(PIP) install --upgrade -r requirements.txt
	$(NPM) update
	$(NPM) run build
