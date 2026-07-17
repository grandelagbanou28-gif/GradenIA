# Changelog

Toutes les changements notables de Graden IA seront documentes ici.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adherer au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2026-07-17

### Ajoute

- Interface de chat IA complete basee sur Open WebUI
- Integration Ollama pour les modeles locaux
- Support Gemini API pour les modeles distants
- Upload de dossiers pour analyse de code
- Application desktop Windows avec pywebview
- Configuration en francais par defaut
- Mode sombre/clair
- Support de multiples modeles IA :
  - Qwen 2.5 (0.5b, 1.5b, 7b)
  - Llama 3.1 8b
  - Gemma 3 1b
  - Granite 4.1 Guardian 8b
  - MiniCPM v4.6
- Interface multilingue (40+ langues)
- Systeme d'authentification utilisateur
- Gestion des conversations
- Recherche dans les conversations
- Support des fichiers et images
- RAG (Retrieval-Augmented Generation)
- Fonctions outils (tool calling)
- Personnalisation de l'interface

### Corrige

- Renommage complet de "Open WebUI" vers "Graden IA"
- Remplacement de toutes les references a Open WebUI
- Correction des favicons et logos
- Optimisation pour fonctionner sans GPU

### Securite

- Retrait des cles API du code source
- Gestion des variables d'environnement
- Configuration securisee par defaut

## [0.1.0] - 2026-07-01

### Ajoute

- Premiere version beta
- Base de code Open WebUI
- Integration Ollama de base
