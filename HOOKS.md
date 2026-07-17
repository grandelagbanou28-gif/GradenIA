# Grden IA - Configuration des hooks Git

## Installation

```bash
# Copier les hooks
cp .githooks/* .git/hooks/
chmod +x .git/hooks/*
```

## Hooks disponibles

### pre-commit

Verifie le code avant le commit :
- Formattage Python (black)
- Verification des cles API
- Validation des messages de commit

### commit-msg

Valide le format du message de commit :
```
Type: description courte

Description plus detaillee si necessaire
```

Types acceptes :
- `Ajouter` : nouvelle fonctionnalite
- `Corriger` : correction de bug
- `Modifier` : modification d'une fonctionnalite
- `Supprimer` : suppression de code
- `Refactor` : refactoring du code
- `Docs` : documentation
- `Test` : tests unitaires
- `Style` : formatting, point-virgules manquants, etc.
- `Chore` : mise a jour de dependentes, taches de configuration
- `Revert` : revert d'un commit precedent

### pre-push

Verifie avant le push :
- Aucun secret dans le code
- Tests passes
- Branche a jour
