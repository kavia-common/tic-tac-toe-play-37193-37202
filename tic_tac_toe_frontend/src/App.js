import React, { useEffect, useMemo, useState } from 'react';
import './index.css';

/**
 * Simple AI utilities for Tic Tac Toe (JS implementation for this template)
 */
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function detectWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return null;
}

function availableMoves(board) {
  const idx = [];
  board.forEach((v,i)=>{ if(!v) idx.push(i); });
  return idx;
}

function cloneWith(board, i, p) {
  const next = board.slice();
  next[i] = p;
  return next;
}

function pickWinningMove(board, player) {
  for (const i of availableMoves(board)) {
    const probe = cloneWith(board, i, player);
    const res = detectWinner(probe);
    if (res && res.winner === player) return i;
  }
  return null;
}

function aiPickMove(board, aiPlayer='O', humanPlayer='X') {
  // 1) Win
  const win = pickWinningMove(board, aiPlayer);
  if (win !== null) return win;
  // 2) Block
  const block = pickWinningMove(board, humanPlayer);
  if (block !== null) return block;
  // 3) Center
  if (!board[4]) return 4;
  // 4) Corners
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[0];
  // 5) Sides/first available
  const avail = availableMoves(board);
  return avail.length ? avail[0] : null;
}

/**
 * Controls component
 */
function Controls({ mode, onModeChange, onReset, canReset }) {
  // PUBLIC_INTERFACE
  return (
    <div className="card controls" role="region" aria-label="Game controls">
      <div className="controls-left">
        <div className="mode" role="group" aria-label="Game mode">
          <button
            type="button"
            className="segment"
            aria-pressed={mode === 'pvp'}
            onClick={() => onModeChange('pvp')}
          >
            Player vs Player
          </button>
          <button
            type="button"
            className="segment"
            aria-pressed={mode === 'pvc'}
            onClick={() => onModeChange('pvc')}
          >
            Player vs Computer
          </button>
        </div>
      </div>
      <div className="controls-right">
        <button className="btn ghost" type="button" onClick={onReset} disabled={!canReset} aria-disabled={!canReset}>
          New Game
        </button>
      </div>
    </div>
  );
}

/**
 * Cell component (focusable button for accessibility)
 */
function Cell({ value, onClick, highlight, index, disabled }) {
  const className = [
    'cell',
    value === 'X' ? 'x' : value === 'O' ? 'o' : '',
    highlight ? 'win' : ''
  ].join(' ').trim();

  // PUBLIC_INTERFACE
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled || Boolean(value)}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
      aria-pressed={Boolean(value)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !value && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {value || ''}
    </button>
  );
}

/**
 * Board component
 */
function Board({ board, onCellClick, winningLine, disabled }) {
  // PUBLIC_INTERFACE
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((v, i) => (
        <Cell
          key={i}
          value={v}
          index={i}
          onClick={() => onCellClick(i)}
          highlight={winningLine?.includes(i)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

/**
 * Hook for game state
 */
function useTicTacToe(mode) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true); // X always starts
  const [state, setState] = useState({ status: 'playing', winner: null, line: [] }); // playing|over
  const currentPlayer = xTurn ? 'X' : 'O';

  const result = useMemo(() => detectWinner(board), [board]);
  useEffect(() => {
    if (result) {
      if (result.winner === 'draw') setState({ status: 'over', winner: 'draw', line: [] });
      else setState({ status: 'over', winner: result.winner, line: result.line });
    } else {
      setState({ status: 'playing', winner: null, line: [] });
    }
  }, [result]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXTurn(true);
  };

  const placeAt = (index) => {
    if (board[index] || state.status === 'over') return false;
    const next = board.slice();
    next[index] = currentPlayer;
    setBoard(next);
    setXTurn(!xTurn);
    return true;
  };

  // Simple AI turn logic: only when mode is pvc and it's O's turn and not over
  useEffect(() => {
    if (mode !== 'pvc') return;
    if (state.status !== 'playing') return;
    if (!xTurn) {
      const id = setTimeout(() => {
        const move = aiPickMove(board, 'O', 'X');
        if (move !== null) {
          const next = board.slice();
          next[move] = 'O';
          setBoard(next);
          setXTurn(true);
        }
      }, 350); // slight delay for UX
      return () => clearTimeout(id);
    }
  }, [mode, board, xTurn, state.status]);

  return {
    board,
    currentPlayer,
    over: state.status === 'over',
    winner: state.winner,
    winningLine: state.line,
    placeAt,
    reset
  };
}

// PUBLIC_INTERFACE
function App() {
  // Read envs safely (optional, not required to run)
  const env = {
    API_BASE: process.env.REACT_APP_API_BASE || '',
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || '',
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || '',
    WS_URL: process.env.REACT_APP_WS_URL || '',
    NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || '',
    LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || '',
  };

  const [mode, setMode] = useState('pvc'); // pvp or pvc
  const game = useTicTacToe(mode);

  const statusText = useMemo(() => {
    if (game.over) {
      return game.winner === 'draw'
        ? 'Draw game'
        : `Winner: ${game.winner}`;
    }
    return `Turn: ${game.currentPlayer}${mode === 'pvc' && game.currentPlayer === 'O' ? ' (Computer)' : ''}`;
  }, [game.over, game.winner, game.currentPlayer, mode]);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="brand">
            <h1 className="title">Tic Tac Toe</h1>
            <div className="accent">Ocean • Pro</div>
          </div>
          <div className="legend" aria-hidden="true">
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span className="cell x" style={{width:24,height:24,aspectRatio:'1/1',fontSize:14,boxShadow:'none'}}>X</span>
              <span>Player</span>
            </span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span className="cell o" style={{width:24,height:24,aspectRatio:'1/1',fontSize:14,boxShadow:'none'}}>O</span>
              <span>{mode === 'pvc' ? 'Computer' : 'Player'}</span>
            </span>
          </div>
        </div>

        <Controls
          mode={mode}
          onModeChange={(m) => { setMode(m); game.reset(); }}
          onReset={game.reset}
          canReset
        />

        <div className="board-wrap">
          <div className="status" role="status" aria-live="polite">
            {statusText}
          </div>
          <Board
            board={game.board}
            onCellClick={(i) => {
              if (mode === 'pvc' && game.currentPlayer === 'O') return; // block user while AI thinking
              game.placeAt(i);
            }}
            winningLine={game.winningLine}
            disabled={game.over || (mode === 'pvc' && game.currentPlayer === 'O')}
          />
        </div>

        <div className="footer">
          <div>
            Env: {env.NODE_ENV || 'n/a'}
          </div>
          <div>
            Tip: Use Enter/Space on a focused cell to place a mark.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
