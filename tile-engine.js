/* Sliding Puzzle Engine */

const PUZZLE_SIZE = 4;
const GRID_PX = 400;
const TILE_PX = GRID_PX / PUZZLE_SIZE;

const IMAGE_PATH = "images/20251204.jpg"; // replace when adding daily image feature

let board = [];
let blankPos = { row: 0, col: 0 };
let gridEl;

document.addEventListener("DOMContentLoaded", () => {
  gridEl = document.getElementById("grid");
  initBoard();
  renderBoard();
});

function initBoard() {
  board = [];
  let idx = 0;

  for (let r = 0; r < PUZZLE_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        board[r][c] = null;
        blankPos = { row: 0, col: 0 };
      } else {
        board[r][c] = idx++;
      }
    }
  }
}

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

function tileClicked(r, c) {
  const dr = Math.abs(r - blankPos.row);
  const dc = Math.abs(c - blankPos.col);
  if (dr + dc !== 1) return;

  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };

  renderBoard();
}
