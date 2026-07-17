# Grden IA - Performance et optimisation

## Optimisations actuelles

### Modeles legers

Grden IA est optimise pour fonctionner avec des modeles legers :

| Modele | Taille | RAM necessaire | Vitesse |
|--------|--------|----------------|---------|
| qwen2.5:0.5b | 397 MB | ~512 MB | ⚡⚡⚡ |
| qwen2.5-coder:1.5b | 986 MB | ~1.5 GB | ⚡⚡ |
| gemma3:1b | 800 MB | ~1 GB | ⚡⚡ |
| minicpm-v4.6 | 1.6 GB | ~2 GB | ⚡ |
| llama3.1:8b | 4.7 GB | ~6 GB | ⚡ |

### Sans GPU

Grden IA fonctionne sans GPU en utilisant le CPU. Les modeles 0.5b et 1.5b sont utilises par defaut pour des performances optimales.

## Optimisations possibles

### 1. Utiliser un GPU

Si vous avez un GPU NVIDIA :
```bash
# Installer CUDA
# Puis activer dans .env
USE_CUDA=true
```

### 2. Ajuster la memoire

Dans `.env` :
```bash
# Limiter la memoire utilisee par Ollama
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_NUM_PARALLEL=1
```

### 3. Optimiser le frontend

Le frontend est compile et minifie. Pour des performances maximales :

```bash
# Build de production
npm run build
```

### 4. Utiliser un SSD

Les modeles sont charges depuis le disque. Un SSD amelioreore considerablement les temps de chargement.

### 5. Optimiser les connexions

```bash
# Dans .env
OLLAMA_BASE_URL=http://localhost:11434
# Utiliser une connexion locale
```

## Monitoring

### Voir l'utilisation memoire

```bash
# Windows
tasklist /FI "IMAGENAME eq ollama.exe"

# Linux
htop
```

### Voir les logs de performance

```bash
# Activer les logs de performance
LOG_LEVEL=debug
```

## Benchmarks

### Temps de reponse moyens

| Modele | 1ere reponse | Reponse suivante |
|--------|--------------|------------------|
| qwen2.5:0.5b | ~1s | ~0.3s |
| qwen2.5-coder:1.5b | ~2s | ~0.5s |
| minicpm-v4.6 | ~5s | ~1s |
| llama3.1:8b | ~10s | ~2s |

### Consommation memoire

| Modele | Idle | En utilisation |
|--------|------|----------------|
| qwen2.5:0.5b | ~400 MB | ~600 MB |
| qwen2.5-coder:1.5b | ~1 GB | ~1.5 GB |
| minicpm-v4.6 | ~1.5 GB | ~2 GB |
| llama3.1:8b | ~5 GB | ~7 GB |

## Optimisation pour les petits PCs

### PC avec 4GB de RAM

- Utilisez uniquement `qwen2.5:0.5b`
- Desactivez la RAG (`ENABLE_RAG=false`)
- Desactivez la recherche web (`ENABLE_WEB_SEARCH=false`)

### PC avec 8GB de RAM

- Utilisez `qwen2.5:0.5b` ou `qwen2.5-coder:1.5b`
- La RAG est possible avec `nomic-embed-text`

### PC avec 16GB+ de RAM

- Tous les modeles sont utilisables
- Vous pouvez charger plusieurs modeles
