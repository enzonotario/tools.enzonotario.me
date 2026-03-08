# Development guide (agents & contributors)

Use this file as the single source of truth when adding or changing code in this repo.

## Code style

- **Do not add leading/top-of-file comments** (no “overview” or “this file does X” at the top of modules). Prefer clear names and small, focused modules over explanatory headers.
- **ESLint**: follow the project config (no trailing commas, 1tbs brace style). Run `pnpm run lint` before committing.
- **TypeScript**: use strict typing. Prefer `interface` for object shapes and explicit return types for public functions when it helps readability.
- **Vue**: use Composition API with `<script setup lang="ts">`. Keep templates declarative; put logic in composables or utils.

## Project structure

- **`app/pages/`**: one folder per tool (e.g. `formatter/`, `hash-generator/`, `case-converter/`). Use `index.vue` as the main page.
- **`app/composables/`**: shared Vue composables (e.g. `useTools`). Auto-imported by Nuxt.
- **`app/utils/`**: pure or mostly pure logic (hashing, case conversion, ASCII fonts, etc.). No Vue; can be used from pages or composables.
- **`app/components/`**: reusable UI. Prefer Nuxt UI primitives; add custom components only when needed.
- **`app/stores/`**: Pinia stores for shared state (e.g. invoice, token generator, split pane sizes).
- **`locales/`**: i18n JSON files (`en.json`, `es.json`). All user-facing strings must go through i18n.

## Adding a new tool

1. **Register the tool** in `app/composables/useTools.ts`: add an entry with `id`, `label`, `description`, `icon` (e.g. `i-lucide-*`), `category` (`development` | `design` | `utilities`), and `to` (route path, e.g. `/my-tool`).
2. **Create the page** under `app/pages/<tool-id>/index.vue`. Use `definePageMeta({ layout: 'dashboard' })`. For full-height, split layouts follow the formatter/ascii-art pattern (see below).
3. **i18n**: add every new user-visible string to both `locales/en.json` and `locales/es.json` using the same key. Use `$t('key')` in templates and `t('key')` in script (via `useI18n()`).

## Layout pattern for tools

Tools that need “input full height + output panel” should follow the formatter/ascii-art pattern:

- **Header actions**: put the **Clear** button and other primary toolbar actions in the dashboard header using `<Teleport to="#header-actions-portal">`. This keeps the header consistent and leaves the panes for content. Example:
  ```vue
  <Teleport to="#header-actions-portal">
    <UButton variant="outline" size="sm" icon="i-lucide-x" @click="clearAll">
      {{ $t('Clear') }}
    </UButton>
  </Teleport>
  ```
- Root: `<div class="w-full h-full split-pane-wrapper">`.
- Wrap content in `<ClientOnly>` and use the shared `<SplitPane>` component with `split="vertical"`, `:min-percent="20"`, `:default-percent="50"`, and a unique `storage-key` (e.g. `storage-key="my-tool"`).
- **Left pane**: optional `shrink-0` toolbar only if the tool needs in-pane controls (e.g. style selector); then a single `<UTextarea>` (or equivalent) with `class="font-mono text-sm flex-1"` and `:ui="{ base: 'block w-full h-full resize-none' }"` inside a `flex-1 flex flex-col min-h-0` container so it fills the remaining height.
- **Right pane**: toolbar (e.g. Copy) then a scrollable result area with `flex-1 flex flex-col min-h-0 overflow-auto` and a bordered/content container inside.
- Provide a `<template #fallback>` for `<ClientOnly>` (e.g. two-column layout with “Loading…” on the right) for SSR/hydration.
- Use scoped style: `.split-pane-wrapper { position: relative; height: 100%; }` if needed.

## Internationalization (i18n)

- **Locales**: `locales/en.json` and `locales/es.json`. Same keys in both; values translated.
- **Usage**: in templates use `{{ $t('key') }}` or `:placeholder="$t('key')"`; in script call `const { t } = useI18n()` then `t('key')`.
- **Tool labels/descriptions**: the `label` and `description` in `useTools` must use `t('...')` so they are translated. Add the corresponding entries in both locale files.
- **New features**: for every new UI string, add one key and translate it in EN and ES. Prefer short, consistent key names (e.g. `hashPlaceholder`, `caseConverterPlaceholder`).

## Best practices

- **Composables**: extract reusable state and logic (e.g. clipboard, validation) into composables rather than duplicating in pages.
- **Utils**: keep `app/utils/` free of Vue and Nuxt. Pure functions and small modules only; easy to test and reuse.
- **Stores**: use Pinia for state that is shared across multiple components or that must persist (e.g. split pane sizes via `storage-key`).
- **Toasts**: use `useToast()` from Nuxt UI for success/error feedback (e.g. “Copied”, “Copy failed”). Use existing i18n keys where available (e.g. “Copied”, “Copy failed”).
- **Accessibility**: use semantic HTML and Nuxt UI components as intended. Ensure buttons and form controls have clear labels.

## Design patterns in use

- **Split pane**: shared `SplitPane` component and optional Pinia store for persisting sizes; `storage-key` per tool.
- **Tool registry**: single list in `useTools()`; categories and navigation are derived from it.
- **Client-only UI**: tools that depend on layout or browser APIs (e.g. split pane, clipboard) wrap their main UI in `<ClientOnly>` with a simple fallback.

## Conventions

- **Routes**: kebab-case (e.g. `/hash-generator`, `/case-converter`). Redirects for legacy paths go in `nuxt.config.ts` `routeRules` if needed.
- **Icons**: Lucide via `@iconify-json/lucide`; use the `i-lucide-<name>` class/icon name.
- **Package manager**: pnpm. Use `pnpm add <pkg>` for new dependencies.
