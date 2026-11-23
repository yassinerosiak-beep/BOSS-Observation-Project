import { ArrowLeft, ClipboardList, Timer, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { InputMode, PronounCode, StudentProfile } from '../types/boss';

interface StudentsViewProps {
  students: StudentProfile[];
  onAddStudent: (profile: Omit<StudentProfile, 'id' | 'createdAt'>, startMode?: InputMode) => void;
  onDeleteStudent: (id: string) => void;
  onStartObservationForStudent: (student: StudentProfile, mode: InputMode) => void;
  onBackToMenu: () => void;
}

export function StudentsView({
  students,
  onAddStudent,
  onDeleteStudent,
  onStartObservationForStudent,
  onBackToMenu,
}: StudentsViewProps) {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState<PronounCode>('she');
  const [defaultSetting, setDefaultSetting] = useState('math');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddStudent({ name: name.trim(), pronouns, defaultSetting: defaultSetting.trim() || 'classroom' });
    setName('');
  };

  const handleSaveAndStart = (mode: InputMode) => {
    if (!name.trim()) return;
    onAddStudent(
      { name: name.trim(), pronouns, defaultSetting: defaultSetting.trim() || 'classroom' },
      mode
    );
    setName('');
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Student Roster &amp; New Student
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Use first names or initials only (FERPA-friendly local storage). Launch observations directly from any student row.
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

        <form
          onSubmit={handleSaveOnly}
          className="p-5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">Add New Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="newStudentName"
                className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
              >
                First Name or Initials
              </label>
              <input
                id="newStudentName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Miracle or J.M."
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="newStudentPronouns"
                className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
              >
                Pronouns
              </label>
              <select
                id="newStudentPronouns"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value as PronounCode)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="she">She / Her</option>
                <option value="he">He / Him</option>
                <option value="they">They / Them</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="newStudentSubject"
                className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1"
              >
                Default Class / Subject
              </label>
              <input
                id="newStudentSubject"
                type="text"
                value={defaultSetting}
                onChange={(e) => setDefaultSetting(e.target.value)}
                placeholder="e.g., math, ELA"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="submit"
              disabled={!name.trim()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>Save Student</span>
            </button>

            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => handleSaveAndStart('live')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Timer className="w-4 h-4" aria-hidden="true" />
              <span>Save &amp; Start Live Timer</span>
            </button>

            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => handleSaveAndStart('manual')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-45 text-slate-900 dark:text-zinc-100 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" aria-hidden="true" />
              <span>Save &amp; Enter Post-Hoc</span>
            </button>
          </div>
        </form>

        {/* Roster List */}
        <div className="mt-7">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-3">
            Saved Students ({students.length})
          </h2>

          {students.length === 0 ? (
            <div className="border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-8 text-center text-sm text-slate-500 dark:text-zinc-400">
              No students saved yet. Add a student above to build your quick-start roster.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {students.map((student) => {
                const confirming = confirmDeleteId === student.id;
                return (
                  <div
                    key={student.id}
                    className="p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {student.pronouns === 'she'
                          ? 'She / Her'
                          : student.pronouns === 'he'
                            ? 'He / Him'
                            : 'They / Them'}{' '}
                        · {student.defaultSetting}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStartObservationForStudent(student, 'live')}
                        className="min-h-[40px] px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Live Timer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onStartObservationForStudent(student, 'manual')}
                        className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Post-Hoc</span>
                      </button>

                      {confirming ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteStudent(student.id);
                              setConfirmDeleteId(null);
                            }}
                            className="min-h-[40px] px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[40px] px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(student.id)}
                          aria-label={`Delete ${student.name}`}
                          className="min-h-[40px] min-w-[40px] px-2.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/70 text-red-700 dark:text-red-400 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
