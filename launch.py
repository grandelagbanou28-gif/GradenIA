import os

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_env()

os.environ['WEBUI_NAME'] = 'Graden IA'
os.environ['OLLAMA_BASE_URL'] = 'http://localhost:11434'
os.environ['DATA_DIR'] = r'C:\MES PROJETS WEB\AGBANOU GRANDEL GENERAL\iagraden\Graden IA\data'
os.environ['WEBUI_SECRET_KEY'] = 'graden-ia-secret-2024'
os.environ['RAG_EMBEDDING_ENGINE'] = 'ollama'
os.environ['RAG_EMBEDDING_MODEL'] = 'nomic-embed-text'
os.environ['USE_CUDA'] = 'false'
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['SENTENCE_TRANSFORMERS_OFFLINE'] = '1'
os.environ['DEFAULT_LOCALE'] = 'fr-FR'
os.environ['DEFAULT_MODELS'] = 'qwen2.5-coder:1.5b,qwen2.5:0.5b,minicpm-v4.6:latest,granite4.1-guardian:8b'
os.environ['ENABLE_RAG'] = 'false'
os.environ['ENABLE_WEB_SEARCH'] = 'false'
os.environ['ENABLE_GOOGLE_DRIVE_INTEGRATION'] = 'false'
os.environ['SAFE_MODE'] = 'false'
os.environ['ENABLE_SIGNUP'] = 'true'
os.environ['FRONTEND_BUILD_DIR'] = r'C:\MES PROJETS WEB\AGBANOU GRANDEL GENERAL\iagraden\Graden IA\build'

# Gemini API
os.environ['OPENAI_API_KEY'] = os.environ.get('GEMINI_API_KEY', '')
os.environ['OPENAI_API_BASE_URL'] = 'https://generativelanguage.googleapis.com/v1beta/openai/'

# Google OAuth
os.environ['ENABLE_OAUTH_SIGNUP'] = 'true'
os.environ['GOOGLE_REDIRECT_URI'] = 'http://localhost:8080/oauth/google/login/callback'

# GitHub OAuth

import uvicorn
from open_webui.main import app
uvicorn.run(app, host='0.0.0.0', port=8080, log_level='warning', access_log=False)
