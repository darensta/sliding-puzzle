/* puzzle-state.js */

export const PUZZLE_SIZE = 4;

export let board = [];
export let blankPos = { row: 0, col: 0 };
export let moveCount = 0;

export function initBoardSolved() {
  board = [];
  moveCount = 0;

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

export function findTile(v) {
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      if (board[r][c] === v) return { r, c };
    }
  }
  return null;
}

export function moveTileIntoBlank(r, c) {
  board[blankPos.row][blankPos.col] = board[r][c];
  board[r][c] = null;
  blankPos = { row: r, col: c };
}

export function tryMoveTile(r, c) {
  if (Math.abs(r - blankPos.row) + Math.abs(c - blankPos.col) !== 1) return false;
  moveTileIntoBlank(r, c);
  moveCount++;
  return true;
}

export function isSolved() {
  let expected = 0;
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const v = board[r][c];
      if (v === null) continue;
      if (v !== expected++) return false;
    }
  }
  return true;
}

export function getBlankNeighbors() {
  const { row, col } = blankPos;
  const n = [];
  if (row > 0) n.push({ r: row - 1, c: col });
  if (row < 3) n.push({ r: row + 1, c: col });
  if (col > 0) n.push({ r: row, c: col - 1 });
  if (col < 3) n.push({ r: row, c: col + 1 });
  return n;
}
