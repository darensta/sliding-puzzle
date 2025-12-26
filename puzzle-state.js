/* puzzle-state.js
   Canonical shared puzzle state (single source of truth)
*/

export const PUZZLE_SIZE = 4;

/* Single live state object (shared by all modules) */
export const state = {
  board: [],
  blankPos: { row: 0, col: 0 },
  moveCount: 0
};

/* ----------------------------
   Board initialization
----------------------------- */
export function initBoardSolved() {
  state.board.length = 0;
  state.moveCount = 0;

  let value = 0;
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    state.board[r] = [];
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) {
        state.board[r][c] = null;
        state.blankPos = { row: 0, col: 0 };
      } else {
        state.board[r][c] = value++;
      }
    }
  }
}

/* ----------------------------
   Queries
----------------------------- */
export function findTile(v) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (state.board[r][c] === v) return { r, c };
    }
  }
  return null;
}

export function isSolved() {
  if (state.blankPos.row !== 0 || state.blankPos.col !== 0) return false;

  let expected = 0;
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (r === 0 && c === 0) continue;
      if (state.board[r][c] !== expected++) return false;
    }
  }
  return true;
}


export function getBlankNeighbors() {
  const { row, col } = state.blankPos;
  const n = [];
  if (row > 0) n.push({ r: row - 1, c: col });
  if (row < 3) n.push({ r: row + 1, c: col });
  if (col > 0) n.push({ r: row, c: col - 1 });
  if (col < 3) n.push({ r: row, c: col + 1 });
  return n;
}

/* ----------------------------
   Moves
----------------------------- */
export function moveTileIntoBlank(r, c) {
  state.board[state.blankPos.row][state.blankPos.col] = state.board[r][c];
  state.board[r][c] = null;
  state.blankPos = { row: r, col: c };
}

export function tryMoveTile(r, c) {
  if (Math.abs(r - state.blankPos.row) + Math.abs(c - state.blankPos.col) !== 1) {
    return false;
  }
  moveTileIntoBlank(r, c);
  state.moveCount++;
  return true;
}
