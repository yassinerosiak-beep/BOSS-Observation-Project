export type AppView = 'menu' | 'wizard' | 'students' | 'options';

export type StepNumber = 1 | 2 | 3 | 4;

export type InputMode = 'manual' | 'live';

export type ManualInputType = 'pct' | 'cnt';

export type PronounCode = 'she' | 'he' | 'they';

export type SortOrder = 'date-desc' | 'date-asc' | 'name-asc' | 'ontask-asc';

export interface StudentProfile {
  id: string;
  name: string;
  pronouns: PronounCode;
  defaultSetting: string;
  createdAt: string;
}

export interface AppOptions {
  defaultIntervalSeconds: number;
  defaultTotalIntervals: number;
  peerCadence: number;
  defaultInputMode: InputMode;
  defaultSoundOn: boolean;
  defaultVisualFlash: boolean;
  keepScreenAwake: boolean;
}

export interface IntervalHistoryEntry {
  intervalNumber: number;
  wasPeer: boolean;
  marks: LiveMarks;
}

export interface ObservationSetup {
  studentName: string;
  pronouns: PronounCode;
  setting: string;
  date: string;
  intervalSeconds: number;
  totalIntervals: number;
  inputMode: InputMode;
}

export interface ManualPercentages {
  tOn: number;
  tM: number;
  tV: number;
  tP: number;
  pOn: number;
  pM: number;
  pV: number;
  pP: number;
}

export interface ManualCounts {
  tTot: number;
  tOn: number;
  tM: number;
  tV: number;
  tP: number;
  pTot: number;
  pOn: number;
  pM: number;
  pV: number;
  pP: number;
}

export interface LiveMarks {
  ON: boolean;
  M: boolean;
  V: boolean;
  P: boolean;
}

export interface LiveTallies {
  tTot: number;
  tOn: number;
  tAnyOff: number;
  tM: number;
  tV: number;
  tP: number;
  pTot: number;
  pOn: number;
  pAnyOff: number;
  pM: number;
  pV: number;
  pP: number;
}

export interface BossResult {
  studentName: string;
  pronouns: PronounCode;
  date: string;
  setting: string;
  classNarrative: string;
  tOn: number;
  tOffTotal: number;
  tM: number;
  tV: number;
  tP: number;
  pOn: number;
  pOffTotal: number;
  pM: number;
  pV: number;
  pP: number;
}

export interface ReportOptionalFills {
  format: string;
  motor: string;
  verbal: string;
}

export interface SavedObservation extends BossResult {
  id: number;
  notes: string;
}

export interface ReportToken {
  text: string;
  kind: 'text' | 'blank' | 'filled';
}

export interface ReportParagraph {
  id: string;
  heading?: string;
  inlineLabel?: string;
  tokens: ReportToken[];
}
