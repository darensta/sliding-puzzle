/* Filename: tile-engine.js */
/* Sliding Puzzle Engine - Smooth Animation + Difficulty */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;

// TODO later: swap to daily UTC image selection
const IMAGE_PATH = "images/20251204.jpg";

let board = []; // 2D array storing tile values (0..14) or null for blank
let blankPos = { row: 0, col: 0 };
let tilesByValue = {}; // value -> DOM element

let isScrambling = false;
let SCRAMBLE_MOVES = 3;

let gridEl;
let difficultyEl;
let scrambleBtn;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");
  difficultyEl = document.getElementById("difficulty");
  scrambleBtn = document.getElementById("scrambleBtn");

  if (!gridEl || !difficultyEl || !scrambleBtn) {
    console.error("Missing required elements: #grid, #difficulty, or #scrambleBtn");
    return;
  }

  SCRAMBLE_MOVES = parseInt(difficultyEl.value, 10) || 3;

  difficultyEl.addEventListener("change", (e) => {
    SCRAMBLE_MOVES = parseInt(e.target.value, 10) || 3;
  });

  scrambleBtn.addEventListener("click", () => scramblePuzzle(SCRAMBLE_MOVES));

  initBoardSolved();
  createTilesOnce();
  updateAllTileTransforms();
});

/* ----------------------------
   Start solved: blank in top-left
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
   Create tile DOM elements ONCE
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

    // Map value (0..14) to image slice index (1..15), skipping the blank slice
    const srcIndex = value + 1;
    const srcRow = Math.floor(srcIndex / PUZZLE_SIZE);
    const srcCol = srcIndex % PUZZLE_SIZE;

    tile.style.backgroundImage = `url(${IMAGE_PATH})`;
    tile.style.backgroundPosition = `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

    tile.addEventListener("click", () => {
      if (isScrambling) return;
      const v = parseInt(tile.dataset.value, 10);
      const pos = findTile(v);
      if (!pos) return;
      tryMoveTile(pos.r, pos.c);
    });

    gridEl.appendChild(tile);
    tilesByValue[value] = tile;
  }
}

/* Find where a tile value currently is on the board */
function findTile(value) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (board[r][c] === value) return { r, c };
    }
  }
  return null;
}

/* Apply transforms for smooth positioning */
function updateAllTileTransforms() {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const value = board[r][c];
      if (value === null) continue;
      const tileEl = tilesByValue[value];
      if (!tileEl) continue;

      tileEl.style.transform = `translate(${c * TILE_PX}px, ${r * TILE_PX}px)`;
    }
  }
}

/* Move logic for user clicks */
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

/* ----------------------------
   Scramble: legal moves from solved,
   never move same tile twice in a row
----------------------------- */
function getBlankNeighbors() {
  const n = [];
  const { row, col } = blankPos;

  if (row > 0) n.push({ r: row - 1, c: col });
  if (row < PUZZLE_SIZE - 1) n.push({ r: row + 1, c: col });
  if (col > 0) n.push({ r: row, c: col - 1 });
  if (col < PUZZLE_SIZE - 1) n.push({ r: row, c: col + 1 });

  return n;
}

function scramblePuzzle(moveCount) {
  if (isScrambling) return;
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
    }
  }

  if (moveCount <= 0) {
    isScrambling = false;
    return;
  }

  step();
}
