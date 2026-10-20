// Echobloom Atlas — original same-owner, royalty-free source. No analytics/network/APIs.
export const STAGE_COUNT = 18;
const SEEDS = [42, 991, 73419, 50103, 94102, 11041, 80303, 40511, 61999, 24213, 83010, 81231, 65442, 22013, 77711, 90618, 44203, 55226];

function rand(seed) {
  let v = (seed >>> 0) || 1;
  return () => {
    v ^= v << 13; v ^= v >>> 17; v ^= v << 5; v >>>= 0;
    return v / 0x100000000;
  };
}
export function dimensions(stageIndex) {
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= STAGE_COUNT) throw new RangeError("Unknown stage");
  return stageIndex < 3 ? 3 : stageIndex < 9 ? 4 : 5;
}
export function effectCells(index, size, echoes) {
  if (!Number.isInteger(size) || size < 3 || size > 6) throw new RangeError("Bad puzzle size");
  if (!Number.isInteger(index) || index < 0 || index >= size * size) throw new RangeError("Bad move index");
  const row = Math.floor(index / size), col = index % size;
  const cells = [index];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < size && c >= 0 && c < size) cells.push(r * size + c);
  }
  if (echoes.has(index)) {
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) cells.push(r * size + c);
    }
  }
  return cells;
}
export function press(board, index, size, echoes) {
  if (!Array.isArray(board) || board.length !== size * size || !board.every(x => x === 0 || x === 1)) throw new TypeError("Invalid state");
  const out = board.slice();
  for (const position of effectCells(index, size, echoes)) out[position] ^= 1;
  return out;
}
export const isSolved = state => state.every(x => x === 1);
export function stage(index) {
  const size = dimensions(index), area = size * size;
  const rng = rand(SEEDS[index]);
  const names = ["First light", "Two quiet turns", "A little echo", "Orchard paths", "Corner glow", "Evening rhythm", "Through the arch", "The mirrored field", "Emerald current", "Radiant parcels", "Crystal crossroads", "Folding starlight", "Soft recursion", "Midnight bloom", "The echo maze", "Spiral of light", "Every petal counts", "The luminous grove"];
  const count = Math.min(Math.max(2, index + 1 + Math.floor(index / 4)), Math.ceil(area * .67));
  const echoes = new Set();
  if (index >= 2) {
    const number = Math.min(1 + Math.floor(index / 5), 4);
    const x = [...Array(area).keys()];
    for (let k = x.length - 1; k > 0; k--) {
      const i = Math.floor(rng() * (k + 1)); [x[k], x[i]] = [x[i], x[k]];
    }
    for (let i = 0; i < number; i++) echoes.add(x[i]);
  }
  let initial, solution;
  // A fixed-seed construction guarantees every presented state has a solution.
  for (let attempt = 0; attempt < 30; attempt++) {
    const choices = [...Array(area).keys()];
    for (let k = choices.length - 1; k > 0; k--) {
      const i = Math.floor(rng() * (k + 1)); [choices[k], choices[i]] = [choices[i], choices[k]];
    }
    solution = choices.slice(0, count);
    initial = Array(area).fill(1);
    for (const position of solution) initial = press(initial, position, size, echoes);
    if (!isSolved(initial) && initial.filter(x => x === 0).length >= Math.min(2, index + 1)) break;
  }
  if (!initial || isSolved(initial)) throw new Error("Puzzle generation failed");
  return { index, number:index + 1, name:names[index], size, echoes, initial, solution };
}
export function hintIndex(solution, presses) {
  const parity = new Set(solution);
  for (const p of presses) if (parity.has(p)) parity.delete(p); else parity.add(p);
  return parity.size ? Math.min(...parity) : null;
}
