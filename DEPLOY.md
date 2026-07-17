# Grden IA - Guide de deploiement

## Deploiement local

### Windows

1. Installer Python 3.12+ depuis python.org
2. Installer Node.js 22+ depuis nodejs.org
3. Installer Ollama depuis ollama.com
4. Cloner le depot :
   ```bash
   git clone https://github.com/grandelagbanou28-gif/GradenIA.git
   cd GrdenIA
   ```
5. Lancer `install.bat`
6. Lancer `launch.bat`

### Linux

1. Installer les dependances :
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip nodejs npm curl
   ```
2. Installer Ollama :
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
3. Cloner et installer :
   ```bash
   git clone https://github.com/grandelagbanou28-gif/GradenIA.git
   cd GrdenIA
   chmod +x install.sh
   ./install.sh
   ```
4. Lancer :
   ```bash
   ./launch.sh
   ```

## Deploiement Docker

### Pre-requis

- Docker 20.10+
- Docker Compose 2.0+

### Installation

1. Cloner le depot :
   ```bash
   git clone https://github.com/grandelagbanou28-gif/GrdenIA.git
   cd GrdenIA
   ```

2. Configurer l'environnement :
   ```bash
   cp .env.example .env
   # Editer .env avec vos parametres
   ```

3. Lancer avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

4. Acceder a Grden IA :
   - Interface : http://localhost:8080
   - Ollama : http://localhost:11434

### Commandes Docker

```bash
# Demarrer
docker-compose up -d

# Arreter
docker-compose down

# Rebuild
docker-compose up -d --build

# Logs
docker-compose logs -f graden-ia

# Shell dans le conteneur
docker exec -it graden-ia bash
```

## Deploiement cloud

### VPS (DigitalOcean, Linode, etc.)

1. Creer une instance Ubuntu 22.04
2. Installer Docker et Docker Compose
3. Cloner le depot
4. Configurer le pare-feu :
   ```bash
   sudo ufw allow 8080/tcp
   sudo ufw allow 11434/tcp
   ```
5. Lancer avec Docker Compose

### AWS / Google Cloud / Azure

1. Creer une instance avec Docker pre-installe
2. Suivre les etapes du VPS
3. Configurer le load balancer si necessaire

## Securite

### En production

- Changez `WEBUI_SECRET_KEY` dans `.env`
- Activez HTTPS avec un reverse proxy (Nginx, Caddy)
- Limitez l'acces au port 11434 (Ollama)
- Utilisez un firewall

### Exemple Nginx

```nginx
server {
    listen 443 ssl;
    server_name graden-ia.votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ollama/ {
        proxy_pass http://localhost:11434/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
