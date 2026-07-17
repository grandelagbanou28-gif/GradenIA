# Grden IA - Template de commit

## Format

```
Type(domaine): description courte

Description plus detaillee si necessaire

Issue: #123
```

## Types

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalite | `feat(chat): ajouter le support des images` |
| `fix` | Correction de bug | `fix(auth): corriger la connexion` |
| `docs` | Documentation | `docs: ajouter le guide d'installation` |
| `style` | Formatting | `style: corriger l'indentation` |
| `refactor` | Refactoring | `refactor: simplifier le code Ollama` |
| `test` | Tests | `test: ajouter les tests unitaires` |
| `chore` | Taches diverses | `chore: mettre a jour les dependances` |
| `perf` | Performance | `perf: optimiser le chargement des modeles` |
| `ci` | Integration continue | `ci: ajouter le workflow GitHub Actions` |
| `build` | Build | `build: corriger le script de build` |
| `revert` | Revert | `revert: annuler la commit precedente` |

## Domaines

| Domaine | Description |
|---------|-------------|
| `chat` | Fonctionnalites de chat |
| `auth` | Authentification |
| `ollama` | Integration Ollama |
| `graden` | Fonctionnalites specifiques |
| `ui` | Interface utilisateur |
| `api` | API backend |
| `db` | Base de donnees |
| `sec` | Securite |
| `perf` | Performance |
| `doc` | Documentation |

## Exemples

### Bon

```
feat(chat): ajouter le streaming des reponses

- Implementation du streaming SSE
- Affichage en temps reel
- Gestion de l'annulation

Issue: #45
```

```
fix(auth): corriger la validation du token

Le token n'etait pas verifie correctement.
Maintenant, la validation est plus stricte.

Issue: #123
```

### Mauvais

```
update code
```

```
fix bug
```

```
ajout de fonctionnalite
```

## Regles

1. **Sujet** : 50 caractères maximum, minuscule, pas de point
2. **Corps** : 72 caractères maximum par ligne
3. **Issue** : Referencer l'issue si applicable
4. **Type** : Obligatoire
5. **Domaine** : Optionnel mais recommande
