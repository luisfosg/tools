# Noteffy

Colección de herramientas y proyectos — hosteada en **GitHub Pages**.

👉 [noteffy.xyz](https://luisfosg.github.io/noteffy/) _(aka `luisfosg.github.io/noteffy/`)_

## Proyectos

| Proyecto | Descripción |
|---|---|
| [📊 Calculadora de Notas](https://luisfosg.github.io/noteffy/projects/grade-calculator) | Calculadora de notas ponderadas en tiempo real |

## Agregar un proyecto nuevo

1. Crear la página en `src/pages/projects/<slug>.astro`
2. Agregar la entrada en `src/data/projects.ts`

```ts
{
  slug: "mi-proyecto",
  title: "Mi Proyecto",
  description: "Breve descripción",
  icon: "🚀",
  status: "active", // "active" | "wip" | "planned"
}
```

3. La landing page lo muestra automáticamente.

## Stack

- **[Astro](https://astro.build)** — Static Site Generator
- **[React](https://react.dev)** — Componentes interactivos
- **[Tailwind CSS](https://tailwindcss.com)** — Estilos
- **[pnpm](https://pnpm.io)** — Package manager

## Desarrollo local

```bash
pnpm install
pnpm dev
```

## Deploy

Automático con **GitHub Actions**. Cada push a `main` builda y publica en GitHub Pages.
