# Project: noteffy — Tools

URL: <https://luisfosg.github.io/tools>
Stack: Astro + React 19 + Tailwind CSS v4 + pnpm

## Layout conventions

- Pages go in `src/pages/projects/<slug>.astro`
- React interactive components in `src/components/<ToolName>.jsx`
- Each tool gets an entry in `src/data/projects.ts`
- Astro pages use `client:load` for interactive components

## Notifications

**Sileo** (`npm i sileo`) is the toast/notification library.

Usage:
```jsx
import { Toaster, sileo } from "sileo";

// Mount once per page
<Toaster position="top-right" />

// Fire from anywhere
sileo.success({ title: "Copied", description: "..." });
sileo.error({ title: "Error", description: "..." });
sileo.warning({ title: "Warning", description: "..." });
sileo.info({ title: "Info", description: "..." });
```

Use Sileo for copy-to-clipboard feedback, async notifications, and any user-facing alerts.

## Tools

- `TimestampTool.jsx` — Unix/ISO timestamp converter
- `GradeCalculator.jsx` — Weighted grade calculator
- `IbanGenerator.jsx` — EU IBAN generator with MOD-97 validation
