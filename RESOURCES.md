# Grden IA - Ressources utiles

## Documentation officielle

### Grden IA
- [README principal](README.md)
- [Guide d'installation](INSTALL.md)
- [Guide de depannage](SUPPORT.md)
- [Architecture technique](ARCHITECTURE.md)
- [API Reference](API.md)
- [Guide de personnalisation](CUSTOMIZATION.md)

### Technologies utilisees
- [Python 3.12](https://docs.python.org/3/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Svelte](https://svelte.dev/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Ollama](https://ollama.com/library)
- [Docker](https://docs.docker.com/)

## Outils de developpement

### Editeurs de code
- [Visual Studio Code](https://code.visualstudio.com/)
- [PyCharm](https://www.jetbrains.com/pycharm/)
- [Sublime Text](https://www.sublimetext.com/)

### Extensions recommandees pour VS Code
- Python
- Pylance
- Svelte for VS Code
- Tailwind CSS IntelliSense
- GitLens
- Docker

### Outils Git
- [Git](https://git-scm.com/)
- [GitHub Desktop](https://desktop.github.com/)
- [GitKraken](https://www.gitkraken.com/)

## Templates de code

### FastAPI Endpoint

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter()

class Item(BaseModel):
    name: str
    description: str | None = None

@router.post("/items/")
async def create_item(item: Item):
    return {"item": item}
```

### Svelte Component

```svelte
<script>
  export let title = "Titre";
  export let description = "Description";

  let count = 0;

  function handleClick() {
    count += 1;
  }
</script>

<div class="component">
  <h1>{title}</h1>
  <p>{description}</p>
  <button on:click={handleClick}>
    Clicked {count} {count === 1 ? 'time' : 'times'}
  </button>
</div>

<style>
  .component {
    padding: 1rem;
    border-radius: 0.5rem;
    background: var(--color-bg-secondary);
  }
</style>
```

### TypeScript API Client

```typescript
const API_BASE = '/api/v1';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function postData<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
```

## Communautes

### Forums et discussions
- [GitHub Discussions Grden IA](https://github.com/grandelagbanou28-gif/GrdenIA/discussions)
- [Stack Overflow - Python](https://stackoverflow.com/questions/tagged/python)
- [Stack Overflow - FastAPI](https://stackoverflow.com/questions/tagged/fastapi)
- [Stack Overflow - Svelte](https://stackoverflow.com/questions/tagged/svelte)

### Reseaux sociaux
- [Twitter/X - Grden IA](https://twitter.com/grdenia)
- [LinkedIn - Grandel Agbanou](https://www.linkedin.com/in/grandel-agbanou/)

### Discord
- [Communaute Grden IA](https://discord.gg/grdenia)

## Livres et tutorials

### Python
- [Python Crash Course](https://nostarch.com/python-crash-course-3rd-edition)
- [Automate the Boring Stuff with Python](https://automatetheboringstuff.com/)
- [FastAPI - Le guide complet](https://fastapi.tiangolo.com/tutorial/)

### JavaScript/Svelte
- [Svelte Tutorial](https://learn.svelte.dev/)
- [JavaScript.info](https://javascript.info/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

### IA et Machine Learning
- [Hugging Face Course](https://huggingface.co/course/chapter1)
- [Ollama Documentation](https://ollama.com/library)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)

## Outils en ligne

### Test d'API
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [HTTPie](https://httpie.io/)

### Diagrammes
- [Excalidraw](https://excalidraw.com/)
- [Draw.io](https://app.diagrams.net/)
- [Mermaid Live Editor](https://mermaid.live/)

### Color schemes
- [Coolors](https://coolors.co/)
- [Color Hunt](https://colorhunt.co/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)

## Licences

La plupart des outils et bibliothèques utilises sont sous licence MIT ou similaire. Consultez les fichiers LICENSE de chaque projet pour plus de details.
