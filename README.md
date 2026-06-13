# Tools

Colección de herramientas — hosteada en **GitHub Pages**.

👉 [luisfosg.github.io/noteffy](https://luisfosg.github.io/noteffy/)

## Herramientas

| Herramienta | Descripción |
|---|---|
| [📊 Noteffy](https://luisfosg.github.io/noteffy/projects/grade-calculator) | Calculadora de notas ponderadas en tiempo real |

## Agregar una herramienta nueva

1. Crear la página en `src/pages/projects/<slug>.astro`
2. Agregar la entrada en `src/data/projects.ts`

```ts
{
  slug: "mi-herramienta",
  title: "Mi Herramienta",
  description: "Breve descripción",
  icon: "🚀",
  status: "active", // "active" | "wip" | "planned"
}
```

3. La landing page lo muestra automáticamente.

## Stack

- **[Astro](https://astro.build)** — Static Site Generator
- **[React](https://react.dev)** — Componentes interactivos
- **[Tailwind CSS v4](https://tailwindcss.com)** — Estilos
- **[pnpm](https://pnpm.io)** — Package manager

## Desarrollo local

```bash
pnpm install
pnpm dev
```

## Deploy

Automático con **GitHub Actions**. Cada push a `main` builda y publica en GitHub Pages.
