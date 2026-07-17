<div align="center">

# 🤖 Graden IA

### Votre assistant IA personnel intelligent

**Interface de chat IA moderne, rapide et entièrement personnalisable**

[![GitHub stars](https://img.shields.io/github/stars/grandelagbanou28-gif/GradenIA?style=social)](https://github.com/grandelagbanou28-gif/GradenIA/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/grandelagbanou28-gif/GradenIA)](https://github.com/grandelagbanou28-gif/GradenIA/issues)
[![GitHub license](https://img.shields.io/github/license/grandelagbanou28-gif/GradenIA)](https://github.com/grandelagbanou28-gif/GradenIA/blob/main/LICENSE)
[![GitHub forks](https://img.shields.io/github/forks/grandelagbanou28-gif/GradenIA?style=social)](https://github.com/grandelagbanou28-gif/GradenIA/network/members)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [🔧 Technologies](#-technologies)
- [📸 Captures d'écran](#-captures-décran)
- [🤝 Contribuer](#-contribuer)
- [📄 Licence](#-licence)

---

## 🎯 À propos

**Graden IA** est une interface de chat IA puissante et élégante, basée sur Open WebUI et entièrement personnalisée. Elle vous permet de:

- 💬 Discuter avec des modèles IA locaux (Ollama) ou distants (Gemini, OpenAI)
- 📁 Analyser et discuter de vos fichiers et dossiers
- 🎨 Profiter d'une interface moderne et intuitive
- 🔒 Garder le contrôle total de vos données (100% local)

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| 🧠 **Multi-modèles** | Utilisez Qwen, Llama, Gemma, Granite et plus |
| 📂 **Upload de dossiers** | Analysez des projets entiers en un clic |
| 🌍 **Multilingue** | Interface en français, anglais et 40+ langues |
| 🔌 **Gemini API** | Connexion directe à Google Gemini |
| 🖥️ **Application desktop** | Fenêtre native Windows (pas de navigateur) |
| 🎨 **Interface moderne** | Design épuré avec mode sombre/clair |
| 🔒 **100% local** | Vos données ne quittent jamais votre PC |
| ⚡ **Rapide** | Optimisé pour fonctionner sans GPU |

---

## 🚀 Démarrage rapide

### Prérequis

- Windows 10/11
- [Ollama](https://ollama.com) installé
- [Python 3.12+](https://python.org)
- [Node.js 22+](https://nodejs.org)

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/grandelagbanou28-gif/GradenIA.git
cd GradenIA

# 2. Installer les dépendances Python
pip install -r requirements.txt

# 3. Installer les dépendances Node.js
npm install

# 4. Build du frontend
npm run build

# 5. Lancer l'application
python launch.py
```

### Utilisation rapide

1. Double-cliquez sur `launch.bat`
2. Créez un compte ou connectez-vous
3. Sélectionnez un modèle IA
4. Commencez à discuter !

---

## 📦 Installation

### Option 1: Installation manuelle

```bash
# Cloner
git clone https://github.com/grandelagbanou28-gif/GradenIA.git
cd GradenIA

# Environnement virtuel
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Dépendances
pip install -r requirements.txt
npm install
npm run build

# Lancer
python launch.py
```

### Option 2: Application Desktop

```bash
# Installer les dépendances desktop
pip install pywebview

# Lancer via le raccourci bureau
# Ou manuellement:
python graden_desktop.py
```

---

## ⚙️ Configuration

### Modèles IA recommandés

| Modèle | Taille | Vitesse | Qualité |
|--------|--------|---------|---------|
| `qwen2.5:0.5b` | 397 MB | ⚡⚡⚡ | ⭐⭐ |
| `qwen2.5-coder:1.5b` | 986 MB | ⚡⚡⚡ | ⭐⭐⭐ |
| `qwen2.5:7b` | 4.4 GB | ⚡ | ⭐⭐⭐⭐ |
| `llama3.1:8b` | 4.7 GB | ⚡ | ⭐⭐⭐⭐ |
| `minicpm-v4.6` | 1.6 GB | ⚡⚡ | ⭐⭐⭐⭐ |

### Configuration Gemini API

1. Obtenez une clé API sur [Google AI Studio](https://aistudio.google.com/apikey)
2. Dans l'app, allez dans **Admin Settings → Connections**
3. Ajoutez votre clé API Gemini

### Variables d'environnement

```bash
# .env
WEBUI_NAME=Graden IA
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=votre-cle-secrete
```

---

## 🔧 Technologies

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-4-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-local-000000?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📸 Captures d'écran

<div align="center">

| Chat Principal | Sélection de Modèle | Interface Sombre |
|----------------|--------------------|--------------------|
| ![Chat](static/assets/images/terminal.jpg) | ![Models](static/assets/images/code.jpg) | ![Dark](static/assets/images/hacker.jpg) |

</div>

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. **Push** (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Signaler un bug

Utilisez la section [Issues](https://github.com/grandelagbanou28-gif/GradenIA/issues) pour signaler des bugs ou proposer des améliorations.

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Crédits

Basé sur [Open WebUI](https://github.com/open-webui/open-webui) - Une excellente plateforme pour les interfaces IA.

---

<div align="center">

**Fait avec ❤️ par [Grandel Agbanou](https://github.com/grandelagbanou28-gif)**

⭐ Starz ce projet si vous l'avez trouvé utile !

</div>
