# Grden IA - Guide de contribution rapide

## Debuter en 5 minutes

### 1. Fork et clone

```bash
# Fork le projet sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE_UTILISATEUR/GrdenIA.git
cd GrdenIA
```

### 2. Branche de travail

```bash
# Creez une branche pour votre modification
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Modifier le code

- **Frontend** : `src/lib/components/`
- **Backend** : `backend/open_webui/routers/`
- **Configuration** : `launch.py`

### 4. Tester

```bash
# Compiler le frontend
npm run build

# Lancer le serveur
python launch.py
```

### 5. Commit et push

```bash
# Ajoutez vos modifications
git add .

# Creez un commit
git commit -m "Ajouter: description de la modification"

# Push sur votre fork
git push origin feature/ma-nouvelle-fonctionnalite
```

### 6. Ouvrir une Pull Request

Allez sur GitHub et creez une Pull Request depuis votre branche.

## Types de contributions

### Bug fixes

- Decrivez le bug
- Expliquez comment le reproduire
- Montrez la correction

### Nouvelles fonctionnalites

- Decrivez la fonctionnalite
- Expliquez pourquoi elle est utile
- Montrez comment l'utiliser

### Documentation

- Corrigez les fautes
- Ajoutez des exemples
- Ameliorez les explications

### Tests

- Ajoutez des tests unitaires
- Ameliorez la couverture de code
- Corrigez les tests existants

## Regles a respecter

### Code

- Suivez le style existant
- Ajoutez des commentaires
- Testez vos modifications

### Commit messages

```
Type: description courte

Description plus detaillee
```

Types : Ajouter, Corriger, Modifier, Supprimer, Refactor, Docs, Test

### Pull Requests

- Decrivez vos modifications
- Referrez les issues
- Ajoutez des captures d'ecran
- Assurez-vous que les tests passent

## Aide

Si vous avez des questions :
1. Consultez la [documentation](README.md)
2. Ouvrez une [issue](https://github.com/grandelagbanou28-gif/GrdenIA/issues)
3. Rejoignez les [discussions](https://github.com/grandelagbanou28-gif/GrdenIA/discussions)
