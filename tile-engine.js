/* tile-engine.js
   Coordinator / wiring only
*/

import { state, initBoardSolved, tryMoveTile, findTile, isSolved } from "./puzzle-state.js";
import { initRender, createTilesOnce, updateAllTileTransforms, showSolvedPanel } from "./puzzle-render.js";
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
        quote: `I just solved the Edmunds.com tile puzzle in ${state.moveCount} moves`
      });
    });
  }

  if (DEBUG_MODE) {
    const controls = document.getElementById("debug-controls");
    const debugStatus = document.getElementById("debugStatus");
    const scrambleBtn = document.getElementById("scrambleBtn");
    const solveBtn = document.getElementById("solveBtn");
    const difficultyEl = document.getElementById("difficulty");

    if (controls) controls.style.display = "block";

    if (difficultyEl) {
      SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;
      difficultyEl.addEventListener("change", e => {
        SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
        if (debugStatus) debugStatus.textContent = `Difficulty set to ${SCRAMBLE_MOVES} moves.`;
      });
    }

    if (scrambleBtn) {
      scrambleBtn.addEventListener("click", () =>
        scramblePuzzle(SCRAMBLE_MOVES, msg => {
          if (debugStatus) debugStatus.textContent = msg;
        })
      );
    }

    if (solveBtn) {
      solveBtn.addEventListener("click", () =>
        solveWithAnimation(msg => {
          if (debugStatus) debugStatus.textContent = msg;
        })
      );
    }
  }
});
