import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import type { SavedObservation, SortOrder } from '../types/boss';

interface StepReviewProps {
  observations: SavedObservation[];
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  onUpdateNote: (id: number, note: string) => void;
  onOpenObservation: (id: number) => void;
  onDeleteObservation: (id: number) => void;
  onNewObservation: () => void;
  onBackToTable: () => void;
}

export function StepReview({
  observations,
  sortOrder,
  onSortOrderChange,
  onUpdateNote,
  onOpenObservation,
  onDeleteObservation,
  onNewObservation,
  onBackToTable,
}: StepReviewProps) {
  const sorted = [...observations].sort((a, b) => {
    if (sortOrder === 'date-desc') return b.date.localeCompare(a.date) || b.id - a.id;
    if (sortOrder === 'date-asc') return a.date.localeCompare(b.date) || a.id - b.id;
    if (sortOrder === 'name-asc') return a.studentName.localeCompare(b.studentName);
    if (sortOrder === 'ontask-asc') return a.tOn - b.tOn;
    return 0;
  });

  return (
    <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            04. Independent Observation Review
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Store, sort, and take independent clinical notes on up to 3 saved observations locally in your browser.
          </p>
        </div>

        <div className="min-w-[200px]">
          <label htmlFor="sortOrder" className="sr-only">
            Sort saved observations
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-sm font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="date-desc">Sort: Date (Newest)</option>
            <option value="date-asc">Sort: Date (Oldest)</option>
            <option value="name-asc">Sort: Student (A–Z)</option>
            <option value="ontask-asc">Sort: On-Task (Low–High)</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-10 text-center bg-slate-50/50 dark:bg-zinc-900/50">
          <p className="text-base font-semibold text-slate-800 dark:text-zinc-100">
            No saved observations yet
          </p>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Complete an observation in Step 3 and select Save to Review Area to compare up to 3 independent sessions here.
          </p>
          <button
            type="button"
            onClick={onNewObservation}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Start New Observation</span>
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 ${
            sorted.length === 2 ? 'lg:grid-cols-2' : sorted.length >= 3 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {sorted.map((obs) => (
            <article
              key={obs.id}
              className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 bg-slate-50/40 dark:bg-zinc-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {obs.studentName}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      {obs.date} · {obs.setting}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenObservation(obs.id)}
                      className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteObservation(obs.id)}
                      aria-label={`Remove ${obs.studentName} observation`}
                      className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/70 text-red-700 dark:text-red-400 text-xs font-semibold inline-flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {obs.classNarrative && (
                  <p className="text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                      Class Activity:{' '}
                    </span>
                    {obs.classNarrative}
                  </p>
                )}

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-800">
                        <th className="py-2 px-2.5 text-left font-bold">Category</th>
                        <th className="py-2 px-2.5 text-center font-bold">{obs.studentName}</th>
                        <th className="py-2 px-2.5 text-center font-bold">Peer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      <tr className="bg-slate-50/70 dark:bg-zinc-900/60 font-semibold text-slate-900 dark:text-zinc-100">
                        <td className="py-1.5 px-2.5">On-Task</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.tOn}%</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.pOn}%</td>
                      </tr>
                      <tr className="bg-slate-50/70 dark:bg-zinc-900/60 font-semibold text-slate-900 dark:text-zinc-100">
                        <td className="py-1.5 px-2.5">Total Off-Task</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">
                          {obs.tOffTotal}%
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">
                          {obs.pOffTotal}%
                        </td>
                      </tr>
                      <tr className="text-slate-700 dark:text-zinc-300">
                        <td className="py-1.5 px-2.5">OFT-M</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.tM}%</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.pM}%</td>
                      </tr>
                      <tr className="text-slate-700 dark:text-zinc-300">
                        <td className="py-1.5 px-2.5">OFT-V</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.tV}%</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.pV}%</td>
                      </tr>
                      <tr className="text-slate-700 dark:text-zinc-300">
                        <td className="py-1.5 px-2.5">OFT-P</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.tP}%</td>
                        <td className="py-1.5 px-2.5 text-center font-mono tabular-nums">{obs.pP}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`note-${obs.id}`}
                  className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
                >
                  Independent Review Notes
                </label>
                <textarea
                  id={`note-${obs.id}`}
                  rows={3}
                  value={obs.notes}
                  onChange={(e) => onUpdateNote(obs.id, e.target.value)}
                  placeholder="Add clinical notes or follow-up observations..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onNewObservation}
          className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Start New Observation</span>
        </button>

        <button
          type="button"
          onClick={onBackToTable}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Back to Current Table</span>
        </button>
      </div>
    </section>
  );
}
