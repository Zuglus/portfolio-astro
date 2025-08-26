# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro routes (`index.astro`, `privacy.astro`, `offline.astro`).
- `src/components/`: UI building blocks (e.g., `ProjectCard.astro`, `ui/` skeletons).
- `src/layouts/`: Shared page wrappers (e.g., `Layout.astro`).
- `src/styles/`: Global and component CSS utilities.
- `src/data/`: Typed data sources and tests.
- `src/utils/`: Utilities (e.g., `logger.ts`).
- `src/test/`: Test setup and integration tests.
- `src/assets/`: Fonts and images optimized by Astro.
- `public/`: Static files copied as‑is.
- Config: `astro.config.mjs`, `tailwind.config.mjs`, `vitest.config.js`.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server with HMR.
- `npm run build`: Produce static site in `dist/`.
- `npm run preview`: Serve the production build.
- `npm test`: Run Vitest in watch/interactive mode.
- `npm run test:coverage`: Generate coverage report.
- `npm run lint`: Lint with ESLint (Astro, TS, Standard rules).
- `npm run format` / `format:check`: Prettier with `prettier-plugin-astro`.

## Coding Style & Naming Conventions
- Formatting: Prettier (2‑space indent, single quotes per repo defaults).
- Linting: ESLint with `eslint-plugin-astro`, TypeScript, Standard config.
- Components: PascalCase (`ProgressiveImage.astro`).
- Files: kebab‑case for CSS and assets; tests end with `.test.ts`.
- CSS: Prefer utilities in `src/styles/`; Tailwind for layout/spacing.

## Testing Guidelines
- Framework: Vitest (`happy-dom`), Testing Library available.
- Location: Unit/component tests in `src/components/__tests__/`; data and integration in `src/data/` and `src/test/`.
- Commands: `npm test`, `npm run test:coverage`.
- Aim: Keep coverage for core utils/components; add tests for new features and bug fixes.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits seen in history: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `build(deps):`. Use imperative mood; add scope when helpful (e.g., `feat(header): ...`).
- PRs: Provide a clear summary, link issues, include screenshots/GIFs for UI changes, list test coverage or steps to verify, and note any performance or accessibility impacts.

## Security & Configuration Tips
- Do not commit secrets; prefer runtime configuration. Keep large assets in `src/assets/` or `public/` as appropriate.
- Validate builds (`npm run build`) and run all tests before opening a PR.
