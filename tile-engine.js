/* tile-engine.js - Smooth sliding + Debug-only controls + A* solver */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";

let board = [];                  // 2D array values 0..14, null for blank
let blankPos = { row: 0, col: 0 };
let tilesByValue = {};           // value -> HTMLElement

let isScrambling = false;
let isSolving = false;
let SCRAMBLE_MOVES = 3;

let gridEl, difficultyEl, scrambleBtn, solveBtn, debugControlsEl, debugStatusEl;

// Debug mode is enabled ONLY when URL includes ?debug=1
const DEBUG_MODE = new URLSearchParams(window.location.search).get("debug") === "1";

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");
  debugControlsEl = document.getElementById("debug-controls");
  debugStatusEl = document.getElementById("debugStatus");

  // Debug-only elements may not exist in production layout; that's okay.
  difficultyEl = document.getElementById("difficulty");
  scrambleBtn = document.getElementById("scrambleBtn");
  solveBtn = document.getElementById("solveBtn");

  initBoardSolved();
  createTilesOnce();
  updateAllTileTransforms();

  if (DEBUG_MODE && debugControlsEl) {
    debugControlsEl.style.display = "block";

    if (difficultyEl) {
      SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;
      difficultyEl.addEventListener("change", (e) => {
        SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
        setDebugStatus(`Difficulty set to ${SCRAMBLE_MOVES} moves.`);
      });
    }

    if (scrambleBtn) {
      scrambleBtn.addEventListener("click", () => scramblePuzzle(SCRAMBLE_MOVES));
    }

    if (solveBtn) {
      solveBtn.addEventListener("click", async () => {
        if (isScrambling || isSolving) return;
        await solveWithAnimation();
      });
    }

    setDebugStatus("Debug mode enabled. You can scramble and solve.");
  }
});

/* ----------------------------
   Board init: solved with blank at top-left
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
   Create tile DOM nodes ONCE
----------------------------- */
function createTilesOnce() {
  gridEl.innerHTML = "";
  tilesByValue = {};

  for (let value = 0; value < (PUZZLE_SIZE * PUZZLE_SIZE - 1); value++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.style.width = TILE_PX + "px";
    tile.style.height = TILE_PX + "px";
    tile.dataset.value = String(value);

    // Slice mapping: skip the blank slice (top-left), so use value+1
    const srcIndex = value + 1; // 1..15
    const srcRow = Math.floor(srcIndex / PUZZLE_SIZE);
    const srcCol = srcIndex % PUZZLE_SIZE;

    tile.style.backgroundImage = `url(${IMAGE_PATH})`;
    tile.style.backgroundPosition = `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

    tile.addEventListener("click", () => {
      if (isScrambling || isSolving) return;
      const v = parseInt(tile.dataset.value, 10);
      const pos = findTile(v);
      if (!pos) return;
      tryMoveTile(pos.r, pos.c);
    });

    gridEl.appendChild(tile);
    tilesByValue[value] = tile;
  }
}

/* ----------------------------
   Helpers
----------------------------- */
function setDebugStatus(msg) {
  if (debugStatusEl) debugStatusEl.textContent = msg;
}

function findTile(value) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (board[r][c] === value) return { r, c };
    }
  }
  return null;
}

function updateAllTileTransforms() {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const value = board[r][c];
      if (value === null) continue;
      const el = tilesByValue[value];
      if (!el) continue;
      el.style.transform = `translate(${c * TILE_PX}px, ${r * TILE_PX}px)`;
    }
  }
}

function tryMoveTile(r, c) {
  const dr = Math.abs(r - blankPos.row);
  const dc = Math.abs(c - blankPos.col);
  if (dr + dc !== 1) return;

  moveTileIntoBlank(r, c);
  updateAllTileTransforms();
}

function moveTileIntoBlank(r, c) {
  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };
}

function getBlankNeighbors() {
  const { row, col } = blankPos;
  const n = [];
  if (row > 0) n.push({ r: row - 1, c: col });
  if (row < PUZZLE_SIZE - 1) n.push({ r: row + 1, c: col });
  if (col > 0) n.push({ r: row, c: col - 1 });
  if (col < PUZZLE_SIZE - 1) n.push({ r: row, c: col + 1 });
  return n;
}

/* ----------------------------
   Debug scramble (solvable by construction)
   Rule: don't move same tile twice in a row
----------------------------- */
function scramblePuzzle(moveCount) {
  if (isScrambling || isSolving) return;
  isScrambling = true;

  let movesLeft = moveCount;
  let lastTileValue = null;

  function step() {
    const neighbors = getBlankNeighbors();
    const filtered = neighbors.filter(p => board[p.r][p.c] !== lastTileValue);
    const choices = filtered.length ? filtered : neighbors;

    const choice = choices[Math.floor(Math.random() * choices.length)];
    const tileValue = board[choice.r][choice.c];

    moveTileIntoBlank(choice.r, choice.c);
    lastTileValue = tileValue;
    updateAllTileTransforms();

    movesLeft--;
    if (movesLeft > 0) {
      setTimeout(step, 220);
    } else {
      isScrambling = false;
      setDebugStatus(`Scrambled ${moveCount} move(s).`);
    }
  }

  if (moveCount <= 0) {
    isScrambling = false;
    return;
  }

  setDebugStatus(`Scrambling ${moveCount} move(s)...`);
  step();
}

/* ============================================================
   A* SOLVER (Debug)
   - Works from any reachable state
   - Returns a move list, then we animate it
============================================================ */

/** Convert current board[][] to flat array of length 16 using 0 as blank */
function boardToState() {
  const s = new Array(PUZZLE_SIZE * PUZZLE_SIZE);
  let k = 0;
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const v = board[r][c];
      s[k++] = (v === null) ? 0 : (v + 1); // store tiles as 1..15, blank as 0
    }
  }
  return s;
}

/** Goal state: [0,1,2,...,15] with blank at index 0 (top-left) */
function goalState() {
  const g = new Array(16);
  for (let i = 0; i < 16; i++) g[i] = i;
  return g;
}

/** Manhattan distance heuristic */
function manhattan(state) {
  let dist = 0;
  for (let i = 0; i < 16; i++) {
    const tile = state[i];
    if (tile === 0) continue; // blank
    const goalIndex = tile;   // tile value equals its goal index in our goal definition
    const r1 = Math.floor(i / 4), c1 = i % 4;
    const r2 = Math.floor(goalIndex / 4), c2 = goalIndex % 4;
    dist += Math.abs(r1 - r2) + Math.abs(c1 - c2);
  }
  return dist;
}

function keyOf(state) {
  // Fast-ish key for visited: join with commas
  return state.join(",");
}

function findBlankIndex(state) {
  return state.indexOf(0);
}

function neighborsOf(state) {
  const res = [];
  const bi = findBlankIndex(state);
  const r = Math.floor(bi / 4), c = bi % 4;

  // Moves are defined by which direction the BLANK moves.
  // We'll animate by moving the adjacent tile into blank, equivalent.
  if (r > 0) res.push({ move: "up",    swapWith: bi - 4 });
  if (r < 3) res.push({ move: "down",  swapWith: bi + 4 });
  if (c > 0) res.push({ move: "left",  swapWith: bi - 1 });
  if (c < 3) res.push({ move: "right", swapWith: bi + 1 });

  for (const n of res) {
    const next = state.slice();
    next[bi] = next[n.swapWith];
    next[n.swapWith] = 0;
    n.state = next;
  }
  return res;
}

/** Simple binary heap priority queue */
class MinHeap {
  constructor() { this.a = []; }
  push(item) {
    this.a.push(item);
    this._bubbleUp(this.a.length - 1);
  }
  pop() {
    if (this.a.length === 0) return null;
    const top = this.a[0];
    const end = this.a.pop();
    if (this.a.length > 0) {
      this.a[0] = end;
      this._sinkDown(0);
    }
    return top;
  }
  get size() { return this.a.length; }
  _bubbleUp(n) {
    const a = this.a;
    while (n > 0) {
      const p = Math.floor((n - 1) / 2);
      if (a[n].f >= a[p].f) break;
      [a[n], a[p]] = [a[p], a[n]];
      n = p;
    }
  }
  _sinkDown(n) {
    const a = this.a;
    const len = a.length;
    while (true) {
      let left = 2 * n + 1, right = 2 * n + 2;
      let smallest = n;
      if (left < len && a[left].f < a[smallest].f) smallest = left;
      if (right < len && a[right].f < a[smallest].f) smallest = right;
      if (smallest === n) break;
      [a[n], a[smallest]] = [a[smallest], a[n]];
      n = smallest;
    }
  }
}

/** A* search returning a list of moves like ["down","right",...] */
function solveAStar(start, goal) {
  const startKey = keyOf(start);
  const goalKey = keyOf(goal);

  const open = new MinHeap();
  open.push({ state: start, key: startKey, g: 0, f: manhattan(start) });

  const cameFrom = new Map(); // key -> { prevKey, move }
  const gScore = new Map();
  gScore.set(startKey, 0);

  let expansions = 0;

  while (open.size > 0) {
    const current = open.pop();
    if (!current) break;

    if (current.key === goalKey) {
      // reconstruct
      const moves = [];
      let k = current.key;
      while (k !== startKey) {
        const prev = cameFrom.get(k);
        if (!prev) break;
        moves.push(prev.move);
        k = prev.prevKey;
      }
      moves.reverse();
      return { moves, expansions };
    }

    expansions++;
    const neigh = neighborsOf(current.state);

    for (const n of neigh) {
      const nk = keyOf(n.state);
      const tentativeG = current.g + 1;
      const bestG = gScore.get(nk);

      if (bestG === undefined || tentativeG < bestG) {
        cameFrom.set(nk, { prevKey: current.key, move: n.move });
        gScore.set(nk, tentativeG);
        const f = tentativeG + manhattan(n.state);
        open.push({ state: n.state, key: nk, g: tentativeG, f });
      }
    }

    // Safety valve for debug usage (prevents runaway in worst cases)
    if (expansions > 200000) {
      return { moves: null, expansions };
    }
  }

  return { moves: null, expansions };
}

/** Apply a solver move to the live board (blank moves direction) */
function applyMove(dir) {
  const r = blankPos.row, c = blankPos.col;
  let tr = r, tc = c;

  if (dir === "up") tr = r - 1;
  if (dir === "down") tr = r + 1;
  if (dir === "left") tc = c - 1;
  if (dir === "right") tc = c + 1;

  // move tile at (tr,tc) into blank
  if (tr < 0 || tr >= 4 || tc < 0 || tc >= 4) return false;
  if (board[tr][tc] === null) return false;

  moveTileIntoBlank(tr, tc);
  return true;
}

async function solveWithAnimation() {
  if (!DEBUG_MODE) return;
  isSolving = true;

  setDebugStatus("Solving (A*)...");

  const start = boardToState();
  const goal = goalState();

  // Quick check: already solved?
  if (keyOf(start) === keyOf(goal)) {
    setDebugStatus("Already solved.");
    isSolving = false;
    return;
  }

  const { moves, expansions } = solveAStar(start, goal);

  if (!moves) {
  /*
  If you ever notice “No solution found” due to the expansion cap, we can:
    • increase the cap, or
    • switch to IDA* (memory-light, standard for 15-puzzle), or
    • run the solver in a Web Worker to keep UI silky smooth.
  */
  console.warn(
    "[Puzzle Solver] A* search terminated without a solution. " +
    `Expanded ${expansions} states. This does NOT mean the puzzle is unsolvable.`
  );

  setDebugStatus(`No solution found (expansions: ${expansions}).`);
  isSolving = false;
  return;
}


  setDebugStatus(`Solution found: ${moves.length} moves (expanded ${expansions}). Animating...`);

  // Animate step-by-step
  let i = 0;
  const stepDelay = 180;

  function step() {
    if (i >= moves.length) {
      updateAllTileTransforms();
      setDebugStatus(`Solved in ${moves.length} moves.`);
      isSolving = false;
      return;
    }

    const ok = applyMove(moves[i]);
    i++;

    updateAllTileTransforms();

    if (!ok) {
      setDebugStatus("Animation error: illegal move encountered.");
      isSolving = false;
      return;
    }

    setTimeout(step, stepDelay);
  }

  step();
}
