# Tic Tac Toe — Ocean Professional

A modern, responsive Tic Tac Toe built with React and vanilla CSS. Play locally in Player vs Player or Player vs Computer modes. No backend required.

## Features
- 3×3 grid with click interactions and alternating turns
- Game state with win/draw detection, highlighted winning line, and reset
- Mode toggle: Player vs Player (PvP) and Player vs Computer (PvC), AI plays as O
- Simple AI strategy: win if possible, else block, else center, corners, first available
- Ocean Professional theme: blue primary (#2563EB), amber accents (#F59E0B), clean surfaces, gradients, rounded corners, subtle shadows
- Responsive layout for mobile and desktop, keyboard accessible (focus cells, press Enter/Space)

## Run locally
- Requirements: Node 16+ recommended

Install and start:
```bash
npm install
npm start
```
The app runs at http://localhost:3000.

Build for production:
```bash
npm run build
```

## Environment variables
The app runs without any env vars set. If present, these are read safely:
- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_LOG_LEVEL

You may create a `.env` file (optional) to set them, but none are required to run.

## Accessibility
- Each cell is a focusable button with an accessible label
- Enter or Space places a mark if the cell is empty on your turn
- Live region status announces turns and results

## Notes
- No backend calls; all game logic is client-side
- Do not modify preview/start scripts; they use CRA defaults
