import { ArrowRight, Clock, ClipboardList, Timer } from 'lucide-react';
import type { InputMode, ObservationSetup, PronounCode } from '../types/boss';
import { formatDurationEstimate } from '../utils/bossEngine';

interface StepSetupProps {
  setup: ObservationSetup;
  onChange: (next: ObservationSetup) => void;
  onContinue: () => void;
}

export function StepSetup({ setup, onChange, onContinue }: StepSetupProps) {
  const estimateText = formatDurationEstimate(setup.intervalSeconds, setup.totalIntervals);

  const updateField = <K extends keyof ObservationSetup>(key: K, value: ObservationSetup[K]) => {
    onChange({ ...setup, [key]: value });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          01. Observation Setup
        </h2>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600">
          Configure student details, interval timing, and data collection method for this independent observation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="studentName" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Student First Name (Column 2 Header)
          </label>
          <input
            id="studentName"
            type="text"
            value={setup.studentName}
            onChange={(e) => updateField('studentName', e.target.value)}
            placeholder="e.g., Miracle"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label htmlFor="studentPronouns" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Student Pronouns
          </label>
          <select
            id="studentPronouns"
            value={setup.pronouns}
            onChange={(e) => updateField('pronouns', e.target.value as PronounCode)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
          >
            <option value="she">She / Her</option>
            <option value="he">He / Him</option>
            <option value="they">They / Them</option>
          </select>
        </div>

        <div>
          <label htmlFor="obsSetting" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Class / Subject
          </label>
          <input
            id="obsSetting"
            type="text"
            value={setup.setting}
            onChange={(e) => updateField('setting', e.target.value)}
            placeholder="e.g., math, ELA, social studies"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label htmlFor="obsDate" className="block text-xs font-semibold text-slate-600 mb-1.5">
            Observation Date
          </label>
          <input
            id="obsDate"
            type="date"
            value={setup.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors tabular-nums"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          Interval Settings (Seconds per Interval &amp; Total Intervals)
        </label>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label htmlFor="intSeconds" className="block text-xs text-slate-500 mb-1">
              Seconds / Interval
            </label>
            <input
              id="intSeconds"
              type="number"
              min={5}
              max={120}
              value={setup.intervalSeconds}
              onChange={(e) => updateField('intervalSeconds', Math.max(1, Number(e.target.value) || 15))}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="intTotal" className="block text-xs text-slate-500 mb-1">
              Total Intervals
            </label>
            <input
              id="intTotal"
              type="number"
              min={5}
              max={240}
              value={setup.totalIntervals}
              onChange={(e) => updateField('totalIntervals', Math.max(1, Number(e.target.value) || 60))}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-900 text-base font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50/80 border border-blue-200/80 rounded-xl px-3.5 py-2.5 max-w-md tabular-nums">
          <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Estimated Observation Length: {estimateText}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <span className="block text-xs font-semibold text-slate-600 mb-2.5">
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
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <div>
                  <div className={`text-sm font-semibold ${active ? 'text-blue-950' : 'text-slate-900'}`}>
                    {opt.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</div>
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
