import React, { useState } from 'react';
import { ChevronRight, MessageSquare, X } from 'lucide-react';
import { NpcDialogueData } from '../../types/game';

interface DialogueModalProps {
  npc: NpcDialogueData;
  onClose: () => void;
  onAction?: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  onClose,
  onAction,
}) => {
  const [step, setStep] = useState(0);
  const isLast = step >= npc.lines.length - 1;

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 bg-slate-950/60">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-amber-300 p-6 text-slate-900">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">{npc.name}</h3>
              <p className="text-xs font-medium text-slate-500">{npc.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 min-h-[104px] flex items-center">
          <p className="text-base text-slate-800 leading-relaxed">{npc.lines[step]}</p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-mono-num text-slate-500">
            Mesej {step + 1} / {npc.lines.length}
          </span>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Kembali
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Seterusnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onAction) onAction();
                  else onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{npc.actionLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
