/* ============================================================
   Sliding Puzzle Engine - Standalone File
   Author: ChatGPT
   ============================================================ */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;           // Square grid size
const TILE_PX = GRID_PX / PUZZLE_SIZE;
const IMAGE_PATH = "images/20251204.jpg";  // Replace dynamically later

let board = [];
let blankPos = { row: 0, col: 0 }; // blank tile at TOP-LEFT
let gridEl;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");
  initBoard();
  renderBoard();
});

/* ----------------------------
   Initialize board
----------------------------- */
function initBoard() {
  board = [];
  let index = 0;

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        board[r][c] = null;       // blank
        blankPos = { row: 0, col: 0 };
      } else {
        board[r][c] = index++;
      }
    }
  }
}

/* ----------------------------
   Render tiles on screen
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
        tile.style.backgroundSize = `${GRID_PX}px ${GRID_PX}px`;
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
   Tile sliding logic
----------------------------- */
function tileClicked(r, c) {
  const dr = Math.abs(r - blankPos.row);
  const dc = Math.abs(c - blankPos.col);

  // Only adjacent tiles slide
  if (dr + dc !== 1) return;

  // Swap tile with blank
  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;

  blankPos = { row: r, col: c };

  renderBoard();
}
