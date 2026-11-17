import React, { useState } from 'react';
import { CheckCircle2, Coins, ScrollText, X, XCircle } from 'lucide-react';
import { soundEngine } from '../../game/audio';
import { FragmentItem } from '../../types/game';

interface FragmentQuizModalProps {
  fragment: FragmentItem;
  alreadyCompleted: boolean;
  onComplete: (fragmentId: string) => void;
  onClose: () => void;
}

export const FragmentQuizModal: React.FC<FragmentQuizModalProps> = ({
  fragment,
  alreadyCompleted,
  onComplete,
  onClose,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === fragment.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === fragment.correctIndex) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-amber-200 p-6 text-slate-900 max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">{fragment.title}</h2>
              <p className="text-xs font-medium text-emerald-700">
                Fokus: {fragment.focusConcept} · Hutan Makna
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

        {/* Original Poem Stanza Display */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-2">
            <span>Sajak Asli: &ldquo;Permata di Taman Ilmu&rdquo;</span>
            <span>Rangkap {fragment.rangkapNumber}</span>
          </div>
          <div className="space-y-1.5 pl-2">
            {fragment.stanzaLines.map((line, i) => (
              <p key={i} className="text-base font-medium text-slate-900 italic">
                <span className="font-mono-num text-xs text-amber-700 not-italic mr-2">
                  Baris {i + 1}:
                </span>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="mt-5">
          <p className="text-sm font-bold text-slate-900 mb-2.5">{fragment.question}</p>
          <div className="space-y-2">
            {fragment.options.map((opt, idx) => {
              const isThisSelected = selected === idx;
              const isThisCorrect = idx === fragment.correctIndex;
              let style = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
              if (submitted) {
                if (isThisCorrect) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                } else if (isThisSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900';
                }
              } else if (isThisSelected) {
                style = 'border-sky-500 bg-sky-50 text-sky-950 font-semibold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={submitted && isCorrect}
                  onClick={() => {
                    setSelected(idx);
                    if (submitted && !isCorrect) setSubmitted(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors cursor-pointer ${style}`}
                >
                  <span className="font-mono-num font-bold mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {submitted && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {isCorrect ? 'Syabas! Jawapan Betul!' : 'Kurang Tepat, Cuba Lagi!'}
              </p>
              <p className="mt-0.5">
                {isCorrect
                  ? fragment.explanation
                  : 'Teliti semula rangkap sajak di atas dan pilih jawapan yang paling sesuai.'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {!submitted || !isCorrect ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold cursor-pointer disabled:cursor-not-allowed"
            >
              Hantar Jawapan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(fragment.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>
                {alreadyCompleted ? 'Tutup Skrol' : 'Simpan Serpihan (+40 Syiling, +60 Mata)'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
