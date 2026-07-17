# Grden IA - API Reference

## Endpoints principaux

### Chat

```
POST /api/v1/chat/completions
```

Envoyer un message au modele IA.

**Parametres** :
- `model` : Nom du modele (ex: "qwen2.5:0.5b")
- `messages` : Tableau de messages
- `stream` : boolean (streaming en temps reel)

**Exemple** :
```json
{
  "model": "qwen2.5:0.5b",
  "messages": [
    {"role": "user", "content": "Bonjour !"}
  ],
  "stream": true
}
```

### Modeles

```
GET /api/v1/models
```

Lister les modeles disponibles.

### Fichiers

```
POST /api/v1/files/upload
```

Upload un fichier.

**Parametres** :
- `file` : Fichier a upload

### Dossiers

```
POST /api/v1/graden/scan-folder
```

Scanner un dossier pour analyser son contenu.

**Parametres** :
- `folder_path` : Chemin du dossier

### Ollama

```
GET /ollama/api/tags
```

Lister les modeles Ollama installes.

```
POST /ollama/api/pull
```

Telecharger un modele Ollama.

**Parametres** :
- `name` : Nom du modele (ex: "qwen2.5:0.5b")

### Refresh

```
POST /ollama/api/refresh
```

Actualiser la liste des modeles.

## Authentication

Toutes les API (sauf `/api/v1/auths/signin`) necessitent un token d'authentification.

**Header** :
```
Authorization: Bearer <token>
```

Obtenir un token :
```
POST /api/v1/auths/signin
{
  "email": "votre@email.com",
  "password": "votre-mot-de-passe"
}
```

## Rate Limiting

Les API sont limitees a 60 requetes par minute par IP.

## Erreurs

| Code | Description |
|------|-------------|
| 400 | Requete invalide |
| 401 | Non autorise |
| 403 | Acces interdit |
| 404 | Ressource non trouvee |
| 429 | Trop de requetes |
| 500 | Erreur serveur |
