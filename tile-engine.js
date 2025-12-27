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

function moveCount() {
  return SCRAMBLE_MOVES ? board.flat().filter(v => v !== null).length : 0;
}

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

 shareFbSolvedBtn.addEventListener("click", () => {
  if (typeof shareOnFacebook === "function") {
    shareOnFacebook(moveCount());
  }
});


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

    const srcRow = Math.floor(value / PUZZLE_SIZE);
    const srcCol = value % PUZZLE_SIZE;


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
      setDebugStatus(`Scrambled ${count} moves.`);
      return;
    }

    const neighbors = getBlankNeighbors()
      .filter(p => board[p.r][p.c] !== lastTile);

    const choice = neighbors[Math.floor(Math.random() * neighbors.length)];
    lastTile = board[choice.r][choice.c];

    moveTileIntoBlank(choice.r, choice.c);
    updateAllTileTransforms();

    setTimeout(() => step(movesLeft - 1), 220);
  }

  step(count);
}

/* ============================================================
   A* Solver (debug-only, any state, animated)
============================================================ */
function boardToState() {
  const s = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      s.push(board[r][c] === null ? 0 : board[r][c] + 1);
    }
  }
  return s;
}

function goalState() {
  return Array.from({ length: 16 }, (_, i) => i);
}

function manhattan(state) {
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const t = state[i];
    if (t === 0) continue;
    const gr = Math.floor(t / 4), gc = t % 4;
    const r = Math.floor(i / 4), c = i % 4;
    d += Math.abs(gr - r) + Math.abs(gc - c);
  }
  return d;
}

function neighborsOf(state) {
  const res = [];
  const bi = state.indexOf(0);
  const r = Math.floor(bi / 4), c = bi % 4;

  const moves = [
    { dir: "up",    dr: -1, dc:  0 },
    { dir: "down",  dr:  1, dc:  0 },
    { dir: "left",  dr:  0, dc: -1 },
    { dir: "right", dr:  0, dc:  1 }
  ];

  for (const m of moves) {
    const nr = r + m.dr, nc = c + m.dc;
    if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
    const ni = nr * 4 + nc;
    const next = state.slice();
    next[bi] = next[ni];
    next[ni] = 0;
    res.push({ move: m.dir, state: next });
  }
  return res;
}

async function solveWithAnimation() {
  isSolving = true;
  setDebugStatus("Solving (A*)...");

  const start = boardToState();
  const goal = goalState();
  const startKey = start.join(",");
  const goalKey = goal.join(",");

  const open = [];
  const gScore = new Map([[startKey, 0]]);
  const cameFrom = new Map();

  open.push({ state: start, key: startKey, f: manhattan(start) });

  let expansions = 0;
  const MAX_EXPANSIONS = 200000;

  while (open.length && expansions < MAX_EXPANSIONS) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();

    if (current.key === goalKey) {
      const moves = [];
      let k = current.key;
      while (cameFrom.has(k)) {
        const p = cameFrom.get(k);
        moves.push(p.move);
        k = p.prev;
      }
      moves.reverse();
      return animateSolution(moves);
    }

    expansions++;

    for (const n of neighborsOf(current.state)) {
      const nk = n.state.join(",");
      const tentative = (gScore.get(current.key) || 0) + 1;

      if (!gScore.has(nk) || tentative < gScore.get(nk)) {
        gScore.set(nk, tentative);
        cameFrom.set(nk, { prev: current.key, move: n.move });
        open.push({
          state: n.state,
          key: nk,
          f: tentative + manhattan(n.state)
        });
      }
    }
  }

  console.warn(
    "[Puzzle Solver] A* terminated without a solution. " +
    `Expanded ${expansions} states. This does NOT imply unsolvable.`
  );
  setDebugStatus(`No solution found (expansions: ${expansions}).`);
  isSolving = false;
}

function animateSolution(moves) {
  let i = 0;

  function step() {
    if (i >= moves.length) {
      updateAllTileTransforms();
      showSolvedPanel();
      setDebugStatus(`Solved in ${moves.length} moves.`);
      isSolving = false;
      return;
    }

    applyMove(moves[i++]);
    updateAllTileTransforms();
    setTimeout(step, 180);
  }

  step();
}

function applyMove(dir) {
  const r = blankPos.row, c = blankPos.col;
  let tr = r, tc = c;
  if (dir === "up") tr--;
  if (dir === "down") tr++;
  if (dir === "left") tc--;
  if (dir === "right") tc++;
  if (tr < 0 || tr > 3 || tc < 0 || tc > 3) return false;
  moveTileIntoBlank(tr, tc);
  return true;
}
