# Grden IA - Guide de personnalisation

## Modifier le nom de l'application

1. Editez `.env` :
   ```
   WEBUI_NAME=Mon Nom Personnalise
   ```

2. Ou editez `launch.py` :
   ```python
   os.environ['WEBUI_NAME'] = 'Mon Nom Personnalise'
   ```

## Modifier le logo

### Favicon

Remplacez les fichiers dans `static/static/` :
- `favicon.ico` (16x16, 32x32, 48x48)
- `favicon.png` (512x512)
- `favicon.svg` (vectoriel)
- `favicon-96x96.png`
- `favicon-dark.png` (pour le mode sombre)

### Logo de l'application

Remplacez `static/static/logo.png` (512x512 recommande).

### Splash screen

Remplacez :
- `static/static/splash.png` (pour le mode clair)
- `static/static/splash-dark.png` (pour le mode sombre)

## Modifier les couleurs

### CSS Personnalise

Creez ou editez `static/static/custom.css` :

```css
:root {
  --color-primary: #3b82f6;      /* Bleu principal */
  --color-primary-hover: #2563eb;
  --color-secondary: #10b981;    /* Vert secondaire */
  --color-accent: #f59e0b;       /* Orange accent */
  --color-bg: #ffffff;           /* Fond principal */
  --color-bg-secondary: #f8fafc; /* Fond secondaire */
  --color-text: #1e293b;         /* Texte principal */
  --color-text-secondary: #64748b;
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-text: #f1f5f9;
    --color-text-secondary: #94a3b8;
  }
}
```

### Tailwind CSS

Grden IA utilise Tailwind CSS. Vous pouvez personnaliser les couleurs dans `tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

## Modifier les modeles par defaut

### Via .env

```
DEFAULT_MODELS=qwen2.5:0.5b,qwen2.5-coder:1.5b,llama3.1:8b
```

### Via l'interface

1. Ouvrez Grden IA
2. Allez dans **Admin Settings → Connections**
3. Configurez les modeles

## Ajouter un fournisseur API

### OpenAI

```
OPENAI_API_KEY=sk-...
OPENAI_API_BASE_URL=https://api.openai.com/v1/
```

### Anthropic

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Google Gemini

```
OPENAI_API_KEY=AIza...
OPENAI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

## Personnaliser les messages

### Message de bienvenue

Editez `src/lib/components/OnBoarding.svelte`.

### Messages d'erreur

Editez `backend/open_webui/constants.py`.

## Personnaliser les fonctionnalites

### Activer la RAG

```
ENABLE_RAG=true
RAG_EMBEDDING_ENGINE=ollama
RAG_EMBEDDING_MODEL=nomic-embed-text
```

### Activer la recherche web

```
ENABLE_WEB_SEARCH=true
```

### Activer le mode securise

```
SAFE_MODE=true
```

## Compiler les changements

Apres vos modifications :

```bash
# Compiler le frontend
npm run build

# Relancer le serveur
python launch.py
```
