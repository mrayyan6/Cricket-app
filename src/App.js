import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const MAX_OVERS = 2;
const MAX_BALLS = MAX_OVERS * 6;
const MAX_WICKETS = 2;

const COMMENTARY = {
  'Wicket': [
    'Bowled him! What a delivery!',
    'Got him! Caught at slip!',
    'That\'s out! LBW decision!',
  ],
  '0': [
    'Dot ball! No runs scored.',
    'Defended! Stays in the crease.',
    'Tight line! Blocked it.',
  ],
  '1': [
    'Single run! Quick between the wickets.',
    'Easy single! Off the mark.',
    'Nicely worked for one!',
  ],
  '2': [
    'Two runs! Great running!',
    'Pushed for a couple!',
    'Easy two! Down the ground.',
  ],
  '3': [
    'Three runs! Excellent stroke play!',
    'That\'s a three! Beautifully timed.',
    'Three more! The crowd loves it!',
  ],
  '4': [
    'FOUR! Boundary! Fantastic shot!',
    'Four runs! Off the bat beautifully!',
    'FOUR! What a delivery to the boundary!',
  ],
  '6': [
    'SIX! Out of the park! What a hit!',
    'SIX RUNS! Over the boundary!',
    'SIX! The crowd goes wild!',
  ],
};

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

function Scoreboard({ runs, wickets, ballsBowled }) {
  const ballsRemaining = MAX_BALLS - ballsBowled;
  const oversRemaining = Math.floor(ballsRemaining / 6);
  const ballsInOverRemaining = ballsRemaining % 6;
  const oversBowled = Math.floor(ballsBowled / 6);
  const ballsInCurrentOver = ballsBowled % 6;

  return (
    <div className="scoreboard">
      <div className="scoreboard__header">
        <span className="scoreboard__title">🏏 CRICKET MATCH</span>
        <span className="scoreboard__subtitle">
          Overs: {oversBowled}.{ballsInCurrentOver} / {MAX_OVERS}
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

function PowerBar({ battingStyle, registerShotResolver }) {
  const segments = PROBABILITIES[battingStyle];
  const totalProbability = segments.reduce((sum, seg) => sum + seg.prob, 0);

  const sliderRef = useRef(null);
  const posRef    = useRef(0);     
  const dirRef    = useRef(1);    
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!registerShotResolver) {
      return undefined;
    }

    registerShotResolver(() => {
      const sliderPosition = posRef.current;
      let cumulative = 0;

      for (const segment of segments) {
        cumulative += segment.prob * 100;
        if (sliderPosition <= cumulative) {
          return {
            outcome: segment.outcome,
            sliderPosition,
          };
        }
      }

      const fallback = segments[segments.length - 1];
      return {
        outcome: fallback.outcome,
        sliderPosition,
      };
    });

    return () => registerShotResolver(null);
  }, [registerShotResolver, segments]);

  useEffect(() => {
    const SPEED = 2;

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
  }, []); 

  const isDistributionValid = Math.abs(totalProbability - 1) < 1e-9;

  return (
    <div className="powerbar-wrapper">
      <h2 className="powerbar-title">Power Bar</h2>
      {!isDistributionValid && (
        <p className="powerbar-warning">Distribution error: probabilities must sum to exactly 1.0</p>
      )}

      <div className="powerbar-legend">
        {segments.map((seg) => (
          <div key={seg.outcome} className="legend-item">
            <span className={`legend-dot ${seg.colorClass}`} />
            <span className="legend-label">{seg.outcome}</span>
            <span className="legend-prob">{Math.round(seg.prob * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="powerbar" id="power-bar">
        {segments.map((seg) => (
          <div
            key={seg.outcome}
            className={`powerbar__segment ${seg.colorClass}`}
            style={{ flexBasis: `${seg.prob * 100}%` }}
          >
            <span className="powerbar__segment-label">{seg.shortLabel}</span>
          </div>
        ))}

        <div className="powerbar__slider" ref={sliderRef} />
      </div>
    </div>
  );
}

function CricketField({ isPlaying, isBatting }) {
  return (
    <div className="cricket-field">
      <div className="cricket-pitch">
        <div className="crease" />

        <div className="wicket wicket--left">
          <div className="stump stump--1" />
          <div className="stump stump--2" />
          <div className="stump stump--3" />
        </div>

        {isPlaying && (
          <div className="ball ball--animate">
            <img src="/ball.png" alt="cricket ball" />
          </div>
        )}

        <div className="wicket wicket--right">
          <div className="stump stump--1" />
          <div className="stump stump--2" />
          <div className="stump stump--3" />
        </div>

        <div className={`bat ${isBatting ? 'bat--swing' : ''}`}>
          <img src="/bat.png" alt="cricket bat" />
        </div>
      </div>
    </div>
  );
}

function CommentaryBox({ commentary }) {
  return (
    <div className="commentary-box">
      <h3 className="commentary-box__title">🎙️ Commentary</h3>
      <p className="commentary-box__text">{commentary}</p>
    </div>
  );
}

function StickyNote() {
  return (
    <div className="sticky-note">
      <p><strong>Name:</strong> Rayyan</p>
      <p><strong>Roll No:</strong> i23-0502</p>
      <p><strong>Section:</strong> C</p>
    </div>
  );
}

export default function App() {
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [battingStyle, setBattingStyle] = useState('Aggressive');
  const [lastOutcome, setLastOutcome] = useState('None');
  const [lastSliderPosition, setLastSliderPosition] = useState(null);
  const [shotCooldown, setShotCooldown] = useState(0);
  const [isBowling, setIsBowling] = useState(false);
  const [isBatting, setIsBatting] = useState(false);
  const [commentary, setCommentary] = useState('Ready to bat!');
  const shotResolverRef = useRef(null);

  const isGameOver = ballsBowled >= MAX_BALLS || wickets >= MAX_WICKETS;

  function getBatsmanName() {
    return wickets === 0 ? 'Babar Azam' : 'AB De Villiers';
  }

  function getRandomCommentary(outcome) {
    const commentaryList = COMMENTARY[outcome] || COMMENTARY['0'];
    const randomIndex = Math.floor(Math.random() * commentaryList.length);
    const batsmanName = getBatsmanName();
    return `${batsmanName}: ${commentaryList[randomIndex]}`;
  }

  function registerShotResolver(resolverFn) {
    shotResolverRef.current = resolverFn;
  }

  useEffect(() => {
    if (shotCooldown <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setShotCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [shotCooldown]);

  function handlePlayShot() {
    if (isGameOver || shotCooldown > 0 || !shotResolverRef.current) {
      return;
    }

    setIsBowling(true);
    setIsBatting(true);
    setTimeout(() => setIsBowling(false), 600);
    setTimeout(() => setIsBatting(false), 600);

    const { outcome, sliderPosition } = shotResolverRef.current();
    setLastOutcome(outcome);
    setLastSliderPosition(sliderPosition);
    setCommentary(getRandomCommentary(outcome));

    if (outcome === 'Wicket') {
      setWickets((prev) => prev + 1);
    } else {
      setRuns((prev) => prev + Number(outcome));
    }

    setBallsBowled((prev) => prev + 1);
    setShotCooldown(2);
  }

  function handleResetInnings() {
    setRuns(0);
    setWickets(0);
    setBallsBowled(0);
    setBattingStyle('Aggressive');
    setLastOutcome('None');
    setLastSliderPosition(null);
    setShotCooldown(0);
    setIsBowling(false);
    setIsBatting(false);
    setCommentary('Ready to bat!');
  }

  return (
    <div className="app">
      <StickyNote />
        <CommentaryBox commentary={commentary} />
      <div className="app__header">
        <button
          id="btn-reset-innings"
          className="btn btn--reset-top"
          onClick={handleResetInnings}
        >
          ↻ RESET
        </button>
        <h1 className="app__heading">2D Cricket Game</h1>
      </div>

      <div className="game-container">
        <Scoreboard runs={runs} wickets={wickets} ballsBowled={ballsBowled} />
        <CricketField isPlaying={isBowling} isBatting={isBatting} />
      </div>

      <div className="controls-panel">
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
              disabled={isGameOver}
            >
              Aggressive
            </button>
            <button
              id="btn-defensive"
              className={`btn btn--defensive ${battingStyle === 'Defensive' ? 'btn--active' : ''}`}
              onClick={() => setBattingStyle('Defensive')}
              disabled={isGameOver}
            >
              Defensive
            </button>
          </div>
        </div>

        <button
          id="btn-play-shot"
          className="btn"
          onClick={handlePlayShot}
          disabled={isGameOver || shotCooldown > 0}
        >
          {shotCooldown > 0 ? `PLAY SHOT (${shotCooldown}s)` : 'PLAY SHOT'}
        </button>
        <p className="style-section__label">
          Last Outcome: <span className="style-section__badge">{lastOutcome}</span>
        </p>
        {isGameOver && (
          <p className="style-section__label">
            Game Over: reached {MAX_OVERS} overs or {MAX_WICKETS} wickets.
          </p>
        )}
      </div>

      <PowerBar battingStyle={battingStyle} registerShotResolver={registerShotResolver} />
    </div>
  );
}
