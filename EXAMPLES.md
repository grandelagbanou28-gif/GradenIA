# Grden IA - Exemples de configuration

## Configuration pour debutants

```bash
# .env - Configuration simple
WEBUI_NAME=Grden IA
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=mon-secret-simple
DEFAULT_MODELS=qwen2.5:0.5b
ENABLE_RAG=false
ENABLE_WEB_SEARCH=false
```

## Configuration avancee

```bash
# .env - Configuration avancee
WEBUI_NAME=Grden IA
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=un-secret-complexe-et-long-pour-la-production
DEFAULT_MODELS=qwen2.5:0.5b,qwen2.5-coder:1.5b,minicpm-v4.6:latest
ENABLE_RAG=true
RAG_EMBEDDING_ENGINE=ollama
RAG_EMBEDDING_MODEL=nomic-embed-text
ENABLE_WEB_SEARCH=false
SAFE_MODE=false
DEFAULT_LOCALE=fr-FR
```

## Configuration pour developpeurs

```bash
# .env - Configuration developpeur
WEBUI_NAME=Grden IA Dev
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=dev-secret-key
DEFAULT_MODELS=qwen2.5-coder:1.5b
ENABLE_RAG=true
RAG_EMBEDDING_ENGINE=ollama
RAG_EMBEDDING_MODEL=nomic-embed-text
ENABLE_WEB_SEARCH=true
SAFE_MODE=false
DEFAULT_LOCALE=fr-FR
LOG_LEVEL=debug
CORS_ALLOW_ORIGIN=http://localhost:5173
```

## Configuration Docker

```yaml
# docker-compose.yml - Configuration personnalisee
version: '3.8'

services:
  graden-ia:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    environment:
      - WEBUI_NAME=Grden IA
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=changez-moi
      - DATA_DIR=/app/data
      - DEFAULT_MODELS=qwen2.5:0.5b,qwen2.5-coder:1.5b
      - ENABLE_RAG=true
      - RAG_EMBEDDING_ENGINE=ollama
      - RAG_EMBEDDING_MODEL=nomic-embed-text
    depends_on:
      - ollama
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  ollama_data:
```

## Configuration pour serveur

```bash
# .env - Configuration serveur
WEBUI_NAME=Grden IA
OLLAMA_BASE_URL=http://ollama:11434
WEBUI_SECRET_KEY=cle-production-tres-securisee
DEFAULT_MODELS=qwen2.5:0.5b,qwen2.5-coder:1.5b,llama3.1:8b
ENABLE_RAG=true
RAG_EMBEDDING_ENGINE=ollama
RAG_EMBEDDING_MODEL=nomic-embed-text
ENABLE_WEB_SEARCH=false
SAFE_MODE=true
DEFAULT_LOCALE=fr-FR
WEBUI_HOST=0.0.0.0
WEBUI_PORT=8080
FORWARDED_ALLOW_IPS=*
```

## Configuration pour petit PC

```bash
# .env - Configuration optimisee pour PC avec 4GB de RAM
WEBUI_NAME=Grden IA
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=mon-secret
DEFAULT_MODELS=qwen2.5:0.5b
ENABLE_RAG=false
ENABLE_WEB_SEARCH=false
SAFE_MODE=false
DEFAULT_LOCALE=fr-FR
```

## Configuration pour GPU

```bash
# .env - Configuration avec GPU NVIDIA
WEBUI_NAME=Grden IA
OLLAMA_BASE_URL=http://localhost:11434
WEBUI_SECRET_KEY=mon-secret
DEFAULT_MODELS=qwen2.5:0.5b,qwen2.5-coder:1.5b,llama3.1:8b
ENABLE_RAG=true
RAG_EMBEDDING_ENGINE=ollama
RAG_EMBEDDING_MODEL=nomic-embed-text
ENABLE_WEB_SEARCH=false
SAFE_MODE=false
DEFAULT_LOCALE=fr-FR
USE_CUDA=true
OLLAMA_MAX_LOADED_MODELS=3
OLLAMA_NUM_PARALLEL=2
```
