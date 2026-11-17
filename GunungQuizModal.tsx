import React, { useState } from 'react';
import { Award, CheckCircle2, Mountain, X, XCircle } from 'lucide-react';
import { GUNUNG_QUESTIONS } from '../../data/sajakContent';
import { soundEngine } from '../../game/audio';

interface GunungQuizModalProps {
  alreadyCompleted: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const GunungQuizModal: React.FC<GunungQuizModalProps> = ({
  alreadyCompleted,
  onComplete,
  onClose,
}) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = GUNUNG_QUESTIONS[idx];
  const total = GUNUNG_QUESTIONS.length;
  const pct = Math.round(((idx + (answered ? 1 : 0)) / total) * 100);

  const handleCheck = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === q.correctIndex) {
      setScore((s) => s + 1);
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNext = () => {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      soundEngine.playQuestComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-amber-300 p-6 text-slate-900 max-h-[92vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Cabaran Puncak Gunung Puisi
              </h2>
              <p className="text-xs font-medium text-amber-700">
                Ujian Akhir Sajak Tahun 5 · 10 Soalan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!finished ? (
          <div className="mt-4 space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Topik: {q.topic}</span>
                <span className="font-mono-num">
                  Soalan {idx + 1} / {total} · Skor: {score}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <p className="text-base font-bold text-slate-900 leading-snug">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSel = selected === optIdx;
                const isRight = optIdx === q.correctIndex;
                let style = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                if (answered) {
                  if (isRight) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (isSel) {
                    style = 'border-rose-400 bg-rose-50 text-rose-900';
                  }
                } else if (isSel) {
                  style = 'border-amber-500 bg-amber-50 text-amber-950 font-semibold';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(optIdx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors cursor-pointer ${style}`}
                  >
                    <span className="font-mono-num font-bold mr-2">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div
                className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
                  selected === q.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {selected === q.correctIndex ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {selected === q.correctIndex
                      ? 'Cemerlang! Jawapan kamu betul.'
                      : `Jawapan yang betul ialah ${String.fromCharCode(65 + q.correctIndex)}.`}
                  </p>
                  <p className="mt-0.5">{q.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              {!answered ? (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleCheck}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 text-sm font-bold cursor-pointer disabled:cursor-not-allowed"
                >
                  Semak Jawapan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
                >
                  {idx + 1 < total ? 'Soalan Seterusnya →' : 'Tamatkan Cabaran Puncak'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Cabaran Gunung Puisi Tamat!
            </h3>
            <p className="text-base text-slate-700">
              Markah akhir kamu:{' '}
              <strong className="font-mono-num text-amber-700 text-xl">
                {score} / {total}
              </strong>{' '}
              ({Math.round((score / total) * 100)}%)
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {score >= 8
                ? 'Hebat sekali! Kamu benar-benar menguasai ilmu sajak Bahasa Melayu Tahun 5.'
                : 'Usaha yang baik! Kamu boleh membuka Nota Sajak dan mencuba cabaran ini semula bila-bila masa.'}
            </p>
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
            >
              {alreadyCompleted
                ? 'Simpan Rekod Baharu'
                : `Terima Ganjaran Puncak (+${60 + score * 12} Syiling, +${120 + score * 25} Mata)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
