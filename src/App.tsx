import { useCallback, useEffect, useRef, useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { OptionsView } from './components/OptionsView';
import { StepObserve } from './components/StepObserve';
import { StepReport } from './components/StepReport';
import { StepReview } from './components/StepReview';
import { StepSetup } from './components/StepSetup';
import { StudentsView } from './components/StudentsView';
import type {
  AppOptions,
  AppView,
  BossResult,
  InputMode,
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
  StudentProfile,
} from './types/boss';
import {
  calculateBossResult,
  DEFAULT_OPTIONS,
  getTodayDateString,
  isPeerInterval,
  loadOptions,
  loadSavedObservations,
  loadStudents,
  playCueTone,
  saveObservationsToStorage,
  saveOptionsToStorage,
  saveStudentsToStorage,
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
  const [options, setOptions] = useState<AppOptions>(() => loadOptions());
  const [students, setStudents] = useState<StudentProfile[]>(() => loadStudents());
  const [savedList, setSavedList] = useState<SavedObservation[]>(() => loadSavedObservations());

  const [view, setView] = useState<AppView>('menu');
  const [highlightDeleteSection, setHighlightDeleteSection] = useState(false);
  const [step, setStep] = useState<StepNumber>(1);

  const [setup, setSetup] = useState<ObservationSetup>(() => {
    const opts = loadOptions();
    return {
      studentName: 'Miracle',
      pronouns: 'she',
      setting: 'math',
      date: getTodayDateString(),
      intervalSeconds: opts.defaultIntervalSeconds,
      totalIntervals: opts.defaultTotalIntervals,
      inputMode: opts.defaultInputMode,
    };
  });

  const [manualType, setManualType] = useState<ManualInputType>('pct');
  const [manualPct, setManualPct] = useState<ManualPercentages>(DEFAULT_MANUAL_PCT);
  const [manualCounts, setManualCounts] = useState<ManualCounts>(DEFAULT_MANUAL_COUNTS);
  const [classNarrative, setClassNarrative] = useState('');

  // Live timer state
  const [liveCurr, setLiveCurr] = useState(1);
  const [liveSecs, setLiveSecs] = useState(() => loadOptions().defaultIntervalSeconds);
  const [liveRunning, setLiveRunning] = useState(false);
  const [muted, setMuted] = useState(() => !loadOptions().defaultSoundOn);
  const [marks, setMarks] = useState<LiveMarks>(EMPTY_MARKS);
  const [tallies, setTallies] = useState<LiveTallies>(EMPTY_TALLIES);

  // Computed result + report fills + review sort
  const [result, setResult] = useState<BossResult>(() =>
    calculateBossResult(
      {
        studentName: 'Miracle',
        pronouns: 'she',
        setting: 'math',
        date: getTodayDateString(),
        intervalSeconds: options.defaultIntervalSeconds,
        totalIntervals: options.defaultTotalIntervals,
        inputMode: options.defaultInputMode,
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
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [toast, setToast] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Keep Screen Awake during live timer if enabled in Options
  useEffect(() => {
    const active = view === 'wizard' && step === 2 && setup.inputMode === 'live' && liveRunning && options.keepScreenAwake;

    if (active && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((sentinel) => {
          wakeLockRef.current = sentinel;
        })
        .catch(() => {
          // Wake lock not permitted or unsupported in current context
        });
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [view, step, setup.inputMode, liveRunning, options.keepScreenAwake]);

  // Commit current interval marks into tallies and advance
  const commitAndAdvance = useCallback(() => {
    setTallies((prev) => {
      const peer = isPeerInterval(liveCurr, options.peerCadence);
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
    playCueTone(isPeerInterval(nextInterval, options.peerCadence) ? 1046 : 880, 0.12, muted);
  }, [liveCurr, marks, muted, options.peerCadence, setup.intervalSeconds, setup.totalIntervals, showToast]);

  // Countdown tick effect
  useEffect(() => {
    if (!liveRunning) return;
    const id = window.setInterval(() => {
      setLiveSecs((prev) => (prev <= 1 ? 0 : prev - 1));
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
      playCueTone(isPeerInterval(liveCurr, options.peerCadence) ? 1046 : 880, 0.1, muted);
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

  const navigateToView = (targetView: AppView, scrollToDelete = false) => {
    if (liveRunning) setLiveRunning(false);
    setHighlightDeleteSection(scrollToDelete);
    setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStep = (targetStep: StepNumber) => {
    if (targetStep !== 2 && liveRunning) {
      setLiveRunning(false);
    }
    if (targetStep === 2 && tallies.tTot === 0 && tallies.pTot === 0 && liveCurr === 1) {
      setLiveSecs(setup.intervalSeconds);
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
    setView('wizard');
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewObservation = (mode?: InputMode, student?: StudentProfile) => {
    setLiveRunning(false);
    setLiveCurr(1);
    setLiveSecs(options.defaultIntervalSeconds);
    setMuted(!options.defaultSoundOn);
    setMarks(EMPTY_MARKS);
    setTallies(EMPTY_TALLIES);
    setClassNarrative('');
    setFills({ format: '', motor: '', verbal: '' });

    const nextMode = mode || options.defaultInputMode;
    setSetup({
      studentName: student ? student.name : '',
      pronouns: student ? student.pronouns : 'she',
      setting: student ? student.defaultSetting : 'math',
      date: getTodayDateString(),
      intervalSeconds: options.defaultIntervalSeconds,
      totalIntervals: options.defaultTotalIntervals,
      inputMode: nextMode,
    });

    setView('wizard');
    setStep(mode && student ? 2 : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student Roster handlers
  const handleAddStudent = (
    profile: Omit<StudentProfile, 'id' | 'createdAt'>,
    startMode?: InputMode
  ) => {
    const newStudent: StudentProfile = {
      ...profile,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: getTodayDateString(),
    };
    const nextList = [newStudent, ...students];
    setStudents(nextList);
    saveStudentsToStorage(nextList);
    showToast(`Added student "${newStudent.name}".`);

    if (startMode) {
      handleStartNewObservation(startMode, newStudent);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const nextList = students.filter((s) => s.id !== id);
    setStudents(nextList);
    saveStudentsToStorage(nextList);
    showToast('Student removed from roster.');
  };

  // Saved Observations handlers
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
    showToast('Observation deleted.');
  };

  const handleOpenSaved = (id: number) => {
    const found = savedList.find((item) => item.id === id);
    if (!found) return;
    setResult(found);
    setView('wizard');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Options & Data Management handlers
  const handleSaveOptions = (next: AppOptions) => {
    setOptions(next);
    saveOptionsToStorage(next);
    setMuted(!next.defaultSoundOn);
  };

  const handleClearObservations = () => {
    setSavedList([]);
    saveObservationsToStorage([]);
    showToast('All saved observations deleted.');
  };

  const handleClearStudents = () => {
    setStudents([]);
    saveStudentsToStorage([]);
    showToast('All student profiles deleted.');
  };

  const handleClearAllData = () => {
    setSavedList([]);
    setStudents([]);
    setOptions(DEFAULT_OPTIONS);
    saveObservationsToStorage([]);
    saveStudentsToStorage([]);
    saveOptionsToStorage(DEFAULT_OPTIONS);
    showToast('All local data deleted and defaults restored.');
  };

  // Full-screen color theme during Step 2 Live Observation
  const isLiveScreen = view === 'wizard' && step === 2 && setup.inputMode === 'live';
  const isPeer = isPeerInterval(liveCurr, options.peerCadence);
  const shellBgClass = isLiveScreen
    ? isPeer
      ? 'bg-fuchsia-200'
      : 'bg-emerald-200'
    : 'bg-slate-100';

  const stepItems: { step: StepNumber; label: string }[] = [
    { step: 1, label: '1. Setup' },
    { step: 2, label: '2. Observe' },
    { step: 3, label: '3. Table & Report' },
    { step: 4, label: `4. Review (${savedList.length}/3)` },
  ];

  const topNavLinks: { label: string; active: boolean; onClick: () => void }[] = [
    { label: 'Main Menu', active: view === 'menu', onClick: () => navigateToView('menu') },
    {
      label: 'Observation',
      active: view === 'wizard' && step !== 4,
      onClick: () => navigateToStep(step === 4 ? 1 : step),
    },
    { label: 'Students', active: view === 'students', onClick: () => navigateToView('students') },
    {
      label: `Review (${savedList.length}/3)`,
      active: view === 'wizard' && step === 4,
      onClick: () => navigateToStep(4),
    },
    { label: 'Options', active: view === 'options', onClick: () => navigateToView('options') },
  ];

  return (
    <div className={`min-h-screen ${shellBgClass} transition-colors duration-200 flex flex-col`}>
      {/* Single-Row Three-Zone Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => navigateToView('menu')}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            BOSS Observer
          </button>

          <nav className="hidden md:flex items-center gap-6" aria-label="Primary Navigation">
            {topNavLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={link.onClick}
                className={`text-sm font-semibold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  link.active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => handleStartNewObservation()}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            New Observation
          </button>
        </div>

        {/* Mobile Compact Menu Bar */}
        <div className="md:hidden border-t border-slate-200/80 px-2 py-1.5 grid grid-cols-5 gap-1 bg-white/95">
          {topNavLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className={`min-h-[36px] px-1 py-1 rounded-lg text-[11px] font-semibold text-center whitespace-nowrap truncate transition-colors cursor-pointer ${
                link.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {link.label.replace(' Observation', '').replace(' (0/3)', '').replace(' (1/3)', '').replace(' (2/3)', '').replace(' (3/3)', '')}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {view === 'menu' && (
          <MainMenu
            students={students}
            savedObservations={savedList}
            options={options}
            onStartNewObservation={handleStartNewObservation}
            onOpenStudents={() => navigateToView('students')}
            onOpenReview={() => navigateToStep(4)}
            onOpenSavedReport={handleOpenSaved}
            onDeleteSavedObservation={handleDeleteSaved}
            onOpenOptions={(scrollToDel) => navigateToView('options', Boolean(scrollToDel))}
          />
        )}

        {view === 'students' && (
          <StudentsView
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onStartObservationForStudent={(student, mode) =>
              handleStartNewObservation(mode, student)
            }
            onBackToMenu={() => navigateToView('menu')}
          />
        )}

        {view === 'options' && (
          <OptionsView
            options={options}
            savedObservations={savedList}
            studentCount={students.length}
            highlightDeleteSection={highlightDeleteSection}
            onSaveOptions={handleSaveOptions}
            onDeleteObservation={handleDeleteSaved}
            onClearObservations={handleClearObservations}
            onClearStudents={handleClearStudents}
            onClearAllData={handleClearAllData}
            onBackToMenu={() => navigateToView('menu')}
          />
        )}

        {view === 'wizard' && (
          <>
            {/* Always-Visible 4-Step Wizard Bar */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 p-1.5 bg-white/90 border border-slate-200 rounded-2xl shadow-xs"
              role="tablist"
              aria-label="Observation Workflow Steps"
            >
              {stepItems.map((item) => {
                const active = step === item.step;
                const completed = item.step < step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => navigateToStep(item.step)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-center whitespace-nowrap truncate transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : completed
                          ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {step === 1 && (
              <StepSetup
                setup={setup}
                students={students}
                onChange={(next) => {
                  setSetup(next);
                  if (tallies.tTot === 0 && tallies.pTot === 0 && liveCurr === 1) {
                    setLiveSecs(next.intervalSeconds);
                  }
                }}
                onContinue={() => navigateToStep(2)}
                onBackToMenu={() => navigateToView('menu')}
              />
            )}

            {step === 2 && (
              <StepObserve
                setup={setup}
                peerCadence={options.peerCadence}
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
                onNewObservation={() => handleStartNewObservation()}
                onBackToTable={() => navigateToStep(3)}
              />
            )}
          </>
        )}
      </main>

      {/* Inline Toast Feedback */}
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
