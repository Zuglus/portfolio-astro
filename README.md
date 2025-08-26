# Astro Portfolio

This repository contains the source for my personal portfolio built with [Astro](https://astro.build). The site showcases design projects and uses Alpine.js for lightweight interactivity.

## Directory layout

- `src/pages/` – Astro routes such as `index.astro`, `privacy.astro`, and `offline.astro`.
- `src/components/` – UI building blocks and Alpine controllers (e.g., `ModalController.ts`).
- `src/layouts/` – Shared page wrappers like `Layout.astro`.
- `src/styles/` – Global styles and Tailwind utilities.
- `src/data/` – Typed data sources and tests.
- `src/utils/` – Utilities like `logger.ts`.
- `src/test/` – Test setup and integration tests.
- `src/assets/` – Fonts and optimized images.
- `public/` – Static files copied as-is.
- Config: `astro.config.mjs`, `tailwind.config.mjs`, `vitest.config.js`.

## Alpine controllers

Controllers live beside components as TypeScript modules ending in `Controller.ts`. Each module exports a default function returning an object with reactive state, lifecycle hooks, and methods:

```ts
export default function ModalController() {
  return {
    isModalOpen: false,
    init() {
      /* setup */
    },
    openModal(id: string) {
      /* ... */
    },
    // ...
  }
}
```

Controllers are registered on the `alpine:init` event:

```js
import ModalController from '../components/ModalController'

document.addEventListener('alpine:init', () => {
  Alpine.data('modalController', ModalController)
})
```

Attach them to markup with `x-data="modalController"`. The optional `init` method runs on mount and can register DOM listeners or perform setup.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test             # run tests in watch mode
npm run test:coverage  # generate coverage report
```

### Build & preview

```bash
npm run build
npm run preview
```

## Architectural notes

- **Styling:** Tailwind CSS via `@astrojs/tailwind` provides utility classes and theming.
- **Interactivity:** Alpine.js powers modular controllers for dynamic behaviour.
- **Testing:** Vitest with `happy-dom` and Testing Library drives unit and integration tests.
- **Tooling:** TypeScript, ESLint, and Prettier enforce consistent code style.
