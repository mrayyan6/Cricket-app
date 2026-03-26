import React, { useState } from 'react';
import './App.css';

// --- Scoreboard Component ---
// Displays the current match score: runs, wickets, and overs.
function Scoreboard({ runs, wickets, ballsBowled }) {
  const TOTAL_BALLS = 120; // 20 overs total
  const ballsRemaining = TOTAL_BALLS - ballsBowled;

  // Format balls remaining as overs (e.g., 19.4 overs)
  const oversRemaining = Math.floor(ballsRemaining / 6);
  const ballsInOver = ballsRemaining % 6;
  const oversDisplay = `${oversRemaining}.${ballsInOver}`;

  // Calculate overs bowled for display
  const oversBowled = Math.floor(ballsBowled / 6);
  const ballsInCurrentOver = ballsBowled % 6;

  return (
    <div className="scoreboard">
      <div className="scoreboard__header">
        <span className="scoreboard__title">🏏 CRICKET MATCH</span>
        <span className="scoreboard__subtitle">
          Overs: {oversBowled}.{ballsInCurrentOver} / 20
        </span>
      </div>

      <div className="scoreboard__body">
        {/* Runs */}
        <div className="scoreboard__stat">
          <span className="scoreboard__stat-value">{runs}</span>
          <span className="scoreboard__stat-label">RUNS</span>
        </div>

        {/* Divider */}
        <div className="scoreboard__divider">-</div>

        {/* Wickets */}
        <div className="scoreboard__stat">
          <span className="scoreboard__stat-value">{wickets}</span>
          <span className="scoreboard__stat-label">WICKETS</span>
        </div>
      </div>

      <div className="scoreboard__footer">
        <div className="scoreboard__remaining">
          <span className="scoreboard__remaining-label">Balls Remaining</span>
          <span className="scoreboard__remaining-value">{oversDisplay} overs</span>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [battingStyle, setBattingStyle] = useState('Aggressive');

  return (
    <div className="app">
      <h1 className="app__heading">2D Cricket Game</h1>

      {/* Scoreboard */}
      <Scoreboard
        runs={runs}
        wickets={wickets}
        ballsBowled={ballsBowled}
      />

      {/* Batting Style Toggle */}
      <div className="style-section">
        <p className="style-section__label">
          Current Style:{' '}
          <span className={`style-section__badge style-section__badge--${battingStyle.toLowerCase()}`}>
            {battingStyle}
          </span>
        </p>

        <div className="style-section__buttons">
          <button
            id="btn-aggressive"
            className={`btn btn--aggressive ${battingStyle === 'Aggressive' ? 'btn--active' : ''}`}
            onClick={() => setBattingStyle('Aggressive')}
          >
            ⚡ Aggressive
          </button>

          <button
            id="btn-defensive"
            className={`btn btn--defensive ${battingStyle === 'Defensive' ? 'btn--active' : ''}`}
            onClick={() => setBattingStyle('Defensive')}
          >
            🛡️ Defensive
          </button>
        </div>
      </div>
    </div>
  );
}
