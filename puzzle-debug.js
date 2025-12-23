/* puzzle-debug.js
   Dev-only debug UI + tools
*/

import { scramblePuzzle } from "./puzzle-scramble.js";
import { solveWithAnimation } from "./puzzle-solver.js";

window.addEventListener("load", () => {
  const mount = document.getElementById("message");
  if (!mount) return;

  mount.innerHTML = `
    <div style="
      background:#c40000;
      color:white;
      text-align:center;
      font-size:20px;
      font-weight:900;
      padding:12px;
      margin-bottom:16px;
    ">
      INTERNAL DEBUG MODE ACTIVE
    </div>

    <div id="debug-controls" style="text-align:center;margin-bottom:18px">
      <select id="difficulty">
        <option value="3">Easy (3)</option>
        <option value="10">Medium (10)</option>
        <option value="30">Hard (30)</option>
        <option value="80">Insane (80)</option>
      </select>
      <button id="scrambleBtn">Scramble</button>
      <button id="solveBtn">Solve</button>
      <div id="debugStatus" style="margin-top:10px;font-size:14px"></div>
    </div>
  `;

  const debugStatus = document.getElementById("debugStatus");
  const scrambleBtn = document.getElementById("scrambleBtn");
  const solveBtn = document.getElementById("solveBtn");
  const difficultyEl = document.getElementById("difficulty");

  let SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;

  difficultyEl.addEventListener("change", e => {
    SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
    debugStatus.textContent = `Difficulty set to ${SCRAMBLE_MOVES} moves.`;
  });

  scrambleBtn.addEventListener("click", () =>
    scramblePuzzle(SCRAMBLE_MOVES, msg => debugStatus.textContent = msg)
  );

  solveBtn.addEventListener("click", () =>
    solveWithAnimation(msg => debugStatus.textContent = msg)
  );
});
