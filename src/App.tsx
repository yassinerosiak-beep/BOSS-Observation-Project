import { useCallback, useEffect, useRef, useState } from 'react';
import { StepObserve } from './components/StepObserve';
import { StepReport } from './components/StepReport';
import { StepReview } from './components/StepReview';
import { StepSetup } from './components/StepSetup';
import type {
  BossResult,
  LiveMarks,
  LiveTallies,
  ManualCounts,
  ManualInputType,
  ManualPercentages,
  ObservationSetup,
  ReportOptionalFills,
  SavedObservation,
  SortOrder,
  StepNumber,
} from './types/boss';
import {
  calculateBossResult,
  getTodayDateString,
  isPeerInterval,
  loadSavedObservations,
  playCueTone,
  saveObservationsToStorage,
} from './utils/bossEngine';

const EMPTY_MARKS: LiveMarks = { ON: false, M: false, V: false, P: false };

const EMPTY_TALLIES: LiveTallies = {
  tTot: 0,
  tOn: 0,
  tAnyOff: 0,
  tM: 0,
  tV: 0,
  tP: 0,
  pTot: 0,
  pOn: 0,
  pAnyOff: 0,
  pM: 0,
  pV: 0,
  pP: 0,
};

const DEFAULT_MANUAL_PCT: ManualPercentages = {
  tOn: 16,
  tM: 31,
  tV: 13,
  tP: 40,
  pOn: 75,
  pM: 3,
  pV: 12,
  pP: 10,
};

const DEFAULT_MANUAL_COUNTS: ManualCounts = {
  tTot: 48,
  tOn: 8,
  tM: 15,
  tV: 6,
  tP: 19,
  pTot: 12,
  pOn: 9,
  pM: 0,
  pV: 2,
  pP: 1,
};

export default function App() {
  const [step, setStep] = useState<StepNumber>(1);
  const [setup, setSetup] = useState<ObservationSetup>(() => ({
    studentName: 'Miracle',
    pronouns: 'she',
    setting: 'math',
    date: getTodayDateString(),
    intervalSeconds: 15,
    totalIntervals: 60,
    inputMode: 'manual',
  }));

  const [manualType, setManualType] = useState<ManualInputType>('pct');
  const [manualPct, setManualPct] = useState<ManualPercentages>(DEFAULT_MANUAL_PCT);
  const [manualCounts, setManualCounts] = useState<ManualCounts>(DEFAULT_MANUAL_COUNTS);
  const [classNarrative, setClassNarrative] = useState('');

  // Live timer state
  const [liveCurr, setLiveCurr] = useState(1);
  const [liveSecs, setLiveSecs] = useState(15);
  const [liveRunning, setLiveRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [marks, setMarks] = useState<LiveMarks>(EMPTY_MARKS);
  const [tallies, setTallies] = useState<LiveTallies>(EMPTY_TALLIES);

  // Computed result + report fills + saved review state
  const [result, setResult] = useState<BossResult>(() =>
    calculateBossResult(
      {
        studentName: 'Miracle',
        pronouns: 'she',
        setting: 'math',
        date: getTodayDateString(),
        intervalSeconds: 15,
        totalIntervals: 60,
        inputMode: 'manual',
      },
      '',
      'manual',
      'pct',
      DEFAULT_MANUAL_PCT,
      DEFAULT_MANUAL_COUNTS,
      EMPTY_TALLIES
    )
  );
  const [fills, setFills] = useState<ReportOptionalFills>({ format: '', motor: '', verbal: '' });
  const [savedList, setSavedList] = useState<SavedObservation[]>(() => loadSavedObservations());
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [toast, setToast] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Commit current interval marks into tallies and advance
  const commitAndAdvance = useCallback(() => {
    setTallies((prev) => {
      const peer = isPeerInterval(liveCurr);
      const onTask = marks.ON;
      const anyOff = marks.M || marks.V || marks.P;

      if (peer) {
        return {
          ...prev,
          pTot: prev.pTot + 1,
          pOn: prev.pOn + (onTask ? 1 : 0),
          pAnyOff: prev.pAnyOff + (anyOff ? 1 : 0),
          pM: prev.pM + (marks.M ? 1 : 0),
          pV: prev.pV + (marks.V ? 1 : 0),
          pP: prev.pP + (marks.P ? 1 : 0),
        };
      }
      return {
        ...prev,
        tTot: prev.tTot + 1,
        tOn: prev.tOn + (onTask ? 1 : 0),
        tAnyOff: prev.tAnyOff + (anyOff ? 1 : 0),
        tM: prev.tM + (marks.M ? 1 : 0),
        tV: prev.tV + (marks.V ? 1 : 0),
        tP: prev.tP + (marks.P ? 1 : 0),
      };
    });

    setMarks(EMPTY_MARKS);

    if (liveCurr >= setup.totalIntervals) {
      setLiveRunning(false);
      playCueTone(660, 0.32, muted);
      showToast('Observation intervals complete. Click Generate 6×3 Table & Report.');
      return;
    }

    const nextInterval = liveCurr + 1;
    setLiveCurr(nextInterval);
    setLiveSecs(setup.intervalSeconds);
    playCueTone(isPeerInterval(nextInterval) ? 1046 : 880, 0.12, muted);
  }, [liveCurr, marks, muted, setup.intervalSeconds, setup.totalIntervals, showToast]);

  // Countdown tick effect
  useEffect(() => {
    if (!liveRunning) return;
    const id = window.setInterval(() => {
      setLiveSecs((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [liveRunning]);

  // Trigger commit when countdown reaches 0 while running
  useEffect(() => {
    if (liveRunning && liveSecs === 0) {
      commitAndAdvance();
    }
  }, [liveRunning, liveSecs, commitAndAdvance]);

  const handleToggleTimer = () => {
    if (liveRunning) {
      setLiveRunning(false);
    } else {
      if (tallies.tTot === 0 && tallies.pTot === 0 && liveCurr === 1) {
        setLiveSecs(setup.intervalSeconds);
      }
      playCueTone(isPeerInterval(liveCurr) ? 1046 : 880, 0.1, muted);
      setLiveRunning(true);
    }
  };

  const handleResetLive = () => {
    setLiveRunning(false);
    setLiveCurr(1);
    setLiveSecs(setup.intervalSeconds);
    setMarks(EMPTY_MARKS);
    setTallies(EMPTY_TALLIES);
    showToast('Live observation session reset.');
  };

  // Mutual exclusivity between ON-TASK and Off-Task codes
  const handleToggleMark = (code: keyof LiveMarks) => {
    setMarks((prev) => {
      if (code === 'ON') {
        if (prev.M || prev.V || prev.P) return prev;
        return { ...prev, ON: !prev.ON };
      }
      if (prev.ON) return prev;
      return { ...prev, [code]: !prev[code] };
    });
  };

  const navigateToStep = (targetStep: StepNumber) => {
    if (targetStep !== 2 && liveRunning) {
      setLiveRunning(false);
    }

    if (targetStep === 2) {
      if (tallies.tTot === 0 && tallies.pTot === 0 && liveCurr === 1) {
        setLiveSecs(setup.intervalSeconds);
      }
    }

    if (targetStep === 3) {
      const computed = calculateBossResult(
        setup,
        classNarrative,
        setup.inputMode,
        manualType,
        manualPct,
        manualCounts,
        tallies
      );
      setResult(computed);
    }

    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveObservation = () => {
    if (savedList.length >= 3) {
      showToast('Review Area holds up to 3 independent observations. Remove one before saving.');
      navigateToStep(4);
      return;
    }

    const nextItem: SavedObservation = {
      id: Date.now(),
      ...result,
      notes: '',
    };
    const nextList = [...savedList, nextItem];
    setSavedList(nextList);
    saveObservationsToStorage(nextList);
    showToast('Observation saved to Review Area.');
    navigateToStep(4);
  };

  const handleUpdateSavedNote = (id: number, note: string) => {
    const nextList = savedList.map((item) => (item.id === id ? { ...item, notes: note } : item));
    setSavedList(nextList);
    saveObservationsToStorage(nextList);
  };

  const handleDeleteSaved = (id: number) => {
    const nextList = savedList.filter((item) => item.id !== id);
    setSavedList(nextList);
    saveObservationsToStorage(nextList);
    showToast('Observation removed from Review Area.');
  };

  const handleOpenSaved = (id: number) => {
    const found = savedList.find((item) => item.id === id);
    if (!found) return;
    setResult(found);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewObservation = () => {
    setLiveRunning(false);
    setLiveCurr(1);
    setLiveSecs(setup.intervalSeconds);
    setMarks(EMPTY_MARKS);
    setTallies(EMPTY_TALLIES);
    setClassNarrative('');
    setFills({ format: '', motor: '', verbal: '' });
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full-screen color theme during Step 2 Live Observation
  const isLiveScreen = step === 2 && setup.inputMode === 'live';
  const isPeer = isPeerInterval(liveCurr);
  const shellBgClass = isLiveScreen
    ? isPeer
      ? 'bg-fuchsia-200'
      : 'bg-emerald-200'
    : 'bg-slate-100';

  const navItems: { step: StepNumber; label: string }[] = [
    { step: 1, label: '1. Setup' },
    { step: 2, label: '2. Observe' },
    { step: 3, label: '3. Table & Report' },
    { step: 4, label: `4. Review (${savedList.length}/3)` },
  ];

  return (
    <div className={`min-h-screen ${shellBgClass} transition-colors duration-200 flex flex-col`}>
      {/* Single-Row Three-Zone Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => navigateToStep(1)}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            BOSS Observer
          </button>

          <nav className="hidden md:flex items-center gap-6" aria-label="Observation Steps">
            {navItems.map((item) => {
              const active = step === item.step;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => navigateToStep(item.step)}
                  className={`text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => navigateToStep(4)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Saved Review ({savedList.length}/3)
          </button>
        </div>

        {/* Mobile Stepper Strip */}
        <div className="md:hidden border-t border-slate-200/80 px-3 py-2 grid grid-cols-4 gap-1.5 bg-white/95">
          {navItems.map((item) => {
            const active = step === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => navigateToStep(item.step)}
                className={`min-h-[36px] px-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap truncate transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white'
                    : item.step < step
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Step Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 1 && (
          <StepSetup
            setup={setup}
            onChange={(next) => {
              setSetup(next);
              if (tallies.tTot === 0 && tallies.pTot === 0 && liveCurr === 1) {
                setLiveSecs(next.intervalSeconds);
              }
            }}
            onContinue={() => navigateToStep(2)}
          />
        )}

        {step === 2 && (
          <StepObserve
            setup={setup}
            inputMode={setup.inputMode}
            manualType={manualType}
            manualPct={manualPct}
            manualCounts={manualCounts}
            classNarrative={classNarrative}
            liveCurr={liveCurr}
            liveSecs={liveSecs}
            liveRunning={liveRunning}
            muted={muted}
            marks={marks}
            tallies={tallies}
            onManualTypeChange={setManualType}
            onManualPctChange={setManualPct}
            onManualCountsChange={setManualCounts}
            onNarrativeChange={setClassNarrative}
            onToggleTimer={handleToggleTimer}
            onLogAndNext={commitAndAdvance}
            onToggleMute={() => setMuted((m) => !m)}
            onResetLive={handleResetLive}
            onToggleMark={handleToggleMark}
            onBack={() => navigateToStep(1)}
            onGenerate={() => navigateToStep(3)}
          />
        )}

        {step === 3 && (
          <StepReport
            result={result}
            fills={fills}
            savedCount={savedList.length}
            onFillsChange={setFills}
            onBack={() => navigateToStep(2)}
            onSaveObservation={handleSaveObservation}
            onNotify={showToast}
          />
        )}

        {step === 4 && (
          <StepReview
            observations={savedList}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onUpdateNote={handleUpdateSavedNote}
            onOpenObservation={handleOpenSaved}
            onDeleteObservation={handleDeleteSaved}
            onNewObservation={handleStartNewObservation}
            onBackToTable={() => navigateToStep(3)}
          />
        )}
      </main>

      {/* Inline Toast Feedback (replaces window.alert) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg max-w-[90vw] text-center"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
