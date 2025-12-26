/* puzzle-render.js
   DOM + visual rendering only
*/

import { state } from "./puzzle-state.js";

const GRID_PX = 400;
const TILE_PX = GRID_PX / 4;
const IMAGE_PATH = "images/20251204.jpg";

let gridEl;
let solvedPanelEl;
let tilesByValue = {};

export function initRender(grid, solvedPanel) {
  gridEl = grid;
  solvedPanelEl = solvedPanel;
}

export function createTilesOnce() {
  gridEl.innerHTML = "";
  tilesByValue = {};

  for (let value = 0; value < 15; value++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.value = value;
    tile.style.width = TILE_PX + "px";
    tile.style.height = TILE_PX + "px";

    const srcRow = Math.floor(value / 4);
    const srcCol = value % 4;


    tile.style.backgroundImage = `url(${IMAGE_PATH})`;
    tile.style.backgroundPosition =
      `-${srcCol * TILE_PX}px -${srcRow * TILE_PX}px`;

    gridEl.appendChild(tile);
    tilesByValue[value] = tile;
  }
}

export function updateAllTileTransforms() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = state.board[r][c];
      if (v === null) continue;
      tilesByValue[v].style.transform =
        `translate(${c * TILE_PX}px, ${r * TILE_PX}px)`;
    }
  }
}

export function showSolvedPanel() {
  if (solvedPanelEl) solvedPanelEl.style.display = "block";
}

export function hideSolvedPanel() {
  if (solvedPanelEl) solvedPanelEl.style.display = "none";
}
