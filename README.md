# GSAP Dock Navigation — Mac-style

A small, polished demo showing a macOS-style dock navigation with fluid GSAP animations and modular motion controllers.

## Overview

This repository implements a dock-style navigation UI with smooth, performant animations powered by **GSAP**. The codebase is modular and focused on small components that drive the dock behavior, hover effects and panel rendering.

Key points:

- Reversible GSAP timelines for interactive motion
- Modular controllers (motion driver, panel hover controller)
- Lightweight, performant code (Vite + Rolldown)
- Developer-friendly tooling (ESLint, HMR)

## Features

- Dock navigation with hover and reveal animations
- Staggered and reversible timelines using GSAP
- Modular code in `src/scripts/dock-navigation/`
- Responsive and accessible markup
- Fast development with Vite (Rolldown)

## Project Structure

```
.
├── index.html
├── src/
│   ├── scripts/
│   │   ├── main.js
│   │   └── dock-navigation/
│   │       ├── config.js
│   │       ├── dock-navigation.js
│   │       ├── dock-renderer.js
│   │       ├── dom-elements.js
│   │       ├── motion-driver.js
│   │       └── panel-hover-controller.js
│   └── styles/
│       └── style.css
├── public/                 # static assets
├── package.json
├── eslint.config.mjs
├── LICENSE
└── README.md
```

## Tech Stack

- Animation: `gsap` (v3.14.2)
- Build: `vite` (Rolldown via `rolldown-vite`)
- Linting: `eslint` with `@antfu/eslint-config`
- Package manager: `pnpm`

## Getting Started

### Prerequisites

- Node.js 18+ (or current LTS)
- pnpm 8+ (or npm/yarn, though pnpm is recommended)

### Install

Clone and install:

```bash
git clone https://github.com/jmarellanes/gsap__nav--mac-style.git
cd gsap__nav--mac-style
pnpm install
```

### Development

Start the dev server with HMR:

```bash
pnpm dev
```

Open the site at the address printed by Vite (commonly http://localhost:5173).

### Build / Preview

Create a production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Available Scripts

This project exposes the standard scripts defined in `package.json`:

- `pnpm dev` — start development server with HMR
- `pnpm build` — build production assets
- `pnpm preview` — preview production build
- `pnpm lint` — run ESLint
- `pnpm lint:fix` — auto-fix lintable issues

## How It Works (high level)

- `src/scripts/main.js` initializes the UI and wires up the dock navigation.
- The `dock-navigation/` modules split responsibilities:
  - `dom-elements.js` — query and cache DOM nodes
  - `config.js` — shared constants and timing
  - `motion-driver.js` — GSAP timeline orchestration
  - `panel-hover-controller.js` — hover behavior for panels
  - `dock-renderer.js` — rendering helpers
- Animations use GSAP timelines with staggered sequences and reversing capability for smooth enter/leave motions.

## Customization

- Tweak timings and easings in `src/scripts/dock-navigation/config.js`.
- Update visual styles in `src/styles/style.css`.
- Add icons or images under `src/assets/` or `public/`.

## Troubleshooting

- Animations not running: check DevTools console for errors and ensure `gsap` is installed.
- Build issues: remove `node_modules` and reinstall (`rm -rf node_modules && pnpm install`).

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

Last updated: March 2026
