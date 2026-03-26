import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ---------------------------------------------------------------------------
// PROBABILITY TABLES
// ---------------------------------------------------------------------------
const PROBABILITIES = {
  Aggressive: [
    { outcome: 'Wicket', shortLabel: 'W', prob: 0.40, colorClass: 'seg--wicket' },
    { outcome: '0',      shortLabel: '0', prob: 0.10, colorClass: 'seg--dot'    },
    { outcome: '1',      shortLabel: '1', prob: 0.10, colorClass: 'seg--one'    },
    { outcome: '2',      shortLabel: '2', prob: 0.10, colorClass: 'seg--two'    },
    { outcome: '3',      shortLabel: '3', prob: 0.05, colorClass: 'seg--three'  },
    { outcome: '4',      shortLabel: '4', prob: 0.10, colorClass: 'seg--four'   },
    { outcome: '6',      shortLabel: '6', prob: 0.15, colorClass: 'seg--six'    },
  ],
  Defensive: [
    { outcome: 'Wicket', shortLabel: 'W', prob: 0.08, colorClass: 'seg--wicket' },
    { outcome: '0',      shortLabel: '0', prob: 0.30, colorClass: 'seg--dot'    },
    { outcome: '1',      shortLabel: '1', prob: 0.30, colorClass: 'seg--one'    },
    { outcome: '2',      shortLabel: '2', prob: 0.18, colorClass: 'seg--two'    },
    { outcome: '3',      shortLabel: '3', prob: 0.08, colorClass: 'seg--three'  },
    { outcome: '4',      shortLabel: '4', prob: 0.05, colorClass: 'seg--four'   },
    { outcome: '6',      shortLabel: '6', prob: 0.01, colorClass: 'seg--six'    },
  ],
};

// ---------------------------------------------------------------------------
// SCOREBOARD COMPONENT
// ---------------------------------------------------------------------------
function Scoreboard({ runs, wickets, ballsBowled }) {
  const TOTAL_BALLS = 120;
  const ballsRemaining = TOTAL_BALLS - ballsBowled;
  const oversRemaining = Math.floor(ballsRemaining / 6);
  const ballsInOverRemaining = ballsRemaining % 6;
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
        <div className="scoreboard__stat">
          <span className="scoreboard__stat-value">{runs}</span>
          <span className="scoreboard__stat-label">RUNS</span>
        </div>
        <div className="scoreboard__divider">-</div>
        <div className="scoreboard__stat">
          <span className="scoreboard__stat-value">{wickets}</span>
          <span className="scoreboard__stat-label">WICKETS</span>
        </div>
      </div>

      <div className="scoreboard__footer">
        <div className="scoreboard__remaining">
          <span className="scoreboard__remaining-label">Balls Remaining</span>
          <span className="scoreboard__remaining-value">
            {oversRemaining}.{ballsInOverRemaining} overs
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// POWER BAR COMPONENT
// ---------------------------------------------------------------------------
function PowerBar({ battingStyle }) {
  const segments = PROBABILITIES[battingStyle];
  const totalProbability = segments.reduce((sum, seg) => sum + seg.prob, 0);

  // rAF-based slider: position oscillates 0 → 100 → 0 continuously
  const sliderRef = useRef(null);
  const posRef    = useRef(0);     // 0..100 (percentage across bar)
  const dirRef    = useRef(1);     // +1 or -1
  const rafRef    = useRef(null);

  useEffect(() => {
    const SPEED = 0.18; // percentage units per frame (~60fps)

    function tick() {
      posRef.current += SPEED * dirRef.current;
      if (posRef.current >= 100) { posRef.current = 100; dirRef.current = -1; }
      if (posRef.current <= 0)   { posRef.current = 0;   dirRef.current =  1; }

      if (sliderRef.current) {
        sliderRef.current.style.left = `${posRef.current}%`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // never restarts — slider speed is constant regardless of style change

  const isDistributionValid = Math.abs(totalProbability - 1) < 1e-9;

  return (
    <div className="powerbar-wrapper">
      <h2 className="powerbar-title">Power Bar</h2>
      {!isDistributionValid && (
        <p className="powerbar-warning">Distribution error: probabilities must sum to exactly 1.0</p>
      )}

      {/* Legend */}
      <div className="powerbar-legend">
        {segments.map((seg) => (
          <div key={seg.outcome} className="legend-item">
            <span className={`legend-dot ${seg.colorClass}`} />
            <span className="legend-label">{seg.outcome}</span>
            <span className="legend-prob">{Math.round(seg.prob * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Bar */}
      <div className="powerbar" id="power-bar">
        {/* Coloured segments */}
        {segments.map((seg) => (
          <div
            key={seg.outcome}
            className={`powerbar__segment ${seg.colorClass}`}
            style={{ flexBasis: `${seg.prob * 100}%` }}
          >
            <span className="powerbar__segment-label">{seg.shortLabel}</span>
          </div>
        ))}

        {/* Animated slider */}
        <div className="powerbar__slider" ref={sliderRef} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------------
export default function App() {
  const [runs, setRuns]               = useState(0);
  const [wickets, setWickets]         = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [battingStyle, setBattingStyle] = useState('Aggressive');

  // Suppress unused-var lint warnings — these setters will be wired in Step 3
  void setRuns; void setWickets; void setBallsBowled;

  return (
    <div className="app">
      <h1 className="app__heading">2D Cricket Game</h1>

      <Scoreboard runs={runs} wickets={wickets} ballsBowled={ballsBowled} />

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
            Aggressive
          </button>
          <button
            id="btn-defensive"
            className={`btn btn--defensive ${battingStyle === 'Defensive' ? 'btn--active' : ''}`}
            onClick={() => setBattingStyle('Defensive')}
          >
            Defensive
          </button>
        </div>
      </div>

      <PowerBar battingStyle={battingStyle} />
    </div>
  );
}
