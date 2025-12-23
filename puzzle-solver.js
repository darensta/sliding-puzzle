/* puzzle-solver.js
   A* Solver (Debug-only)
   - Solves from any reachable state
   - Animates solution step-by-step
   - Expansion cap with explicit warning
*/

import {
  board,
  blankPos,
  moveTileIntoBlank,
  moveCount
} from "./puzzle-state.js";

import {
  updateAllTileTransforms,
  showSolvedPanel
} from "./puzzle-render.js";

/* ============================================================
   State helpers
============================================================ */

function boardToState() {
  const s = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      s.push(board[r][c] === null ? 0 : board[r][c] + 1);
    }
  }
  return s;
}

function goalState() {
  return Array.from({ length: 16 }, (_, i) => i);
}

function manhattan(state) {
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const t = state[i];
    if (t === 0) continue;
    const gr = Math.floor(t / 4), gc = t % 4;
    const r = Math.floor(i / 4), c = i % 4;
    d += Math.abs(gr - r) + Math.abs(gc - c);
  }
  return d;
}

function neighborsOf(state) {
  const res = [];
  const bi = state.indexOf(0);
  const r = Math.floor(bi / 4), c = bi % 4;

  const moves = [
    { dir: "up", dr: -1, dc: 0 },
    { dir: "down", dr: 1, dc: 0 },
    { dir: "left", dr: 0, dc: -1 },
    { dir: "right", dr: 0, dc: 1 }
  ];

  for (const m of moves) {
    const nr = r + m.dr, nc = c + m.dc;
    if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;

    const ni = nr * 4 + nc;
    const next = state.slice();
    next[bi] = next[ni];
    next[ni] = 0;

    res.push({ move: m.dir, state: next });
  }

  return res;
}

/* ============================================================
   Public solver entry point
============================================================ */

export function solveWithAnimation(setDebugStatus) {
  setDebugStatus?.("Solving (A*)...");

  const start = boardToState();
  const goal = goalState();
  const startKey = start.join(",");
  const goalKey = goal.join(",");

  const open = [];
  const gScore = new Map([[startKey, 0]]);
  const cameFrom = new Map();

  open.push({ state: start, key: startKey, f: manhattan(start) });

  let expansions = 0;
  const MAX_EXPANSIONS = 200000;

  while (open.length && expansions < MAX_EXPANSIONS) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();

    if (current.key === goalKey) {
      const moves = [];
      let k = current.key;
      while (cameFrom.has(k)) {
        const p = cameFrom.get(k);
        moves.push(p.move);
        k = p.prev;
      }
      moves.reverse();
      animateSolution(moves, setDebugStatus);
      return;
    }

    expansions++;

    for (const n of neighborsOf(current.state)) {
      const nk = n.state.join(",");
      const tentative = (gScore.get(current.key) || 0) + 1;

      if (!gScore.has(nk) || tentative < gScore.get(nk)) {
        gScore.set(nk, tentative);
        cameFrom.set(nk, { prev: current.key, move: n.move });
        open.push({
          state: n.state,
          key: nk,
          f: tentative + manhattan(n.state)
        });
      }
    }
  }

  console.warn(
    "[Puzzle Solver] A* terminated without a solution. " +
    `Expanded ${expansions} states. This does NOT imply unsolvable.`
  );

  setDebugStatus?.(`No solution found (expansions: ${expansions}).`);
}

/* ============================================================
   Animation
============================================================ */

function animateSolution(moves, setDebugStatus) {
  let i = 0;

  function step() {
    if (i >= moves.length) {
      updateAllTileTransforms();
      showSolvedPanel();
      setDebugStatus?.(`Solved in ${moves.length} moves.`);
      return;
    }

    applyMove(moves[i++]);
    moveCount++;
    updateAllTileTransforms();
    setTimeout(step, 180);
  }

  step();
}

function applyMove(dir) {
  const r = blankPos.row, c = blankPos.col;
  let tr = r, tc = c;

  if (dir === "up") tr--;
  if (dir === "down") tr++;
  if (dir === "left") tc--;
  if (dir === "right") tc++;

  if (tr < 0 || tr > 3 || tc < 0 || tc > 3) return false;
  moveTileIntoBlank(tr, tc);
  return true;
}
