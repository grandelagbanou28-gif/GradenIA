# Grden IA - Architecture technique

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    Grden IA                                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Svelte)     │  Backend (FastAPI)                  │
│  ├─ Components         │  ├─ Routers                        │
│  │  ├─ Chat            │  │  ├─ chat.py                     │
│  │  ├─ Settings        │  │  ├─ ollama.py                   │
│  │  ├─ Auth            │  │  ├─ graden.py                   │
│  │  └─ Admin           │  │  └─ files.py                    │
│  ├─ Stores             │  ├─ Models                         │
│  │  ├─ chat.ts         │  │  ├─ User.py                     │
│  │  ├─ user.ts         │  │  ├─ Chat.py                     │
│  │  └─ config.ts       │  │  └─ Config.py                   │
│  └─ APIs               │  ├─ Utils                          │
│     ├─ chat.ts         │  │  ├─ payload.py                  │
│     ├─ ollama.ts       │  │  └─ security.py                 │
│     └─ graden.ts       │  └─ Main (app.py)                  │
├─────────────────────────────────────────────────────────────┤
│                    Ollama                                    │
│  ├─ Modeles locaux                                             │
│  ├─ API REST                                                  │
│  └─ Gestion de la memoire                                     │
└─────────────────────────────────────────────────────────────┘
```

## Composants principaux

### Frontend (Svelte)

**Emplacement** : `src/lib/components/`

- `Chat/` : Interface de chat
- `Settings/` : Parametres
- `Auth/` : Authentification
- `Admin/` : Panneau d'administration

**Stores** : `src/lib/stores/`

- `chat.ts` : Gestion des conversations
- `user.ts` : Gestion utilisateur
- `config.ts` : Configuration

**APIs** : `src/lib/apis/`

- `chat.ts` : Appels API chat
- `ollama.ts` : Appels API Ollama
- `graden.ts` : Appels API Grden

### Backend (FastAPI)

**Emplacement** : `backend/open_webui/`

**Routers** :
- `routers/chat.py` : Endpoints de chat
- `routers/ollama.py` : Integration Ollama
- `routers/graden.py` : Fonctionnalites specifiques
- `routers/files.py` : Gestion des fichiers

**Models** :
- `models/User.py` : Modele utilisateur
- `models/Chat.py` : Modele conversation
- `models/Config.py` : Configuration

**Utils** :
- `utils/payload.py` : Construction des payloads
- `utils/security.py` : Fonctions de securite

### Ollama

**Emplacement** : External (port 11434)

- `GET /api/tags` : Lister les modeles
- `POST /api/generate` : Generer du texte
- `POST /api/chat` : Chat avec un modele

## Flux de donnees

### Message utilisateur

```
Utilisateur → Frontend → API Backend → Ollama → Backend → Frontend → Utilisateur
```

### Detaille

1. **Utilisateur** tape un message
2. **Frontend** envoie via `POST /api/v1/chat/completions`
3. **Backend** valide et prepare le payload
4. **Backend** appelle Ollama via `POST /ollama/api/chat`
5. **Ollama** traite et retourne la reponse
6. **Backend** formatte la reponse
7. **Frontend** affiche la reponse
8. **Utilisateur** voit la reponse

### Authentification

```
Utilisateur → Login → Backend → JWT Token → Frontend (stockage) → Requetes API
```

## Base de donnees

**Type** : SQLite (par defaut)

**Emplacement** : `data/database.db`

**Tables principales** :
- `user` : Utilisateurs
- `chat` : Conversations
- `message` : Messages
- `file` : Fichiers uploades
- `config` : Configuration

## Securite

### Authentification

- JWT tokens
- Mots de passe hashe (bcrypt)
- Sessions securisees

### Autorisation

- Roles utilisateur (admin, user)
- Permissions par endpoint
- Validation des entrees

### Donnees

- Chiffrement des secrets
- Pas de tracking
- Mode hors ligne possible

## Performance

### Optimisations

- Modele compile et minifie
- Cache cote client
- Streaming des reponses
- Chargement paresseux des composants

### Limitations

- Sans GPU : modeles legers recommandes
- Memoire : depend du modele charge
- Reseau : connexion locale recommandee
