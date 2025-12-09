/* Sliding Puzzle Engine - Smooth Animation */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";

let board = [];
let tileElements = [];
let blankPos = { row: 0, col: 0 };

let isScrambling = false;
let SCRAMBLE_MOVES = 3;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");

  initBoard();
  createTileElements();
  updateTilePositions();

  // Scramble button
  document.getElementById("scrambleBtn")
    .addEventListener("click", () => scramblePuzzle(SCRAMBLE_MOVES));

  // Difficulty selector
  document.getElementById("difficulty")
    .addEventListener("change", (e) => {
      SCRAMBLE_MOVES = parseInt(e.target.value, 10);
    });
});

/* ----------------------------
   Initialize solved puzzle
----------------------------- */
function initBoard() {
  board = [];
  let index = 0;

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        board[r][c] = null; // blank
        blankPos = { row: 0, col: 0 };
      } else {
        board[r][c] = index++;
      }
    }
  }
}

/* ----------------------------
   Create tile DOM elements
----------------------------- */
function createTileElements() {
  gridEl.innerHTML = "";
  tileElements = [];

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const tileIndex = board[r][c];

      const tile = document.createElement("div");
      tile.className = "tile";

      tile.style.width = TILE_PX + "px";
      tile.style.height = TILE_PX + "px";

      if (tileIndex !== null) {
        const srcIndex = tileIndex + 1;
        const srcRow = Math.floor(srcIndex / PUZZLE_SIZE);
        const srcCol = srcIndex % PUZZLE_SIZE;

        tile.style.backgroundImage = `url(${IMAGE_PATH})`;
        tile.style.backgroundPosition =
          `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

        tile.addEventListener("click", () => tileClicked(r, c));
      } else {
        tile.classList.add("empty");
      }

      gridEl.appendChild(tile);
      tileElements.push({ r, c, tile });
    }
  }
}

/* ----------------------------
   Update transforms for animation
----------------------------- */
function updateTilePositions() {
  tileElements.forEach(te => {
    const { r, c } = findTilePosition(te);
    const x = c * TILE_PX;
    const y = r * TILE_PX;
    te.tile.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/* Find a tile's current location in board */
function findTilePosition(tileElement) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (board[r][c] !== null &&
          board[r][c] + 1 === tileElement.tile.dataset.index) {
        return { r, c };
      }
    }
  }
  return { r: blankPos.row, c: blankPos.col };
}

/* ----------------------------
   Tile click logic
----------------------------- */
function tileClicked(r, c) {
  if (isScrambling) return;

  const dr = Math.abs(r - blankPos.row);
  const dc = Math.abs(c - blankPos.col);
  if (dr + dc !== 1) return;

  moveTile(r, c);
  updateTilePositions();
}

/* ----------------------------
   Move tile into the blank
----------------------------- */
function moveTile(r, c) {
  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };
}

/* ----------------------------
   Scramble logic (smooth)
----------------------------- */

function getLegalMoves() {
  const moves = [];
  const { row, col } = blankPos;

  if (row > 0) moves.push({ r: row - 1, c: col });
  if (row < PUZZLE_SIZE - 1) moves.push({ r: row + 1, c: col });
  if (col > 0) moves.push({ r: row, c: col - 1 });
  if (col < PUZZLE_SIZE - 1) moves.push({ r: row, c: col + 1 });

  return moves;
}

function scramblePuzzle(moveCount) {
  if (isScrambling) return;
  isScrambling = true;

  let movesLeft = moveCount;
  let lastTile = null;

  function doMove() {
    const legal = getLegalMoves();

    const filtered = legal.filter(m => board[m.r][m.c] !== lastTile);

    const choices = filtered.length ? filtered : legal;

    const choice = choices[Math.floor(Math.random() * choices.length)];
    const tileValue = board[choice.r][choice.c];

    moveTile(choice.r, choice.c);
    lastTile = tileValue;

    updateTilePositions();

    movesLeft--;

    if (movesLeft > 0) {
      setTimeout(doMove, 250);
    } else {
      isScrambling = false;
    }
  }

  doMove();
}
