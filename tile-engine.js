/* tile-engine.js
   Sliding Puzzle Engine
   - Smooth sliding
   - Daily deterministic scramble (UTC) with ?moves= override
   - Debug-only scramble + solver
   - Solved panel + sharing hook
*/

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";

// Default daily scramble moves
const DEFAULT_DAILY_MOVES = 25;

let board = [];
let blankPos = { row: 0, col: 0 };
let tilesByValue = {};

let isScrambling = false;
let isSolving = false;
let SCRAMBLE_MOVES = 3;

// Count moves for the current run (player + debug solve + debug scramble),
// but we reset to 0 after the *initial* daily scramble.
let moveCount = 0;

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

  // ✅ Daily deterministic scramble on load (UTC), always solvable
  scrambleDailyOnLoad();

  updateAllTileTransforms();
  updateSolvedUI();

  // Share hook (share.js owns the message; engine passes moves)
  if (shareFbSolvedBtn) {
    shareFbSolvedBtn.addEventListener("click", () => {
      if (typeof shareOnFacebook === "function") {
        shareOnFacebook(moveCount);
      }
    });
  }

  // Debug tools
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
      if (r === PUZZLE_SIZE - 1 && c === PUZZLE_SIZE - 1) {
        board[r][c] = null;
        blankPos = { row: r, col: c };
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

    // ✅ Correct slice mapping for tile value
    // where this tile belongs in the solved grid
   const srcRow = Math.floor(value / PUZZLE_SIZE);
   const srcCol = value % PUZZLE_SIZE;



    tile.style.backgroundImage = `url(${IMAGE_PATH})`;
    tile.style.backgroundPosition = `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

    tile.addEventListener("click", () => {
      if (isScrambling || isSolving) return;
      const pos = findTile(value);
      if (pos) tryMoveTile(pos.r, pos.c, true);
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
      tilesByValue[v].style.transform = `translate(${c * TILE_PX}px, ${r * TILE_PX}px)`;
    }
  }
}

function tryMoveTile(r, c, countMove) {
  if (Math.abs(r - blankPos.row) + Math.abs(c - blankPos.col) !== 1) return false;

  moveTileIntoBlank(r, c);
  if (countMove) moveCount++;

  updateAllTileTransforms();
  updateSolvedUI();
  return true;
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
      if (r === PUZZLE_SIZE - 1 && c === PUZZLE_SIZE - 1) {
        return board[r][c] === null;
      }
      if (board[r][c] !== expected++) return false;
    }
  }
  return true;
}


function updateSolvedUI() {
  if (!solvedPanelEl) return;
  solvedPanelEl.style.display = isSolved() ? "block" : "none";
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

/* ============================================================
   ✅ Daily deterministic scramble (UTC), always legal/solvable
============================================================ */

// YYYYMMDD based on UTC
function utcDayKey() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

// URL override: ?moves=25
function getDailyMoveCount() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("moves");
  if (!raw) return DEFAULT_DAILY_MOVES;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_DAILY_MOVES;
  return Math.min(n, 5000); // safety cap
}

// xmur3 + mulberry32: deterministic PRNG from string seed
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scrambleDailyOnLoad() {
  const seedStr = utcDayKey();
  const moves = getDailyMoveCount();

  // seeded RNG
  const seedFn = xmur3(seedStr);
  const rand = mulberry32(seedFn());

  // apply legal moves from solved => always solvable
  let lastTile = null;

  for (let i = 0; i < moves; i++) {
    const neighbors = getBlankNeighbors().filter(p => board[p.r][p.c] !== lastTile);

    // in rare cases (shouldn't happen), fallback to all neighbors
    const opts = neighbors.length ? neighbors : getBlankNeighbors();

    const choice = opts[Math.floor(rand() * opts.length)];
    lastTile = board[choice.r][choice.c];

    // do not count these moves as part of the run
    tryMoveTile(choice.r, choice.c, false);
  }

  // Ensure the run starts at 0 moves for the player
  moveCount = 0;

  if (DEBUG_MODE) {
    setDebugStatus(`Daily scramble seed=${seedStr}, moves=${moves}`);
  }
}

/* ----------------------------
   Scramble (debug only, animated)
----------------------------- */
function scramblePuzzle(count) {
  if (isScrambling || isSolving) return;
  isScrambling = true;

  // Start a fresh run when scrambling in debug
  moveCount = 0;
  updateSolvedUI();

  let lastTile = null;

  function step(movesLeft) {
    if (movesLeft <= 0) {
      isScrambling = false;
      setDebugStatus(`Scrambled ${count} moves.`);
      return;
    }

    const neighbors = getBlankNeighbors().filter(p => board[p.r][p.c] !== lastTile);
    const opts = neighbors.length ? neighbors : getBlankNeighbors();

    const choice = opts[Math.floor(Math.random() * opts.length)];
    lastTile = board[choice.r][choice.c];

    // debug scramble counts normally (per your earlier rule)
    tryMoveTile(choice.r, choice.c, true);

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
    { dir: "up", dr: -1, dc: 0 },
    { dir: "down", dr: 1, dc: 0 },
    { dir: "left", dr: 0, dc: -1 },
    { dir: "right", dr: 0, dc: 1 }
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
      updateSolvedUI();
      setDebugStatus(`Solved in ${moves.length} moves.`);
      isSolving = false;
      return;
    }

    applyMove(moves[i++]);
    updateAllTileTransforms();
    updateSolvedUI();
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

  // solver moves count normally (per your rule)
  tryMoveTile(tr, tc, true);
  return true;
}
