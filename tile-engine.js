/* tile-engine.js
   Sliding Puzzle Engine
   - Smooth sliding
   - Debug-only scramble + solver
   - A* solver for proof-of-solvability
   - Inline solved panel + sharing hook
*/

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";

let board = [];
let blankPos = { row: 0, col: 0 };
let tilesByValue = {};

let isScrambling = false;
let isSolving = false;
let SCRAMBLE_MOVES = 3;

// Debug mode enabled only with ?debug=1
const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

let gridEl, solvedPanelEl, shareFbSolvedBtn;
let difficultyEl, scrambleBtn, solveBtn, debugControlsEl, debugStatusEl;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");
  solvedPanelEl = document.getElementById("solved-panel");
  shareFbSolvedBtn = document.getElementById("shareFbSolvedBtn");

  debugControlsEl = document.getElementById("debug-controls");
  debugStatusEl = document.getElementById("debugStatus");
  difficultyEl = document.getElementById("difficulty");
  scrambleBtn = document.getElementById("scrambleBtn");
  solveBtn = document.getElementById("solveBtn");

  initBoardSolved();
  createTilesOnce();
  updateAllTileTransforms();

  if (shareFbSolvedBtn) {
    shareFbSolvedBtn.addEventListener("click", () => {
      if (typeof shareOnFacebook === "function") {
        shareOnFacebook({
          url: window.location.href,
          quote: "I just solved the sliding puzzle!"
        });
      }
    });
  }

  if (DEBUG_MODE && debugControlsEl) {
    debugControlsEl.style.display = "block";

    if (difficultyEl) {
      SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;
      difficultyEl.addEventListener("change", e => {
        SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
        setDebugStatus(`Difficulty set to ${SCRAMBLE_MOVES} moves.`);
      });
    }

    if (scrambleBtn) {
      scrambleBtn.addEventListener("click", () => scramblePuzzle(SCRAMBLE_MOVES));
    }

    if (solveBtn) {
      solveBtn.addEventListener("click", () => {
        if (!isScrambling && !isSolving) solveWithAnimation();
      });
    }

    setDebugStatus("Debug mode enabled.");
  }
});

/* ----------------------------
   Board initialization
----------------------------- */
function initBoardSolved() {
  board = [];
  let value = 0;

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        board[r][c] = null;
        blankPos = { row: 0, col: 0 };
      } else {
        board[r][c] = value++;
      }
    }
  }
}

/* ----------------------------
   Tile creation (once)
----------------------------- */
function createTilesOnce() {
  gridEl.innerHTML = "";
  tilesByValue = {};

  for (let value = 0; value < 15; value++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.value = value;
    tile.style.width = TILE_PX + "px";
    tile.style.height = TILE_PX + "px";

    const srcIndex = value + 1;
    const srcRow = Math.floor(srcIndex / PUZZLE_SIZE);
    const srcCol = srcIndex % PUZZLE_SIZE;

    tile.style.backgroundImage = `url(${IMAGE_PATH})`;
    tile.style.backgroundPosition = `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

    tile.addEventListener("click", () => {
      if (isScrambling || isSolving) return;
      const pos = findTile(value);
      if (pos) tryMoveTile(pos.r, pos.c);
    });

    gridEl.appendChild(tile);
    tilesByValue[value] = tile;
  }
}

/* ----------------------------
   Movement + rendering
----------------------------- */
function findTile(v) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (board[r][c] === v) return { r, c };
    }
  }
  return null;
}

function updateAllTileTransforms() {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const v = board[r][c];
      if (v === null) continue;
      tilesByValue[v].style.transform =
        `translate(${c * TILE_PX}px, ${r * TILE_PX}px)`;
    }
  }
}

function tryMoveTile(r, c) {
  if (Math.abs(r - blankPos.row) + Math.abs(c - blankPos.col) !== 1) return;

  moveTileIntoBlank(r, c);
  updateAllTileTransforms();

  if (isSolved()) showSolvedPanel();
}

function moveTileIntoBlank(r, c) {
  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };
}

/* ----------------------------
   Solved detection + UI
----------------------------- */
function isSolved() {
  let expected = 0;
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        if (board[r][c] !== null) return false;
      } else {
        if (board[r][c] !== expected++) return false;
      }
    }
  }
  return true;
}

function showSolvedPanel() {
  if (solvedPanelEl) solvedPanelEl.style.display = "block";
}

/* ----------------------------
   Debug helpers
----------------------------- */
function setDebugStatus(msg) {
  if (debugStatusEl) debugStatusEl.textContent = msg;
}

function getBlankNeighbors() {
  const { row, col } = blankPos;
  const n = [];
  if (row > 0) n.push({ r: row - 1, c: col });
  if (row < 3) n.push({ r: row + 1, c: col });
  if (col > 0) n.push({ r: row, c: col - 1 });
  if (col < 3) n.push({ r: row, c: col + 1 });
  return n;
}

/* ----------------------------
   Scramble (debug only)
----------------------------- */
function scramblePuzzle(count) {
  if (isScrambling || isSolving) return;
  isScrambling = true;

  let lastTile = null;

  function step(movesLeft) {
    if (movesLeft <= 0) {
      isScrambling = false;
      setDebugStatus(`Scrambled
