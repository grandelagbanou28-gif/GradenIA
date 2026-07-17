# Contribuer a Graden IA

Merci de votre interet pour Graden IA ! Toutes les contributions sont les bienvenues.

## Comment contribuer

### Signaler un bug

1. Verifiez les [issues existantes](https://github.com/grandelagbanou28-gif/GradenIA/issues)
2. Si le bug n'existe pas, creez une nouvelle issue avec :
   - Un titre descriptif
   - Les etapes pour reproduire le bug
   - Le comportement attendu
   - Votre environnement (OS, version Python, etc.)

### Proposer une fonctionnalite

1. Ouvrez une issue avec le label `enhancement`
2. Decrivez la fonctionnalite souhaitee
3. Expliquez pourquoi elle serait utile

### Envoyer du code

1. **Fork** le projet
2. **Cloner** votre fork :
   ```bash
   git clone https://github.com/VOTRE_UTILISATEUR/GradenIA.git
   cd GradenIA
   ```
3. **Creer une branche** :
   ```bash
   git checkout -b feature/nom-fonctionnalite
   ```
4. **Modifier** le code
5. **Tester** vos modifications
6. **Commit** :
   ```bash
   git commit -m "Ajouter: description de la modification"
   ```
7. **Push** :
   ```bash
   git push origin feature/nom-fonctionnalite
   ```
8. **Ouvrir** une Pull Request

## Regles a suivre

### Code

- Suivez le style de code existant
- Ajoutez des commentaires pour le code complexe
- Testez vos modifications avant de commiter

### Commit messages

Utilisez le format :
```
Type: description courte

Description plus detaillee si necessaire
```

Types :
- `Ajouter` : nouvelle fonctionnalite
- `Corriger` : correction de bug
- `Modifier` : modification d'une fonctionnalite existante
- `Supprimer` : suppression de code
- `Refactor` : refactoring du code
- `Docs` : documentation
- `Test` : tests unitaires

### Pull Requests

- Decrivez les modifications apportees
- Referrez l'issue correspondante si applicable
- Ajoutez des captures d'ecran si necessaire
- Assurez-vous que les tests passent

## Development Setup

### Pre-requis

- Python 3.12+
- Node.js 22+
- Ollama

### Installation

```bash
# Cloner le depot
git clone https://github.com/grandelagbanou28-gif/GradenIA.git
cd GradenIA

# Environnement virtuel
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Dependances
pip install -r requirements.txt
npm install

# Lancer en mode developpement
python launch.py
```

## Questions ?

Si vous avez des questions, ouvrez une issue avec le label `question`.
