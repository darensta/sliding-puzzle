/* tile-engine.js
   Canonical production engine
*/

import { state, initBoardSolved, tryMoveTile, findTile, isSolved } from "./puzzle-state.js";
import { initRender, createTilesOnce, updateAllTileTransforms, showSolvedPanel } from "./puzzle-render.js";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  const solvedPanel = document.getElementById("solved-panel");
  const shareBtn = document.getElementById("shareFbSolvedBtn");

  initRender(grid, solvedPanel);
  initBoardSolved();
  createTilesOnce();
  updateAllTileTransforms();

  grid.addEventListener("click", e => {
    const tile = e.target.closest(".tile");
    if (!tile) return;

    const value = parseInt(tile.dataset.value, 10);
    const pos = findTile(value);

    if (pos && tryMoveTile(pos.r, pos.c)) {
      updateAllTileTransforms();
      if (isSolved()) showSolvedPanel();
    }
  });

  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      shareOnFacebook(state.moveCount);
    });
  }

  // Attach debug tools only if dev flag is present
  if (window.__PUZZLE_DEBUG__) {
    import("./puzzle-debug.js");
  }
});
