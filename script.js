// Update this to your actual GitHub Pages URL before deploying
const SITE_URL = 'https://tcouso.github.io';

// ── QR CODE ───────────────────────────────────────────────────────────────────

function initQR() {
  const qr = qrcode(0, 'M');
  qr.addData(SITE_URL);
  qr.make();
  document.getElementById('qr-code').innerHTML = qr.createImgTag(5, 1);
}

// ── MINIMAX TIC-TAC-TOE ───────────────────────────────────────────────────────
// Ported from https://github.com/tcouso/minimax-project (Python/Flask → vanilla JS)

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function checkWinner(b) {
  for (const [p, q, r] of WIN_LINES) {
    if (b[p] && b[p] === b[q] && b[p] === b[r]) return b[p];
  }
  return null;
}

function toMove(b) {
  const xs = b.filter(c => c === 'x').length;
  const os = b.filter(c => c === 'o').length;
  return xs === os ? 'x' : 'o';
}

function actions(b) {
  return b.reduce((acc, cell, i) => (cell === '' ? [...acc, i] : acc), []);
}

function applyMove(b, idx) {
  const nb = [...b];
  nb[idx] = toMove(b);
  return nb;
}

function isTerminal(b) {
  return checkWinner(b) !== null || actions(b).length === 0;
}

function utility(b) {
  const w = checkWinner(b);
  if (w === 'x') return 1;
  if (w === 'o') return -1;
  return 0;
}

function maxValue(b, alpha, beta) {
  if (isTerminal(b)) return [utility(b), null];
  let value = -Infinity, best = null;
  for (const idx of actions(b)) {
    const [v] = minValue(applyMove(b, idx), alpha, beta);
    if (v > value) { value = v; best = idx; }
    if (value >= beta) return [value, best];
    alpha = Math.max(alpha, value);
  }
  return [value, best];
}

function minValue(b, alpha, beta) {
  if (isTerminal(b)) return [utility(b), null];
  let value = Infinity, best = null;
  for (const idx of actions(b)) {
    const [v] = maxValue(applyMove(b, idx), alpha, beta);
    if (v < value) { value = v; best = idx; }
    if (value <= alpha) return [value, best];
    beta = Math.min(beta, value);
  }
  return [value, best];
}

function alphaBetaSearch(b) {
  const player = toMove(b);
  const [, move] = player === 'x'
    ? maxValue(b, -Infinity, Infinity)
    : minValue(b, -Infinity, Infinity);
  return move;
}

// ── GAME UI ───────────────────────────────────────────────────────────────────

let board = Array(9).fill('');
let gameActive = true;

function setStatus(text) {
  document.getElementById('game-status').textContent = text;
}

function renderBoard() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    const val = board[i];
    cell.textContent = val ? val.toUpperCase() : '';
    cell.className = 'cell' + (val ? ` filled ${val}` : '');
  });
}

function handleCellClick(i) {
  if (!gameActive || board[i] !== '' || toMove(board) !== 'x') return;

  board[i] = 'x';
  renderBoard();

  const winner = checkWinner(board);
  if (winner || actions(board).length === 0) { endGame(winner); return; }

  setStatus('AI thinking…');
  setTimeout(() => {
    const aiMove = alphaBetaSearch(board);
    if (aiMove !== null) { board[aiMove] = 'o'; renderBoard(); }

    const w = checkWinner(board);
    if (w || actions(board).length === 0) endGame(w);
    else setStatus('Your turn (X)');
  }, 180);
}

function endGame(winner) {
  gameActive = false;
  if (winner === 'x') setStatus('You win! (Impossible…)');
  else if (winner === 'o') setStatus('AI wins.');
  else setStatus("It's a tie — try again?");
}

function resetGame() {
  board = Array(9).fill('');
  gameActive = true;
  renderBoard();
  setStatus('Your turn (X)');
}

function initGame() {
  const boardEl = document.getElementById('game-board');
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.addEventListener('click', () => handleCellClick(i));
    boardEl.appendChild(cell);
  }
  setStatus('Your turn (X)');
}

// ── INIT ──────────────────────────────────────────────────────────────────────

initGame();
initQR();
