# Grden IA - Support et depannage

## Problemes frequents

### Ollama ne demarre pas

**Symptome** : "Connection refused" ou "Ollama not running"

**Solution** :
```bash
# Verifier si Ollama est en cours d'execution
tasklist /FI "IMAGENAME eq ollama.exe"

# Demarrer Ollama
ollama serve

# Verifier la connexion
curl http://localhost:11434/api/tags
```

### Modeles non telecharges

**Symptome** : "No models available" dans l'interface

**Solution** :
```bash
# Lister les modeles installes
ollama list

# Telecharger un modele
ollama pull qwen2.5:0.5b

# Verifier les modeles disponibles
curl http://localhost:11434/api/tags
```

### Erreur Python

**Symptome** : "ModuleNotFoundError" ou erreurs d'import

**Solution** :
```bash
# Reactiver l'environnement virtuel
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Reinstaller les dependances
pip install -r requirements.txt
```

### Frontend ne compile pas

**Symptome** : Erreurs lors de `npm run build`

**Solution** :
```bash
# Nettoyer et reinstalller
rm -rf node_modules
npm install
npm run build
```

### Port deja utilise

**Symptome** : "Address already in use"

**Solution** :
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/Mac

# Arreter le processus
taskkill /PID <PID> /F  # Windows
kill <PID>  # Linux/Mac
```

### Application desktop ne demarre pas

**Symptome** : La fenetre ne s'ouvre pas

**Solution** :
1. Verifiez que le serveur backend est lance (`launch.py`)
2. Verifiez que pywebview est installe : `pip install pywebview`
3. Verifiez qu'Edge WebView2 est installe sur Windows

## Performance

### Lent sans GPU

Grden IA est optimise pour fonctionner sans GPU. Pour ameliorer les performances :

1. Utilisez des petits modeles (0.5b ou 1.5b)
2. Reducez le contexte maximum dans les parametres
3. Desactivez les fonctionnalites inutiles (RAG, web search)

### Optimisation pour GPU

Si vous avez un GPU NVIDIA :
```bash
# Installer CUDA
# Puis activer dans .env
USE_CUDA=true
```

## Logs

### Voir les logs

```bash
# Logs du serveur
tail -f logs/server.log

# Logs d'Ollama
journalctl -u ollama -f  # Linux
# Ou dans le terminal Ollama
```

### Activer le mode debug

```bash
# Dans .env
LOG_LEVEL=debug
```

## Contact

Si le probleme persiste :
1. Ouvrez une issue sur [GitHub](https://github.com/grandelagbanou28-gif/GrdenIA/issues)
2. Incluez les details de votre environnement
3. Collez les logs d'erreur
