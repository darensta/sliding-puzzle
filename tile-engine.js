/* Sliding Puzzle Engine */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";

let board = [];
let blankPos = { row: 0, col: 0 };

let isScrambling = false;
let SCRAMBLE_MOVES = 3;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");

  initBoard();
  renderBoard();

  document
    .getElementById("scrambleBtn")
    .addEventListener("click", () => scramblePuzzle(SCRAMBLE_MOVES));
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
        board[r][c] = null;
        blankPos = { row: 0, col: 0 };
      } else {
        board[r][c] = index++;
      }
    }
  }
}

/* ----------------------------
   Render the board
----------------------------- */
function renderBoard() {
  gridEl.innerHTML = "";

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const tileIndex = board[r][c];
      const tile = document.createElement("div");
      tile.className = "tile";

      tile.style.width = TILE_PX + "px";
      tile.style.height = TILE_PX + "px";

      if (tileIndex !== null) {
        const srcRow = Math.floor(tileIndex / PUZZLE_SIZE);
        const srcCol = tileIndex % PUZZLE_SIZE;

        tile.style.backgroundImage = `url(${IMAGE_PATH})`;
        tile.style.backgroundPosition =
          `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

        tile.addEventListener("click", () => tileClicked(r, c));
      } else {
        tile.classList.add("empty");
      }

      gridEl.appendChild(tile);
    }
  }
}

/* ----------------------------
   Handle tile clicks
----------------------------- */
function tileClicked(r, c) {
  if (isScrambling) return;

  const dr = Math.abs(r - blankPos.row);
  const dc = Math.abs(c - blankPos.col);

  if (dr + dc !== 1) return;

  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };

  renderBoard();
}

/* ----------------------------
   SCRAMBLE LOGIC
----------------------------- */

function getLegalMoves() {
  const moves = [];
  const { row, col } = blankPos;

  if (row > 0) moves.push("up");
  if (row < PUZZLE_SIZE - 1) moves.push("down");
  if (col > 0) moves.push("left");
  if (col < PUZZLE_SIZE - 1) moves.push("right");

  return moves;
}

function swapTiles(r1, c1, r2, c2) {
  const temp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = temp;
  blankPos = { row: r1, col: c1 };
}

function moveBlank(dir) {
  const { row, col } = blankPos;

  if (dir === "up" && row > 0) swapTiles(row - 1, col, row, col);
  if (dir === "down" && row < PUZZLE_SIZE - 1) swapTiles(row + 1, col, row, col);
  if (dir === "left" && col > 0) swapTiles(row, col - 1, row, col);
  if (dir === "right" && col < PUZZLE_SIZE - 1) swapTiles(row, col + 1, row, col);
}

function scramblePuzzle(moveCount = 3) {
  if (isScrambling) return;
  isScrambling = true;

  let lastDir = null;
  let movesLeft = moveCount;

  function doMove() {
    const legal = getLegalMoves();
    const filtered = legal.filter(dir => dir !== lastDir);
    const choice = filtered[Math.floor(Math.random() * filtered.length)];

    moveBlank(choice);
    lastDir = choice;
    renderBoard();

    movesLeft--;

    if (movesLeft > 0) {
      setTimeout(doMove, 250);
    } else {
      isScrambling = false;
    }
  }

  doMove();
}
