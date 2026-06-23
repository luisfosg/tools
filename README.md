# Tools

Colección de herramientas — hosteada en **GitHub Pages**.

👉 [luisfosg.github.io/tools](https://luisfosg.github.io/tools/)

## Herramientas

| Herramienta | Descripción |
|---|---|
| [📊 Noteffy](https://luisfosg.github.io/tools/noteffy) | Calculadora de notas ponderadas en tiempo real |
| [📱 QR Generator](https://luisfosg.github.io/tools/qr-generator) | Generador de QR con personalización completa: colores, gradientes, estilos, logo y descarga |
| [⏱️ Timestamp](https://luisfosg.github.io/tools/timestamp) | Conversor de timestamps, zonas horarias, diferencias entre fechas y formateo |
| [🏦 IBAN Generator](https://luisfosg.github.io/tools/iban-generator) | Generador de IBANs de prueba para la UE con datos bancarios consistentes |
| [🔐 Password Hash](https://luisfosg.github.io/tools/password-hash) | Generación de hashes bcrypt, SHA, HMAC, PBKDF2 y JWT |
| [▌ Barcode Generator](https://luisfosg.github.io/tools/barcode-generator) | Generá códigos de barras: CODE128, EAN-13, UPC-A, CODE39, ITF-14 y más |
| [📞 Phone Generator](https://luisfosg.github.io/tools/phone-generator) | Generá números telefónicos de prueba por país, validalos e identificá el país de origen |
| [🔍 SEO Viewer](https://luisfosg.github.io/tools/seo-viewer) | Analizá el SEO de cualquier página web con puntuación y recomendaciones |

## Agregar una herramienta nueva

1. Crear la página en `src/pages/<slug>.astro`
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
4. Actualizar este README con la nueva herramienta.

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
