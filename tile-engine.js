/* tile-engine.js */

import {
  initBoardSolved,
  tryMoveTile,
  findTile,
  isSolved,
  moveCount
} from "./puzzle-state.js";

import {
  initRender,
  createTilesOnce,
  updateAllTileTransforms,
  showSolvedPanel
} from "./puzzle-render.js";

import { scramblePuzzle } from "./puzzle-scramble.js";
import { solveWithAnimation } from "./puzzle-solver.js";

const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";
let SCRAMBLE_MOVES = 3;

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
      shareOnFacebook({
        url: window.location.href,
        quote: `I just solved the Edmunds.com tile puzzle in ${moveCount} moves`
      });
    });
  }

  if (DEBUG_MODE) {
    document.getElementById("debug-controls").style.display = "block";

    document.getElementById("scrambleBtn")
      ?.addEventListener("click", () =>
        scramblePuzzle(SCRAMBLE_MOVES, msg =>
          document.getElementById("debugStatus").textContent = msg
        )
      );

    document.getElementById("solveBtn")
      ?.addEventListener("click", () =>
        solveWithAnimation(msg =>
          document.getElementById("debugStatus").textContent = msg
        )
      );
  }
});
