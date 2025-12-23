# sliding-puzzle
Sliding puzzle game




========================================================

🚀 Production Deployment Checklist (Public Release)
========================================================

This checklist ensures the public build ships without any internal debug or solver code, while keeping the canonical game engine unchanged.

✅ 1. Verify Production Script Loading

Open index.html and confirm the only JavaScript loaded is:

- <script type="module" src="tile-engine.js"></script>
- <script src="share.js"></script>


There must be:

- ❌ No window.__PUZZLE_DEBUG__
- ❌ No debug script includes

✅ 2. Remove Dev-Only Files From Production Upload

Before publishing, do not upload the following files:
- puzzle-debug.js
- puzzle-solver.js
- puzzle-scramble.js


They must not exist on the public server.

✅ 3. Verify No Debug UI Exists

Load the production site and confirm:
- Scramble button ❌
- Solve button ❌
- Difficulty selector ❌
- Debug panel ❌
- No console logs referencing solver/debug
Only the puzzle grid, timer, and solved panel should exist.

✅ 4. Verify Cheating Is Impossible

In the browser console, confirm:
window.solveWithAnimation

returns:
undefined

And:
import('./puzzle-solver.js')

fails to load.

✅ 5. Final Visual Smoke Test

Manually verify:
- Tiles slide smoothly
- Solved detection works
- Share button opens Facebook
- Share message contains move count
- No console errors

✅ 6. Tag the Release

Create a GitHub Release:

Tag name:
prod-v1

Title:
Public Release v1 — No debug tools

Notes
Production build.
All internal solver and debug tooling stripped from public deployment.

