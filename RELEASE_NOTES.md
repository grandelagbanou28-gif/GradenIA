# Grden IA - Notes de version

## Version 1.0.0 (2026-07-17)

### Nouveautes

- **Interface de chat IA** : Interface moderne et intuitive pour discuter avec des modeles IA
- **Integration Ollama** : Support complet des modeles locaux via Ollama
- **Support Gemini API** : Connexion directe a Google Gemini pour les modeles distants
- **Upload de dossiers** : Analysez des projets entiers en un clic
- **Application desktop** : Fenetre native Windows avec pywebview
- **Configuration francaise** : Interface et messages en francais par defaut
- **Mode sombre/clair** : Double theme pour le confort visuel
- **Multi-modeles** : Support de Qwen, Llama, Gemma, Granite et plus
- **Authentification** : Systeme de comptes utilisateurs securise
- **Conversations** : Gestion complete des historiques de chat
- **Recherche** : Recherche rapide dans les conversations
- **Fichiers** : Support des uploads de fichiers et images
- **RAG** : Retrieval-Augmented Generation pour la recherche documentaire
- **Tool Calling** : Fonctions outils pour les modeles compatibles

### Ameliorations

- Renommage complet de "Open WebUI" vers "Grden IA"
- Remplacement de toutes les logos et favicons
- Optimisation pour fonctionner sans GPU
- Gestion securisee des cles API via variables d'environnement
- Documentation complete en francais

### Corrections

- Correction des erreurs de connexion Ollama
- Amelioration de la stabilite
- Correction des problèmes d'affichage

### Securite

- Retrait des cles API du code source
- Gestion securisee des secrets
- Validation des entrees utilisateur

## Comment mettre a jour

### Depuis une version precedente

```bash
# Sauvegarder les donnees
cp -r data data-backup

# Mettre a jour le code
git pull origin main

# Reinstaller les dependances
pip install -r requirements.txt
npm install
npm run build

# Restaurer les donnees
cp -r data-backup data
```

### Depuis Docker

```bash
# Arreter le serveur
docker-compose down

# Mettre a jour le code
git pull origin main

# Rebuild et relancer
docker-compose up -d --build
```

## Problemes connus

- Les modeles de plus de 8GB sont lents sans GPU
- L'upload de tres gros fichiers peut etre lent
- Le mode hors ligne n'est pas encore disponible

## Support

Pour toute problematique, consultez :
- [Documentation](https://github.com/grandelagbanou28-gif/GrdenIA/blob/main/README.md)
- [Guide de depannage](https://github.com/grandelagbanou28-gif/GrdenIA/blob/main/SUPPORT.md)
- [Issues](https://github.com/grandelagbanou28-gif/GrdenIA/issues)
