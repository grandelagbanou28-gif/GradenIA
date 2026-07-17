# Grden IA - Scripts utilitaires

## Installation rapide

```bash
# Windows
install.bat

# Linux/Mac
chmod +x install.sh
./install.sh
```

## Lancement

```bash
# Windows
launch.bat

# Linux/Mac
./launch.sh

# Ou avec Make
make start
```

## Commandes Make

```bash
make help      # Afficher les commandes disponibles
make install   # Installer les dependances
make build     # Compiler le frontend
make start     # Demarrer le serveur
make dev       # Mode developpement
make stop      # Arreter le serveur
make clean     # Nettoyer les fichiers temporaires
make status    # Verifier l'etat du serveur
```

## Docker

```bash
# Construire et lancer
docker-compose up -d

# Arreter
docker-compose down

# Voir les logs
docker-compose logs -f
```
