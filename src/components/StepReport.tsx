import { ArrowLeft, BookmarkPlus, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { BossResult, ReportOptionalFills } from '../types/boss';
import {
  buildHtmlTableString,
  buildPlainTableString,
  buildReportParagraphs,
  reportParagraphsToPlainText,
} from '../utils/bossEngine';

interface StepReportProps {
  result: BossResult;
  fills: ReportOptionalFills;
  savedCount: number;
  onFillsChange: (next: ReportOptionalFills) => void;
  onBack: () => void;
  onSaveObservation: () => void;
  onNotify: (message: string) => void;
}

export function StepReport({
  result,
  fills,
  savedCount,
  onFillsChange,
  onBack,
  onSaveObservation,
  onNotify,
}: StepReportProps) {
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const paragraphs = buildReportParagraphs(result, fills);

  const tableRows = [
    { label: 'On-Task', target: `${result.tOn}%`, peer: `${result.pOn}%`, summary: true },
    { label: 'Total Off-Task', target: `${result.tOffTotal}%`, peer: `${result.pOffTotal}%`, summary: true },
    { label: 'Off-Task Motor (OFT-M)', target: `${result.tM}%`, peer: `${result.pM}%`, summary: false },
    { label: 'Off-Task Verbal (OFT-V)', target: `${result.tV}%`, peer: `${result.pV}%`, summary: false },
    { label: 'Off-Task Passive (OFT-P)', target: `${result.tP}%`, peer: `${result.pP}%`, summary: false },
  ];

  const handleCopyTable = async () => {
    const html = buildHtmlTableString(result);
    const plain = buildPlainTableString(result);

    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(plain);
      }
      setCopiedTable(true);
      onNotify('6×3 table copied. Paste directly into Word or Google Docs.');
      setTimeout(() => setCopiedTable(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(plain);
        setCopiedTable(true);
        onNotify('Table copied to clipboard.');
        setTimeout(() => setCopiedTable(false), 2000);
      } catch {
        onNotify('Could not access clipboard in this browser.');
      }
    }
  };

  const handleCopyReport = async () => {
    const plainText = reportParagraphsToPlainText(paragraphs);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedReport(true);
      onNotify('Report narrative copied to clipboard.');
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      onNotify('Could not access clipboard in this browser.');
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Header + 6x3 Data Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            03. 6×3 Data Table &amp; Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {result.studentName} · {result.setting} · {result.date}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyTable}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-transparent dark:border-zinc-800 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {copiedTable ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Copied Table</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Copy Table for Word / Docs</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-800">
              <th className="py-3 px-4 text-left font-bold">BOSS Behavior Category</th>
              <th className="py-3 px-4 text-center font-bold w-[24%]">{result.studentName}</th>
              <th className="py-3 px-4 text-center font-bold w-[24%]">Classroom Peer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
            {tableRows.map((row) => (
              <tr
                key={row.label}
                className={
                  row.summary
                    ? 'bg-slate-50/70 dark:bg-zinc-900/60 font-semibold text-slate-900 dark:text-zinc-100'
                    : 'bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200'
                }
              >
                <td className="py-3 px-4">{row.label}</td>
                <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold">
                  {row.target}
                </td>
                <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold">
                  {row.peer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.classNarrative && (
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-sm text-slate-800 dark:text-zinc-200">
          <span className="font-semibold text-blue-950 dark:text-blue-200">Classroom Activity Note: </span>
          <span>{result.classNarrative}</span>
        </div>
      )}

      {/* Report Template Section */}
      <div className="mt-8 pt-7 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
            Observation Report Narrative
          </h3>
          <button
            type="button"
            onClick={handleCopyReport}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-transparent dark:border-zinc-800 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Copied Report</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Copy Report Text</span>
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-5">
          Highlighted bracketed areas stay ready for you to complete later in your report, or optionally fill specific behaviors below before copying.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label
              htmlFor="fill-format"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
            >
              Instructional Format (Optional)
            </label>
            <input
              id="fill-format"
              type="text"
              value={fills.format}
              onChange={(e) => onFillsChange({ ...fills, format: e.target.value })}
              placeholder="e.g., independent work"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>

          <div>
            <label
              htmlFor="fill-motor"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
            >
              Specific Motor Behaviors (Optional)
            </label>
            <input
              id="fill-motor"
              type="text"
              value={fills.motor}
              onChange={(e) => onFillsChange({ ...fills, motor: e.target.value })}
              placeholder="e.g., tapping on desk, playing with wrappers"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>

          <div>
            <label
              htmlFor="fill-verbal"
              className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
            >
              Specific Verbal Behaviors (Optional)
            </label>
            <input
              id="fill-verbal"
              type="text"
              value={fills.verbal}
              onChange={(e) => onFillsChange({ ...fills, verbal: e.target.value })}
              placeholder="e.g., talking with classmates seated nearby"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-zinc-950"
            />
          </div>
        </div>

        {/* Populated Template Output */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200">
          {paragraphs.map((p) => (
            <div key={p.id}>
              {p.heading && (
                <div className="font-bold text-slate-900 dark:text-zinc-100 mb-1">{p.heading}</div>
              )}
              <p className="m-0">
                {p.inlineLabel && (
                  <strong className="text-slate-900 dark:text-zinc-100 mr-1.5">{p.inlineLabel}</strong>
                )}
                {p.tokens.map((tok, idx) => {
                  if (tok.kind === 'blank') {
                    return (
                      <span
                        key={idx}
                        className="inline-block bg-amber-100 dark:bg-amber-950/80 border border-dashed border-amber-500 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-semibold px-1.5 py-0.5 rounded-md mx-0.5 text-[0.92em]"
                      >
                        {tok.text}
                      </span>
                    );
                  }
                  if (tok.kind === 'filled') {
                    return (
                      <span
                        key={idx}
                        className="inline-block bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 font-semibold px-1.5 py-0.5 rounded-md mx-0.5 text-[0.95em]"
                      >
                        {tok.text}
                      </span>
                    );
                  }
                  return <span key={idx}>{tok.text}</span>;
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Edit Data</span>
        </button>

        <button
          type="button"
          onClick={onSaveObservation}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookmarkPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Save to Review Area ({savedCount}/3)</span>
        </button>
      </div>
    </section>
  );
}
