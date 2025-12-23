/* puzzle-debug.js
   Dev-only debug UI + tools
*/

import { scramblePuzzle } from "./puzzle-scramble.js";
import { solveWithAnimation } from "./puzzle-solver.js";

let SCRAMBLE_MOVES = 3;

document.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById("debug-controls");
  if (!controls) return;

  controls.style.display = "block";

  const debugStatus = document.getElementById("debugStatus");
  const scrambleBtn = document.getElementById("scrambleBtn");
  const solveBtn = document.getElementById("solveBtn");
  const difficultyEl = document.getElementById("difficulty");

  if (difficultyEl) {
    SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;
    difficultyEl.addEventListener("change", e => {
      SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
      if (debugStatus) debugStatus.textContent =
        `Difficulty set to ${SCRAMBLE_MOVES} moves.`;
    });
  }

  scrambleBtn?.addEventListener("click", () =>
    scramblePuzzle(SCRAMBLE_MOVES, msg => {
      if (debugStatus) debugStatus.textContent = msg;
    })
  );

  solveBtn?.addEventListener("click", () =>
    solveWithAnimation(msg => {
      if (debugStatus) debugStatus.textContent = msg;
    })
  );
});
