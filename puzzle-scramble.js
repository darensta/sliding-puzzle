/* puzzle-scramble.js */

import {
  getBlankNeighbors,
  moveTileIntoBlank,
  state
} from "./puzzle-state.js";

import { updateAllTileTransforms, hideSolvedPanel } from "./puzzle-render.js";

export function scramblePuzzle(count, setDebugStatus) {
  let lastTile = null;
  hideSolvedPanel();

  function step(movesLeft) {
    if (movesLeft <= 0) {
      setDebugStatus?.(`Scrambled ${count} moves.`);
      return;
    }

    const options = getBlankNeighbors()
      .filter(p => state.board[p.r][p.c] !== lastTile);

    const choice = options[Math.floor(Math.random() * options.length)];
    lastTile = state.board[choice.r][choice.c];

    moveTileIntoBlank(choice.r, choice.c);
    updateAllTileTransforms();

    setTimeout(() => step(movesLeft - 1), 220);
  }

  step(count);
}
