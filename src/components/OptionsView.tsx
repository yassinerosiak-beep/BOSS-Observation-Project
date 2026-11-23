import { ArrowLeft, BookOpen, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AppOptions, InputMode, SavedObservation } from '../types/boss';
import { DEFAULT_OPTIONS, formatDurationEstimate } from '../utils/bossEngine';

interface OptionsViewProps {
  options: AppOptions;
  savedObservations: SavedObservation[];
  studentCount: number;
  highlightDeleteSection?: boolean;
  onSaveOptions: (next: AppOptions) => void;
  onDeleteObservation: (id: number) => void;
  onClearObservations: () => void;
  onClearStudents: () => void;
  onClearAllData: () => void;
  onBackToMenu: () => void;
}

export function OptionsView({
  options,
  savedObservations,
  studentCount,
  highlightDeleteSection = false,
  onSaveOptions,
  onDeleteObservation,
  onClearObservations,
  onClearStudents,
  onClearAllData,
  onBackToMenu,
}: OptionsViewProps) {
  const [confirmAction, setConfirmAction] = useState<'obs' | 'students' | 'all' | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const update = <K extends keyof AppOptions>(key: K, value: AppOptions[K]) => {
    const next = { ...options, [key]: value };
    onSaveOptions(next);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Options Panel */}
      <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Options &amp; Data Management
              </h1>
              {savedNotice && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Saved
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Configure default observation settings for new sessions and manage or delete stored local data.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-sm font-semibold inline-flex items-center gap-2 self-start cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Main Menu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="opt-interval-sec"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
            >
              Default Interval Length (Seconds)
            </label>
            <input
              id="opt-interval-sec"
              type="number"
              min={5}
              max={120}
              value={options.defaultIntervalSeconds}
              onChange={(e) =>
                update('defaultIntervalSeconds', Math.max(5, Number(e.target.value) || 15))
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>

          <div>
            <label
              htmlFor="opt-total-int"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
            >
              Default Total Intervals
            </label>
            <input
              id="opt-total-int"
              type="number"
              min={5}
              max={240}
              value={options.defaultTotalIntervals}
              onChange={(e) =>
                update('defaultTotalIntervals', Math.max(5, Number(e.target.value) || 60))
              }
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 font-mono tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>

          <div>
            <label
              htmlFor="opt-peer-cadence"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
            >
              Peer Comparison Interval Cadence
            </label>
            <select
              id="opt-peer-cadence"
              value={options.peerCadence}
              onChange={(e) => update('peerCadence', Number(e.target.value) || 5)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            >
              <option value={4}>Every 4th interval (25% peer)</option>
              <option value={5}>Every 5th interval (Standard BOSS · 20% peer)</option>
              <option value={6}>Every 6th interval (~17% peer)</option>
              <option value={10}>Every 10th interval (10% peer)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="opt-default-mode"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
            >
              Default Data Collection Mode
            </label>
            <select
              id="opt-default-mode"
              value={options.defaultInputMode}
              onChange={(e) => update('defaultInputMode', e.target.value as InputMode)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            >
              <option value="manual">Enter Counts / % (Post-Hoc)</option>
              <option value="live">Live Classroom Timer</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600 dark:text-zinc-400 font-medium tabular-nums">
          Default Session Preview:{' '}
          {formatDurationEstimate(options.defaultIntervalSeconds, options.defaultTotalIntervals)}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 cursor-pointer">
            <input
              type="checkbox"
              checked={options.nightMode}
              onChange={(e) => update('nightMode', e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Night Mode</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Dark, mostly-black workspace for dim classrooms.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 cursor-pointer">
            <input
              type="checkbox"
              checked={options.defaultSoundOn}
              onChange={(e) => update('defaultSoundOn', e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Audio Chimes Enabled
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Plays soft tones for Target vs. Peer intervals.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 cursor-pointer">
            <input
              type="checkbox"
              checked={options.defaultVisualFlash}
              onChange={(e) => update('defaultVisualFlash', e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Visual Interval Flash
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Briefly flashes the live screen at every interval switch.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 cursor-pointer">
            <input
              type="checkbox"
              checked={options.keepScreenAwake}
              onChange={(e) => update('keepScreenAwake', e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600"
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Keep Screen Awake
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Requests Screen Wake Lock while the live timer runs.
              </div>
            </div>
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => onSaveOptions(DEFAULT_OPTIONS)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            Restore Default Settings
          </button>
        </div>
      </section>

      {/* Delete Old Data Section */}
      <section
        id="delete-old-data"
        className={`bg-white dark:bg-zinc-950 rounded-2xl p-6 sm:p-8 shadow-xs border ${
          highlightDeleteSection
            ? 'border-red-300 dark:border-red-800 ring-2 ring-red-100 dark:ring-red-950/60'
            : 'border-slate-200 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">Delete Old Data</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-5">
          Remove individual saved observations or wipe stored student profiles and session data from this device.
        </p>

        {savedObservations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
              Individual Saved Observations ({savedObservations.length}/3)
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {savedObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3.5 bg-white dark:bg-zinc-950 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {obs.studentName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                      {obs.date} · {obs.setting} · On-Task {obs.tOn}% vs Peer {obs.pOn}%
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteObservation(obs.id)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/70 text-red-700 dark:text-red-400 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Cleanup Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Clear Saved Observations
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {savedObservations.length} saved session{savedObservations.length === 1 ? '' : 's'}
              </div>
            </div>
            {confirmAction === 'obs' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearObservations();
                    setConfirmAction(null);
                  }}
                  className="flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={savedObservations.length === 0}
                onClick={() => setConfirmAction('obs')}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/60 disabled:opacity-45 text-red-700 dark:text-red-400 text-xs font-semibold cursor-pointer"
              >
                Delete All Observations
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">Clear Student Roster</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {studentCount} saved student{studentCount === 1 ? '' : 's'}
              </div>
            </div>
            {confirmAction === 'students' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearStudents();
                    setConfirmAction(null);
                  }}
                  className="flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={studentCount === 0}
                onClick={() => setConfirmAction('students')}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/60 disabled:opacity-45 text-red-700 dark:text-red-400 text-xs font-semibold cursor-pointer"
              >
                Delete All Students
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/80 bg-red-50/40 dark:bg-red-950/30 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-red-950 dark:text-red-200">Reset All Local Data</div>
              <div className="text-xs text-red-800/80 dark:text-red-300/80 mt-0.5">
                Deletes observations, students, and restores default options.
              </div>
            </div>
            {confirmAction === 'all' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmAction(null);
                  }}
                  className="flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmAction('all')}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Wipe Everything
              </button>
            )}
          </div>
        </div>
      </section>

      {/* BOSS Quick Reference Card */}
      <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
            BOSS Coding Quick Reference
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-zinc-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
            <div className="font-bold text-slate-900 dark:text-zinc-100 mb-1">
              On-Task (Momentary Time Sampling)
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              Code at the exact onset cue of the interval if the student is attending to assigned instructional materials or listening/participating appropriately. Mutually exclusive with Off-Task codes in this workflow.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800">
            <div className="font-bold text-slate-900 dark:text-zinc-100 mb-1">
              Off-Task Categories (Partial-Interval)
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
              Code <strong>OFT-M</strong> (Motor movement not required by task), <strong>OFT-V</strong> (Verbalizations unrelated to task), or <strong>OFT-P</strong> (Passive looking away/daydreaming) whenever observed during the interval. Multiple off-task types may co-occur.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
