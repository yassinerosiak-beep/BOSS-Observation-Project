import { ArrowLeft, ArrowRight, Clock, ClipboardList, Timer } from 'lucide-react';
import type { InputMode, ObservationSetup, PronounCode, StudentProfile } from '../types/boss';
import { formatDurationEstimate } from '../utils/bossEngine';

interface StepSetupProps {
  setup: ObservationSetup;
  students: StudentProfile[];
  onChange: (next: ObservationSetup) => void;
  onContinue: () => void;
  onBackToMenu: () => void;
}

export function StepSetup({
  setup,
  students,
  onChange,
  onContinue,
  onBackToMenu,
}: StepSetupProps) {
  const estimateText = formatDurationEstimate(setup.intervalSeconds, setup.totalIntervals);

  const updateField = <K extends keyof ObservationSetup>(key: K, value: ObservationSetup[K]) => {
    onChange({ ...setup, [key]: value });
  };

  const handleSelectStudent = (studentId: string) => {
    const found = students.find((s) => s.id === studentId);
    if (!found) return;
    onChange({
      ...setup,
      studentName: found.name,
      pronouns: found.pronouns,
      setting: found.defaultSetting || setup.setting,
    });
  };

  return (
    <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            01. Observation Setup
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            Configure student details, interval timing, and data collection method for this independent observation.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 self-start cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Main Menu</span>
        </button>
      </div>

      {students.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800">
          <label
            htmlFor="quickStudentPick"
            className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
          >
            Load Saved Student Profile (Optional)
          </label>
          <select
            id="quickStudentPick"
            defaultValue=""
            onChange={(e) => handleSelectStudent(e.target.value)}
            className="w-full sm:max-w-sm min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Choose a saved student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.defaultSetting})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="studentName"
            className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
          >
            Student First Name (Column 2 Header)
          </label>
          <input
            id="studentName"
            type="text"
            value={setup.studentName}
            onChange={(e) => updateField('studentName', e.target.value)}
            placeholder="e.g., Miracle"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="studentPronouns"
            className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
          >
            Student Pronouns
          </label>
          <select
            id="studentPronouns"
            value={setup.pronouns}
            onChange={(e) => updateField('pronouns', e.target.value as PronounCode)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-colors"
          >
            <option value="she">She / Her</option>
            <option value="he">He / Him</option>
            <option value="they">They / Them</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="obsSetting"
            className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
          >
            Class / Subject
          </label>
          <input
            id="obsSetting"
            type="text"
            value={setup.setting}
            onChange={(e) => updateField('setting', e.target.value)}
            placeholder="e.g., math, ELA, social studies"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="obsDate"
            className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5"
          >
            Observation Date
          </label>
          <input
            id="obsDate"
            type="date"
            value={setup.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-colors tabular-nums"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
          Interval Settings (Seconds per Interval &amp; Total Intervals)
        </label>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label htmlFor="intSeconds" className="block text-xs text-slate-500 dark:text-zinc-400 mb-1">
              Seconds / Interval
            </label>
            <input
              id="intSeconds"
              type="number"
              min={5}
              max={120}
              value={setup.intervalSeconds}
              onChange={(e) => updateField('intervalSeconds', Math.max(1, Number(e.target.value) || 15))}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>
          <div>
            <label htmlFor="intTotal" className="block text-xs text-slate-500 dark:text-zinc-400 mb-1">
              Total Intervals
            </label>
            <input
              id="intTotal"
              type="number"
              min={5}
              max={240}
              value={setup.totalIntervals}
              onChange={(e) => updateField('totalIntervals', Math.max(1, Number(e.target.value) || 60))}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-base font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 rounded-xl px-3.5 py-2.5 max-w-md tabular-nums">
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Estimated Observation Length: {estimateText}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
        <span className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2.5">
          Data Collection Method
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Data Collection Method">
          {(
            [
              {
                id: 'manual' as InputMode,
                title: 'Enter Counts / % (Post-Hoc)',
                desc: 'Type percentages or interval counts from a completed observation sheet.',
                icon: ClipboardList,
              },
              {
                id: 'live' as InputMode,
                title: 'Live Classroom Timer',
                desc: 'Real-time interval timer with audio cues and Target/Peer screen shifts.',
                icon: Timer,
              },
            ] as const
          ).map((opt) => {
            const active = setup.inputMode === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField('inputMode', opt.id)}
                className={`min-h-[64px] text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  active
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/50 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/60 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      active ? 'text-blue-950 dark:text-blue-100' : 'text-slate-900 dark:text-zinc-100'
                    }`}
                  >
                    {opt.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Continue to Observation</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
