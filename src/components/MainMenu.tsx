import {
  ArrowRight,
  ClipboardList,
  FolderOpen,
  Play,
  Settings,
  Timer,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import type { AppOptions, SavedObservation, StudentProfile } from '../types/boss';
import { formatDurationEstimate } from '../utils/bossEngine';

interface MainMenuProps {
  students: StudentProfile[];
  savedObservations: SavedObservation[];
  options: AppOptions;
  onStartNewObservation: (mode?: 'live' | 'manual', student?: StudentProfile) => void;
  onOpenStudents: () => void;
  onOpenReview: () => void;
  onOpenSavedReport: (id: number) => void;
  onDeleteSavedObservation: (id: number) => void;
  onOpenOptions: (scrollToDelete?: boolean) => void;
}

export function MainMenu({
  students,
  savedObservations,
  options,
  onStartNewObservation,
  onOpenStudents,
  onOpenReview,
  onOpenSavedReport,
  onDeleteSavedObservation,
  onOpenOptions,
}: MainMenuProps) {
  const defaultEstimate = formatDurationEstimate(
    options.defaultIntervalSeconds,
    options.defaultTotalIntervals
  );

  return (
    <div className="space-y-6">
      {/* Main Menu Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              BOSS Observation Main Menu
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
              Systematic classroom observation workflow for school psychologists. All student profiles, sessions, and notes remain stored locally on this device.
            </p>
            <div className="mt-3 text-xs sm:text-sm text-slate-500 font-medium tabular-nums">
              Default Session: {defaultEstimate} · Peer check every {options.peerCadence}th interval ·{' '}
              {savedObservations.length}/3 saved reviews
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onStartNewObservation('live')}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Timer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Start Live Observation</span>
            </button>
            <button
              type="button"
              onClick={() => onStartNewObservation('manual')}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ClipboardList className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Enter Post-Hoc Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Primary Action Tiles */}
      <section aria-label="Main Menu Actions" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onStartNewObservation()}
          className="text-left bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[144px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Play className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900">New Observation</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Configure intervals and launch Live Timer or Post-Hoc entry.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
            <span>Open Setup</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenStudents}
          className="text-left bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[144px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Start New Student</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Add a student profile or launch an observation from your roster ({students.length} saved).
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
            <span>Manage Students</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenReview}
          className="text-left bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[144px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
              <FolderOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Saved Review ({savedObservations.length}/3)</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Sort, compare side-by-side, and take notes on saved observations.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-800 inline-flex items-center gap-1">
            <span>Open Review Area</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenOptions(true)}
          className="text-left bg-white border border-slate-200 hover:border-red-400 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[144px]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Delete Old Data &amp; Options</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Clear old sessions, adjust default timing, audio cues, and iPhone wake lock.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-red-700 inline-flex items-center gap-1">
            <span>Options &amp; Cleanup</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </button>
      </section>

      {/* Two-Column Quick Access: Student Roster & Saved Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Student Roster Quick-Start */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900">Quick-Start Student Roster</h2>
              </div>
              <button
                type="button"
                onClick={onOpenStudents}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer whitespace-nowrap"
              >
                + Add / Edit Students
              </button>
            </div>

            {students.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/60">
                <p className="text-sm font-medium text-slate-700">No students added yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Save student initials/names and pronouns here to start new observations in one tap.
                </p>
                <button
                  type="button"
                  onClick={onOpenStudents}
                  className="mt-3 min-h-[40px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Start New Student</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{s.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {s.pronouns === 'she' ? 'She/Her' : s.pronouns === 'he' ? 'He/Him' : 'They/Them'} ·{' '}
                        {s.defaultSetting || 'Classroom'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStartNewObservation('live', s)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Live
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartNewObservation('manual', s)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Saved Observations */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <h2 className="text-base font-bold text-slate-900">Saved Observations ({savedObservations.length}/3)</h2>
              </div>
              <button
                type="button"
                onClick={onOpenReview}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer whitespace-nowrap"
              >
                Open Review Area
              </button>
            </div>

            {savedObservations.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/60">
                <p className="text-sm font-medium text-slate-700">No saved observations stored</p>
                <p className="text-xs text-slate-500 mt-1">
                  Up to 3 independent observations can be saved here for side-by-side review and clinical notes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedObservations.map((obs) => (
                  <div key={obs.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{obs.studentName}</div>
                      <div className="text-xs text-slate-500 tabular-nums truncate">
                        {obs.date} · {obs.setting} · On-Task {obs.tOn}% vs Peer {obs.pOn}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenSavedReport(obs.id)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSavedObservation(obs.id)}
                        aria-label={`Delete ${obs.studentName} observation`}
                        className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
