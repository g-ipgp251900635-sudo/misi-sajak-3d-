import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Crown,
  Gem,
  Headphones,
  Lock,
  Mountain,
  Trees,
  Waves,
  X,
} from 'lucide-react';
import { BADGES, ORIGINAL_SAJAK } from '../../data/sajakContent';
import { BadgeDef, GameProgress } from '../../types/game';

interface BadgesAndNotesModalProps {
  progress: GameProgress;
  initialTab?: 'badges' | 'notes';
  onClose: () => void;
}

const BadgeIcon: React.FC<{ name: BadgeDef['iconName']; className?: string }> = ({
  name,
  className,
}) => {
  switch (name) {
    case 'book':
      return <BookOpen className={className} />;
    case 'trees':
      return <Trees className={className} />;
    case 'waves':
      return <Waves className={className} />;
    case 'mountain':
      return <Mountain className={className} />;
    case 'gem':
      return <Gem className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'headphones':
      return <Headphones className={className} />;
  }
};

export const BadgesAndNotesModal: React.FC<BadgesAndNotesModalProps> = ({
  progress,
  initialTab = 'badges',
  onClose,
}) => {
  const [tab, setTab] = useState<'badges' | 'notes'>(initialTab);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900 max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-600" />
            <h2 className="font-display text-xl font-bold">Lencana &amp; Nota Sajak Tahun 5</h2>
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

        <div className="mt-4 flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('badges')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold cursor-pointer ${
              tab === 'badges'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lencana Pencapaian ({progress.unlockedBadges.length}/{BADGES.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('notes')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold cursor-pointer ${
              tab === 'notes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nota Ringkas &amp; Sajak Penuh
          </button>
        </div>

        {tab === 'badges' ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const unlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    unlocked
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{
                      backgroundColor: unlocked ? badge.color : '#94a3b8',
                    }}
                  >
                    {unlocked ? (
                      <BadgeIcon name={badge.iconName} className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {badge.description}
                    </p>
                    <p className="text-xs font-semibold mt-1.5 text-slate-700">
                      {unlocked ? 'Status: Diperoleh' : 'Status: Belum dibuka'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <h3 className="font-display font-bold text-emerald-950 text-base">
                1. Pengertian &amp; Ciri-Ciri Sajak
              </h3>
              <p>
                <strong>Sajak</strong> ialah puisi Melayu moden yang bebas bentuknya. Sajak tidak terikat kepada bilangan baris dalam serangkap, bilangan kata sebaris, atau rima akhir yang seragam.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
              <h3 className="font-display font-bold text-amber-950 text-base">
                2. Rangkap, Baris, Tema &amp; Persoalan
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Rangkap:</strong> Kumpulan baris yang membentuk satu unit pemikiran.</li>
                <li><strong>Baris:</strong> Deretan kata dalam sesuatu rangkap.</li>
                <li><strong>Tema:</strong> Idea utama yang mendasari keseluruhan sajak.</li>
                <li><strong>Persoalan:</strong> Perkara sampingan yang menyokong tema utama.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
              <h3 className="font-display font-bold text-sky-950 text-base">
                3. Teknik Deklamasi (Intonasi, Tekanan, Jeda)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Intonasi:</strong> Turun naik nada suara mengikut emosi (lembut, tegas, bersemangat).</li>
                <li><strong>Tekanan:</strong> Penegasan pada kata kunci penting untuk menonjolkan maksud.</li>
                <li><strong>Jeda:</strong> Hentian sejenak (<code>/</code>) di tengah baris dan hentian panjang (<code>//</code>) di hujung rangkap.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-display font-bold text-slate-900 text-base mb-2">
                Sajak Asli: &ldquo;{ORIGINAL_SAJAK.title}&rdquo;
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ORIGINAL_SAJAK.stanzas.map((st) => (
                  <div key={st.rangkap} className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-amber-700 mb-1">
                      Rangkap {st.rangkap}: {st.tajukKecil}
                    </p>
                    {st.lines.map((l, i) => (
                      <p key={i} className="text-xs text-slate-800 italic">
                        {l.raw}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
