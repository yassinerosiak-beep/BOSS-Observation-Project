import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Lock,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Undo2,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  InputMode,
  LiveMarks,
  LiveTallies,
  ManualCounts,
  ManualInputType,
  ManualPercentages,
  ObservationSetup,
} from '../types/boss';
import { isPeerInterval } from '../utils/bossEngine';

interface StepObserveProps {
  setup: ObservationSetup;
  peerCadence: number;
  inputMode: InputMode;
  manualType: ManualInputType;
  manualPct: ManualPercentages;
  manualCounts: ManualCounts;
  classNarrative: string;
  liveCurr: number;
  liveSecs: number;
  graceSecsLeft: number | null;
  liveRunning: boolean;
  muted: boolean;
  visualFlashEnabled: boolean;
  flashPulseKey: number;
  canUndo: boolean;
  marks: LiveMarks;
  tallies: LiveTallies;
  onManualTypeChange: (type: ManualInputType) => void;
  onManualPctChange: (next: ManualPercentages) => void;
  onManualCountsChange: (next: ManualCounts) => void;
  onNarrativeChange: (text: string) => void;
  onToggleTimer: () => void;
  onLogAndNext: () => void;
  onUndoPrevious: () => void;
  onToggleMute: () => void;
  onToggleVisualFlash: () => void;
  onResetLive: () => void;
  onFinishEarly: () => void;
  onToggleMark: (code: keyof LiveMarks) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function StepObserve({
  setup,
  peerCadence,
  inputMode,
  manualType,
  manualPct,
  manualCounts,
  classNarrative,
  liveCurr,
  liveSecs,
  graceSecsLeft,
  liveRunning,
  muted,
  visualFlashEnabled,
  flashPulseKey,
  canUndo,
  marks,
  tallies,
  onManualTypeChange,
  onManualPctChange,
  onManualCountsChange,
  onNarrativeChange,
  onToggleTimer,
  onLogAndNext,
  onUndoPrevious,
  onToggleMute,
  onToggleVisualFlash,
  onResetLive,
  onFinishEarly,
  onToggleMark,
  onBack,
  onGenerate,
}: StepObserveProps) {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reset' | 'finishEarly';
    step: 1 | 2;
  } | null>(null);

  useEffect(() => {
    if (!confirmAction) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmAction(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmAction]);

  const displayStudent = setup.studentName.trim() || 'Target Student';
  const peer = isPeerInterval(liveCurr, peerCadence);
  const anyOffMarked = marks.M || marks.V || marks.P;
  const hasAnySelection = marks.ON || anyOffMarked;
  const onTaskLocked = anyOffMarked;
  const offTaskLocked = marks.ON;
  const isFrozenAtZero = graceSecsLeft !== null && liveSecs === 0;
  const totalLogged = tallies.tTot + tallies.pTot;

  const updatePct = (key: keyof ManualPercentages, raw: string) => {
    const val = Math.max(0, Math.min(100, Number(raw) || 0));
    onManualPctChange({ ...manualPct, [key]: val });
  };

  const updateCnt = (key: keyof ManualCounts, raw: string) => {
    const val = Math.max(0, Number(raw) || 0);
    onManualCountsChange({ ...manualCounts, [key]: val });
  };

  const cardBorderClass =
    inputMode === 'live'
      ? peer
        ? 'border-fuchsia-700 dark:border-fuchsia-500 ring-2 ring-fuchsia-700/20'
        : 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20'
      : 'border-slate-200 dark:border-zinc-800';

  return (
    <section
      className={`bg-white dark:bg-zinc-950 border-2 ${cardBorderClass} rounded-2xl p-5 sm:p-8 shadow-sm transition-colors`}
    >
      {inputMode === 'manual' ? (
        <div>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              02. Enter Observation Data
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Enter percentages directly or switch to raw interval counts from your paper tally sheet.
            </p>
          </div>

          <div className="inline-grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 mb-6 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onManualTypeChange('pct')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                manualType === 'pct'
                  ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Direct Percentages (%)
            </button>
            <button
              type="button"
              onClick={() => onManualTypeChange('cnt')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                manualType === 'cnt'
                  ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Raw Interval Counts
            </button>
          </div>

          {manualType === 'pct' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3.5">
                  Target Student ({displayStudent})
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      ['tOn', 'On-Task (%)'],
                      ['tM', 'Off-Task Motor · OFT-M (%)'],
                      ['tV', 'Off-Task Verbal · OFT-V (%)'],
                      ['tP', 'Off-Task Passive · OFT-P (%)'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label
                        htmlFor={`pct-${key}`}
                        className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={`pct-${key}`}
                        type="number"
                        min={0}
                        max={100}
                        value={manualPct[key]}
                        onChange={(e) => updatePct(key, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3.5">
                  Classroom Peer
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      ['pOn', 'On-Task (%)'],
                      ['pM', 'Off-Task Motor · OFT-M (%)'],
                      ['pV', 'Off-Task Verbal · OFT-V (%)'],
                      ['pP', 'Off-Task Passive · OFT-P (%)'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label
                        htmlFor={`pct-${key}`}
                        className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={`pct-${key}`}
                        type="number"
                        min={0}
                        max={100}
                        value={manualPct[key]}
                        onChange={(e) => updatePct(key, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3.5">
                  Target Student Counts ({displayStudent})
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      ['tTot', 'Target Intervals Observed'],
                      ['tOn', 'On-Task Intervals'],
                      ['tM', 'OFT-M Intervals'],
                      ['tV', 'OFT-V Intervals'],
                      ['tP', 'OFT-P Intervals'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label
                        htmlFor={`cnt-${key}`}
                        className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={`cnt-${key}`}
                        type="number"
                        min={key === 'tTot' ? 1 : 0}
                        value={manualCounts[key]}
                        onChange={(e) => updateCnt(key, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3.5">
                  Classroom Peer Counts
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      ['pTot', 'Peer Intervals Observed'],
                      ['pOn', 'On-Task Intervals'],
                      ['pM', 'OFT-M Intervals'],
                      ['pV', 'OFT-V Intervals'],
                      ['pP', 'OFT-P Intervals'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label
                        htmlFor={`cnt-${key}`}
                        className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={`cnt-${key}`}
                        type="number"
                        min={key === 'pTot' ? 1 : 0}
                        value={manualCounts[key]}
                        onChange={(e) => updateCnt(key, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Silent Visual Interval Flash Pulse */}
          {visualFlashEnabled && flashPulseKey > 0 && (
            <div
              key={flashPulseKey}
              aria-hidden="true"
              className={`pointer-events-none fixed inset-0 z-40 animate-interval-flash ${
                peer
                  ? 'bg-fuchsia-500/35 ring-8 ring-inset ring-red-500'
                  : 'bg-emerald-400/35 ring-8 ring-inset ring-emerald-500'
              }`}
            />
          )}

          {/* High-Visibility Target vs Peer Banner */}
          <div
            className={`rounded-2xl p-5 sm:p-6 text-white mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all ${
              peer
                ? 'bg-gradient-to-br from-purple-700 via-fuchsia-700 to-red-600'
                : 'bg-emerald-600'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase leading-tight">
                {peer ? 'PEER / OTHER STUDENT' : `TARGET: ${displayStudent.toUpperCase()}`}
              </div>
              <div className="mt-1.5 text-sm sm:text-base font-semibold text-white/95 tabular-nums">
                Interval {liveCurr} of {setup.totalIntervals}
                <span className="mx-2 opacity-75" aria-hidden="true">·</span>
                <span>Target logged: {tallies.tTot}</span>
                <span className="mx-2 opacity-75" aria-hidden="true">·</span>
                <span>Peer logged: {tallies.pTot}</span>
              </div>
            </div>

            <div
              className={`self-start sm:self-center px-4 py-2.5 rounded-xl font-mono tabular-nums transition-colors ${
                isFrozenAtZero
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-white shadow-sm'
                  : 'bg-black/25 text-white'
              }`}
            >
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                00:{String(liveSecs).padStart(2, '0')}
              </div>
              {isFrozenAtZero && (
                <div className="text-xs font-sans font-bold mt-0.5 tracking-tight">
                  0 seconds left · Freeze ({graceSecsLeft}s)
                </div>
              )}
            </div>
          </div>

          {/* Zero-Freeze Selection Prompt */}
          {isFrozenAtZero && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3"
            >
              <span>
                0 seconds left — {hasAnySelection ? 'Selection recorded.' : 'no option selected yet. Tap ON-TASK or OFT-M/V/P now.'}
              </span>
              <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                {graceSecsLeft}s
              </span>
            </div>
          )}

          {/* Timer Controls */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 mb-6">
            <button
              type="button"
              onClick={onToggleTimer}
              className="col-span-2 sm:col-span-1 min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 sm:flex-1"
            >
              {liveRunning ? (
                <>
                  <Pause className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {tallies.tTot > 0 || tallies.pTot > 0 || liveCurr > 1
                      ? 'Resume Timer'
                      : 'Start Timer'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogAndNext}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-transparent dark:border-zinc-800 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <SkipForward className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Log &amp; Next</span>
            </button>

            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndoPrevious}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 disabled:bg-slate-100 dark:disabled:bg-zinc-900 disabled:text-slate-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/70 disabled:border-slate-200 dark:disabled:border-zinc-800 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Undo2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Undo Previous</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-transparent dark:border-zinc-800 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {muted ? (
                <>
                  <VolumeX className="w-4 h-4 shrink-0 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
                  <span>Sound: OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-200" aria-hidden="true" />
                  <span>Sound: ON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleVisualFlash}
              aria-pressed={visualFlashEnabled}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                visualFlashEnabled
                  ? 'bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-transparent dark:border-zinc-800'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Flash: {visualFlashEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction({ type: 'reset', step: 1 })}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction({ type: 'finishEarly', step: 1 })}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Flag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Finish Early</span>
            </button>
          </div>

          {/* Single ON-TASK Button (Mutually Exclusive with Off-Task) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                On-Task (Code at interval start · Mutually exclusive with Off-Task)
              </span>
              {onTaskLocked && (
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  Locked while Off-Task selected
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={onTaskLocked}
              onClick={() => onToggleMark('ON')}
              aria-pressed={marks.ON}
              className={`w-full min-h-[76px] px-6 py-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                onTaskLocked
                  ? 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 opacity-55 cursor-not-allowed'
                  : marks.ON
                    ? 'bg-emerald-600 border-emerald-800 dark:border-emerald-400 text-white shadow-sm cursor-pointer'
                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 cursor-pointer'
              }`}
            >
              <span className="text-lg sm:text-xl font-extrabold tracking-wide">ON-TASK</span>
              <span
                className={`text-xs mt-0.5 font-medium ${
                  onTaskLocked
                    ? 'text-slate-400 dark:text-zinc-600'
                    : marks.ON
                      ? 'text-emerald-100'
                      : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                {onTaskLocked ? 'Clear off-task selection to mark On-Task' : 'Momentary Time Sampling'}
              </span>
            </button>
          </div>

          {/* 3 Off-Task Buttons (Mutually Exclusive with ON-TASK, Multi-Selectable Together) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                Off-Task (Partial-Interval Recording · Select one or more)
              </span>
              {offTaskLocked && (
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  Locked while On-Task selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {(
                [
                  { code: 'M' as const, title: 'OFT-M', sub: 'Motor' },
                  { code: 'V' as const, title: 'OFT-V', sub: 'Verbal' },
                  { code: 'P' as const, title: 'OFT-P', sub: 'Passive' },
                ] as const
              ).map((item) => {
                const active = marks[item.code];
                return (
                  <button
                    key={item.code}
                    type="button"
                    disabled={offTaskLocked}
                    onClick={() => onToggleMark(item.code)}
                    aria-pressed={active}
                    className={`min-h-[76px] px-3 py-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                      offTaskLocked
                        ? 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 opacity-55 cursor-not-allowed'
                        : active
                          ? 'bg-red-600 border-red-800 dark:border-red-400 text-white shadow-sm cursor-pointer'
                          : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/40 cursor-pointer'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-extrabold">{item.title}</span>
                    <span
                      className={`text-xs mt-0.5 font-medium ${
                        offTaskLocked
                          ? 'text-slate-400 dark:text-zinc-600'
                          : active
                            ? 'text-red-100'
                            : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {offTaskLocked ? 'Locked' : item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Classroom Activity Narrative */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
        <label
          htmlFor="classNarrative"
          className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
        >
          Classroom Activity Narrative (What is going on in the class?)
        </label>
        <textarea
          id="classNarrative"
          rows={3}
          value={classNarrative}
          onChange={(e) => onNarrativeChange(e.target.value)}
          placeholder="e.g., Teacher giving a lecture on Morocco with slides, followed by small-group work in math..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-colors"
        />
      </div>

      {/* Footer Nav */}
      <div className="mt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="min-h-[48px] flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Generate 6×3 Table &amp; Report</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Double-Confirmation Modal for Reset & Finish Early */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  confirmAction.type === 'reset'
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                }`}
              >
                {confirmAction.type === 'reset' ? (
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Flag className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Confirmation {confirmAction.step} of 2
                </p>
                <h3
                  id="confirm-action-title"
                  className="mt-0.5 text-lg font-bold text-slate-900 dark:text-zinc-100"
                >
                  {confirmAction.type === 'reset'
                    ? confirmAction.step === 1
                      ? 'Reset Live Observation?'
                      : 'Are you sure you want to reset?'
                    : confirmAction.step === 1
                      ? 'Finish Observation Early?'
                      : 'Confirm Finish Early'}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {confirmAction.type === 'reset'
                    ? confirmAction.step === 1
                      ? `This will clear all ${totalLogged} logged interval(s) and reset the timer back to Interval 1.`
                      : 'Final confirmation: all live tallies and interval history from this session will be permanently erased.'
                    : confirmAction.step === 1
                      ? `You have logged ${totalLogged} of ${setup.totalIntervals} intervals (${tallies.tTot} target, ${tallies.pTot} peer). Finishing early will stop the timer and move forward to the 6×3 Table & Report.`
                      : 'Final confirmation: end the live timer now and generate your 6×3 Table & Report using the completed intervals?'}
                </p>
                {confirmAction.type === 'finishEarly' && confirmAction.step === 1 && hasAnySelection && (
                  <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-lg px-3 py-2">
                    Interval {liveCurr} has an unlogged selection. Cancel and tap Log &amp; Next first if you want to include it.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {confirmAction.step === 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({ type: confirmAction.type, step: 2 })
                  }
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors cursor-pointer ${
                    confirmAction.type === 'reset'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmAction.type === 'reset'
                    ? 'Yes, Reset (1/2)'
                    : 'Continue (1/2)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const actionType = confirmAction.type;
                    setConfirmAction(null);
                    if (actionType === 'reset') {
                      onResetLive();
                    } else {
                      onFinishEarly();
                    }
                  }}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors cursor-pointer ${
                    confirmAction.type === 'reset'
                      ? 'bg-red-700 hover:bg-red-800'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  {confirmAction.type === 'reset'
                    ? 'Confirm Reset (2/2)'
                    : 'Confirm Finish Early (2/2)'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
