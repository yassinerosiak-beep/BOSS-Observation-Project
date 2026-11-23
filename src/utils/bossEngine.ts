import type {
  AppOptions,
  BossResult,
  InputMode,
  LiveTallies,
  ManualCounts,
  ManualInputType,
  ManualPercentages,
  ObservationSetup,
  PronounCode,
  ReportOptionalFills,
  ReportParagraph,
  ReportToken,
  SavedObservation,
  StudentProfile,
} from '../types/boss';

const STORAGE_KEY = 'boss_observer_saved_v1';
const STUDENTS_KEY = 'boss_observer_students_v1';
const OPTIONS_KEY = 'boss_observer_options_v1';

export const DEFAULT_OPTIONS: AppOptions = {
  defaultIntervalSeconds: 15,
  defaultTotalIntervals: 60,
  peerCadence: 5,
  defaultInputMode: 'manual',
  defaultSoundOn: true,
  defaultVisualFlash: true,
  keepScreenAwake: true,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDurationEstimate(secondsPerInterval: number, totalIntervals: number): string {
  const sec = Math.max(1, Math.round(secondsPerInterval || 15));
  const tot = Math.max(1, Math.round(totalIntervals || 60));
  const totalSeconds = sec * tot;
  const mins = Math.floor(totalSeconds / 60);
  const remSecs = totalSeconds % 60;

  let timeText = '';
  if (mins > 0 && remSecs > 0) {
    timeText = `${mins} min ${remSecs} sec`;
  } else if (mins > 0) {
    timeText = `${mins} minute${mins === 1 ? '' : 's'}`;
  } else {
    timeText = `${remSecs} seconds`;
  }

  return `${timeText} · ${tot} intervals × ${sec}s`;
}

export function isPeerInterval(intervalIndex: number, peerCadence = 5): boolean {
  const cadence = Math.max(2, Math.round(peerCadence || 5));
  return intervalIndex % cadence === 0;
}

export function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function pct(count: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((count / total) * 100);
}

export function calculateBossResult(
  setup: ObservationSetup,
  classNarrative: string,
  inputMode: InputMode,
  manualType: ManualInputType,
  manualPct: ManualPercentages,
  manualCounts: ManualCounts,
  liveTallies: LiveTallies
): BossResult {
  const studentName = setup.studentName.trim() || 'Student';
  const setting = setup.setting.trim() || 'classroom';
  const date = setup.date || getTodayDateString();
  const narrative = classNarrative.trim();

  if (inputMode === 'manual') {
    if (manualType === 'pct') {
      const tOn = clampPct(manualPct.tOn);
      const tM = clampPct(manualPct.tM);
      const tV = clampPct(manualPct.tV);
      const tP = clampPct(manualPct.tP);
      const pOn = clampPct(manualPct.pOn);
      const pM = clampPct(manualPct.pM);
      const pV = clampPct(manualPct.pV);
      const pP = clampPct(manualPct.pP);

      return {
        studentName,
        pronouns: setup.pronouns,
        date,
        setting,
        classNarrative: narrative,
        tOn,
        tOffTotal: Math.min(100, tM + tV + tP),
        tM,
        tV,
        tP,
        pOn,
        pOffTotal: Math.min(100, pM + pV + pP),
        pM,
        pV,
        pP,
      };
    }

    const tTot = Math.max(1, manualCounts.tTot || 1);
    const pTot = Math.max(1, manualCounts.pTot || 1);
    const tOn = pct(manualCounts.tOn, tTot);
    const tM = pct(manualCounts.tM, tTot);
    const tV = pct(manualCounts.tV, tTot);
    const tP = pct(manualCounts.tP, tTot);
    const pOn = pct(manualCounts.pOn, pTot);
    const pM = pct(manualCounts.pM, pTot);
    const pV = pct(manualCounts.pV, pTot);
    const pP = pct(manualCounts.pP, pTot);

    return {
      studentName,
      pronouns: setup.pronouns,
      date,
      setting,
      classNarrative: narrative,
      tOn,
      tOffTotal: Math.min(100, tM + tV + tP),
      tM,
      tV,
      tP,
      pOn,
      pOffTotal: Math.min(100, pM + pV + pP),
      pM,
      pV,
      pP,
    };
  }

  return {
    studentName,
    pronouns: setup.pronouns,
    date,
    setting,
    classNarrative: narrative,
    tOn: pct(liveTallies.tOn, liveTallies.tTot),
    tOffTotal: pct(liveTallies.tAnyOff, liveTallies.tTot),
    tM: pct(liveTallies.tM, liveTallies.tTot),
    tV: pct(liveTallies.tV, liveTallies.tTot),
    tP: pct(liveTallies.tP, liveTallies.tTot),
    pOn: pct(liveTallies.pOn, liveTallies.pTot),
    pOffTotal: pct(liveTallies.pAnyOff, liveTallies.pTot),
    pM: pct(liveTallies.pM, liveTallies.pTot),
    pV: pct(liveTallies.pV, liveTallies.pTot),
    pP: pct(liveTallies.pP, liveTallies.pTot),
  };
}

function getPronounMap(code: PronounCode) {
  if (code === 'he') {
    return { subj: 'He', subjLow: 'he', poss: 'his', possCap: 'His', wasWere: 'was' };
  }
  if (code === 'they') {
    return { subj: 'They', subjLow: 'they', poss: 'their', possCap: 'Their', wasWere: 'were' };
  }
  return { subj: 'She', subjLow: 'she', poss: 'her', possCap: 'Her', wasWere: 'was' };
}

function numWord(n: number): string {
  const words: Record<number, string> = {
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
  };
  return words[n] || String(n);
}

function ratePhrase(t: number, p: number, includePeerNum = true): string {
  if (p === 0 && t === 0) {
    return includePeerNum ? 'matching the 0% peer rate' : 'at a rate matching classroom peers';
  }
  if (p === 0) {
    return includePeerNum ? 'compared to the 0% peer rate' : 'above the 0% peer rate';
  }

  const ratio = t / p;
  const diff = t - p;

  if (Math.abs(diff) <= 5 || (ratio >= 0.8 && ratio <= 1.25)) {
    return includePeerNum
      ? `consistent with the peer comparison rate of ${p}%`
      : 'consistent with the classroom peer rate';
  }
  if (t < p) {
    return includePeerNum
      ? `below the peer comparison rate of ${p}%`
      : 'below the classroom peer rate';
  }

  const whole = Math.floor(ratio);
  const rounded = Math.round(ratio);

  if (ratio >= 2) {
    if (ratio - whole >= 0.2 && whole >= 2 && whole <= 12) {
      return includePeerNum
        ? `more than ${numWord(whole)} times the peer comparison rate of ${p}%`
        : `more than ${numWord(whole)} times the peer rate`;
    }
    if (rounded >= 2) {
      const approx = Math.abs(ratio - rounded) < 0.08 ? '' : 'roughly ';
      return includePeerNum
        ? `${approx}${numWord(rounded)} times the peer comparison rate of ${p}%`
        : `${approx}${numWord(rounded)} times the peer rate`;
    }
  }

  return includePeerNum
    ? `higher than the peer comparison rate of ${p}%`
    : 'above the classroom peer rate';
}

function makeSlot(value: string, placeholder: string): ReportToken {
  const trimmed = value.trim();
  if (trimmed) {
    return { text: trimmed, kind: 'filled' };
  }
  return { text: placeholder, kind: 'blank' };
}

export function buildReportParagraphs(
  r: BossResult,
  fills: ReportOptionalFills
): ReportParagraph[] {
  const pr = getPronounMap(r.pronouns);
  const name = r.studentName;
  const subj = r.setting;

  const engDiff = r.tOn - r.pOn;
  let engComp = '';
  if (engDiff <= -25) {
    engComp = `substantially lower levels of academic engagement than ${pr.poss} classroom peers`;
  } else if (engDiff <= -10) {
    engComp = `lower levels of academic engagement than ${pr.poss} classroom peers`;
  } else if (engDiff < 10) {
    engComp = `comparable levels of academic engagement relative to ${pr.poss} classroom peers`;
  } else if (engDiff < 25) {
    engComp = `higher levels of academic engagement than ${pr.poss} classroom peers`;
  } else {
    engComp = `substantially higher levels of academic engagement than ${pr.poss} classroom peers`;
  }

  const introParagraph: ReportParagraph = {
    id: 'intro',
    tokens: [
      {
        text: `${name} was observed in ${pr.poss} ${subj} classroom using the Behavioral Observation of Students in Schools (BOSS) systematic observation system to evaluate ${pr.poss} academic engagement and off-task behaviors relative to classroom peers. During the observation period, students were expected to `,
        kind: 'text',
      },
      makeSlot('', '[CLASS ASSIGNMENT/EXPECTATION]'),
      {
        text: '. Peer comparison data were collected concurrently across intervals to establish normative classroom expectations for the activity.',
        kind: 'text',
      },
    ],
  };

  const aetParagraph: ReportParagraph = {
    id: 'aet',
    heading: 'Academic Engagement (On-Task)',
    tokens: [
      {
        text: `${name} demonstrated ${engComp} during `,
        kind: 'text',
      },
      makeSlot(fills.format, '[INSTRUCTIONAL FORMAT/ACTIVITY]'),
      {
        text: `. ${pr.subj} ${pr.wasWere} observed to be on-task—`,
        kind: 'text',
      },
      makeSlot('', '[CLASS ASSIGNMENT]'),
      {
        text: `—during ${r.tOn}% of observed intervals, compared to ${r.pOn}% of intervals for comparison peers.`,
        kind: 'text',
      },
    ],
  };

  const offBreakdownParagraph: ReportParagraph = {
    id: 'off-breakdown',
    heading: 'Off-Task Behavior Breakdown',
    tokens: [
      {
        text: `${name} exhibited off-task behavior during ${r.tOffTotal}% of observed intervals, ${ratePhrase(r.tOffTotal, r.pOffTotal, true)}. ${pr.possCap} off-task behaviors occurred across passive, motor, and verbal categories:`,
        kind: 'text',
      },
    ],
  };

  const cats = [
    { key: 'P' as const, val: r.tP, pVal: r.pP },
    { key: 'M' as const, val: r.tM, pVal: r.pM },
    { key: 'V' as const, val: r.tV, pVal: r.pV },
  ].sort((a, b) => b.val - a.val);

  const topKey = cats[0].val > 0 ? cats[0].key : null;

  const categoryParagraphs: ReportParagraph[] = cats.map((c) => {
    if (c.key === 'P') {
      const lead =
        topKey === 'P'
          ? `Passive disengagement was ${name}'s most frequent off-task behavior, occurring at ${ratePhrase(r.tP, r.pP, false).replace(/^at /, '')}.`
          : `Passive disengagement occurred ${ratePhrase(r.tP, r.pP, false)}.`;

      return {
        id: 'oft-p',
        inlineLabel: `Off-Task Passive (${r.tP}% vs. ${r.pP}% peer):`,
        tokens: [
          { text: `${lead} During these intervals, ${pr.subjLow} disengaged from ${pr.poss} `, kind: 'text' },
          makeSlot('', '[WHAT TASK]'),
          { text: ' without producing overt motor or verbal disruptions.', kind: 'text' },
        ],
      };
    }

    if (c.key === 'M') {
      const rateDesc = ratePhrase(r.tM, r.pM, false);
      const lead =
        topKey === 'M'
          ? `Motor disengagement was ${name}'s most frequent off-task behavior, occurring ${rateDesc} than ${pr.poss} peers.`
          : r.tM > r.pM && r.pM > 0
            ? `${name} engaged in off-task motor activities at ${rateDesc.replace(/^at /, '')} of ${pr.poss} peers.`
            : `${name} engaged in off-task motor activities ${rateDesc}.`;

      return {
        id: 'oft-m',
        inlineLabel: `Off-Task Motor (${r.tM}% vs. ${r.pM}% peer):`,
        tokens: [
          { text: `${lead} Specific behaviors included `, kind: 'text' },
          makeSlot(fills.motor, '[SPECIFIC MOTOR BEHAVIORS]'),
          { text: ` in place of engaging with ${pr.poss} instructional materials.`, kind: 'text' },
        ],
      };
    }

    const vDiff = r.tV - r.pV;
    let vSummary = '';
    if (Math.abs(vDiff) <= 5 || (r.pV > 0 && r.tV / r.pV >= 0.8 && r.tV / r.pV <= 1.25)) {
      vSummary =
        'was consistent with the classroom peer average, indicating that brief peer conversations occurred at a typical rate for the setting.';
    } else if (vDiff > 5) {
      vSummary = `occurred ${ratePhrase(r.tV, r.pV, false)}, indicating elevated verbal disengagement relative to classroom expectations.`;
    } else {
      vSummary = 'was below the classroom peer average for the setting.';
    }

    const leadPrefix =
      topKey === 'V'
        ? `Verbal disengagement was ${name}'s most frequent off-task behavior. ${name}’s off-task verbal behavior—consisting of `
        : `${name}’s off-task verbal behavior—consisting of `;

    return {
      id: 'oft-v',
      inlineLabel: `Off-Task Verbal (${r.tV}% vs. ${r.pV}% peer):`,
      tokens: [
        { text: leadPrefix, kind: 'text' },
        makeSlot(fills.verbal, '[SPECIFIC VERBAL BEHAVIORS]'),
        { text: `—${vSummary}`, kind: 'text' },
      ],
    };
  });

  return [introParagraph, aetParagraph, offBreakdownParagraph, ...categoryParagraphs];
}

export function reportParagraphsToPlainText(paragraphs: ReportParagraph[]): string {
  return paragraphs
    .map((p) => {
      const body = p.tokens.map((t) => t.text).join('');
      if (p.heading) return `${p.heading}\n${body}`;
      if (p.inlineLabel) return `${p.inlineLabel} ${body}`;
      return body;
    })
    .join('\n\n');
}

export function buildHtmlTableString(r: BossResult): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = [
    ['On-Task', `${r.tOn}%`, `${r.pOn}%`, true],
    ['Total Off-Task', `${r.tOffTotal}%`, `${r.pOffTotal}%`, true],
    ['Off-Task Motor (OFT-M)', `${r.tM}%`, `${r.pM}%`, false],
    ['Off-Task Verbal (OFT-V)', `${r.tV}%`, `${r.pV}%`, false],
    ['Off-Task Passive (OFT-P)', `${r.tP}%`, `${r.pP}%`, false],
  ] as const;

  const trs = rows
    .map(
      ([label, tVal, pVal, bold]) =>
        `<tr${bold ? ' style="background:#f8fafc;font-weight:bold;"' : ''}>` +
        `<td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">${esc(label)}</td>` +
        `<td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${tVal}</td>` +
        `<td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${pVal}</td>` +
        `</tr>`
    )
    .join('');

  return (
    `<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:11pt;">` +
    `<thead><tr style="background:#f1f5f9;font-weight:bold;">` +
    `<th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">BOSS Behavior Category</th>` +
    `<th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${esc(r.studentName)}</th>` +
    `<th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">Classroom Peer</th>` +
    `</tr></thead><tbody>${trs}</tbody></table>`
  );
}

export function buildPlainTableString(r: BossResult): string {
  const lines = [
    `BOSS Behavior Category\t${r.studentName}\tClassroom Peer`,
    `On-Task\t${r.tOn}%\t${r.pOn}%`,
    `Total Off-Task\t${r.tOffTotal}%\t${r.pOffTotal}%`,
    `Off-Task Motor (OFT-M)\t${r.tM}%\t${r.pM}%`,
    `Off-Task Verbal (OFT-V)\t${r.tV}%\t${r.pV}%`,
    `Off-Task Passive (OFT-P)\t${r.tP}%\t${r.pP}%`,
  ];
  return lines.join('\n');
}

export function loadSavedObservations(): SavedObservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveObservationsToStorage(list: SavedObservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudentsToStorage(list: StudentProfile[]): void {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadOptions(): AppOptions {
  try {
    const raw = localStorage.getItem(OPTIONS_KEY);
    if (!raw) return DEFAULT_OPTIONS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OPTIONS, ...parsed };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export function saveOptionsToStorage(options: AppOptions): void {
  try {
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
  } catch {
    // Ignore storage quota issues safely
  }
}

let sharedAudioCtx: AudioContext | null = null;

export function playCueTone(freq = 880, durationSec = 0.12, muted = false): void {
  if (muted) return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new Ctx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    osc.start();
    osc.stop(sharedAudioCtx.currentTime + durationSec);
  } catch {
    // Audio optional
  }
}
