import React, { useState } from 'react';
import { BookOpen, Compass, HelpCircle, Play, RotateCcw, Target, X } from 'lucide-react';
import { BADGES } from '../data/sajakContent';
import { GameProgress, PlayerProfile } from '../types/game';

interface MainMenuProps {
  progress: GameProgress;
  onStart: (profile: PlayerProfile) => void;
  onResetProgress: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStart,
  onResetProgress,
}) => {
  const [name, setName] = useState(progress.profile?.name ?? '');
  const [kelas, setKelas] = useState(progress.profile?.kelas ?? '5 Bestari');
  const [error, setError] = useState('');
  const [activeInfo, setActiveInfo] = useState<'how' | 'objectives' | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const hasSavedProgress =
    Boolean(progress.profile) &&
    (progress.collectedBooks.length > 0 ||
      progress.completedFragments.length > 0 ||
      progress.completedIrama ||
      progress.completedDengarkanSajak ||
      progress.watchedDengarkanVideo ||
      progress.completedGunung ||
      progress.collectedGems.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedKelas = kelas.trim();
    if (!trimmedName) {
      setError('Sila masukkan nama kamu dahulu sebelum memulakan pengembaraan.');
      return;
    }
    if (!trimmedKelas) {
      setError('Sila masukkan nama kelas kamu (contoh: 5 Bestari).');
      return;
    }
    setError('');
    onStart({ name: trimmedName, kelas: trimmedKelas });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-gradient-to-b from-slate-950/65 via-slate-900/45 to-slate-950/75 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-2xl border border-amber-200/80 p-6 sm:p-8 text-slate-900">
        {/* Title Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide mb-2">
            <Compass className="w-4 h-4" />
            <span>Bahasa Melayu Tahun 5</span>
            <span aria-hidden="true">·</span>
            <span>Dunia Sajak Interaktif 3D</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            MISI SAJAK 3D
          </h1>
          <p className="font-display text-lg sm:text-xl font-medium text-amber-700 mt-1">
            Pengembaraan Dunia Puisi
          </p>
        </div>

        {/* Pupil Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pupil-name"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Nama Murid
              </label>
              <input
                id="pupil-name"
                type="text"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aiman Hakim"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="pupil-class"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Kelas
              </label>
              <input
                id="pupil-class"
                type="text"
                maxLength={24}
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: 5 Bestari"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {hasSavedProgress && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-900">
              <div>
                <span className="font-semibold">Rekod Tersimpan:</span>{' '}
                <span className="font-mono-num">{progress.points}</span> Mata ·{' '}
                <span className="font-mono-num">{progress.coins}</span> Syiling ·{' '}
                <span className="font-mono-num">
                  {progress.unlockedBadges.length}/{BADGES.length}
                </span>{' '}
                Lencana
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Mula Baharu
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    Sahkan Padam
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary Start CTA */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display text-xl font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{hasSavedProgress ? 'Sambung Pengembaraan' : 'Mula Permainan'}</span>
          </button>
        </form>

        {/* Secondary Info Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => setActiveInfo('how')}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Cara Bermain</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveInfo('objectives')}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Target className="w-4 h-4 text-amber-600" />
            <span>Objektif Pembelajaran</span>
          </button>
        </div>

        {/* Clean 4-Area Preview Strip */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="font-semibold text-emerald-700">1. Kampung Puisi</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-green-700">2. Hutan Makna</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-sky-700">3. Tasik Irama</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-amber-700">4. Gunung Puisi</span>
        </div>
      </div>

      {/* Sub-modal: Cara Bermain / Objektif Pembelajaran */}
      {activeInfo && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900 max-h-[85vh] overflow-y-auto custom-scroll">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {activeInfo === 'how' ? (
                  <HelpCircle className="w-5 h-5 text-sky-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-amber-600" />
                )}
                <h2 className="font-display text-xl font-bold">
                  {activeInfo === 'how' ? 'Cara Bermain Misi Sajak 3D' : 'Objektif Pembelajaran (Tahun 5)'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfo(null)}
                aria-label="Tutup"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeInfo === 'how' ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                  <p className="font-bold text-sky-900 mb-1">Kawalan Komputer / Riba:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>W, A, S, D</strong> atau <strong>Kekunci Anak Panah</strong> untuk bergerak.</li>
                    <li><strong>Seret Tetikus</strong> di skrin untuk memusingkan kamera.</li>
                    <li><strong>Spacebar</strong> untuk melompat.</li>
                    <li><strong>Kekunci E</strong> (atau klik butang interaksi) untuk berbual dengan guru dan mengumpul buku/skrol.</li>
                  </ul>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="font-bold text-emerald-900 mb-1">Kawalan Telefon / Tablet:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gunakan <strong>Kayu Ria (Joystick)</strong> di kiri bawah untuk berjalan.</li>
                    <li>Seret sebelah kanan skrin untuk melihat sekeliling.</li>
                    <li>Tekan butang <strong>Lompat</strong> dan <strong>Interaksi</strong> di kanan bawah.</li>
                  </ul>
                </div>
                <p>
                  Seberangi jambatan kayu untuk meneroka keempat-empat kawasan, kumpul semua <strong>Permata Puisi</strong>, dan selesaikan setiap tugasan untuk memperoleh kesemua {BADGES.length} Lencana Pencapaian!
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
                <p className="font-medium text-slate-800">
                  Pada akhir pengembaraan ini, murid Tahun 5 akan dapat:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Mengenal Definisi &amp; Ciri Sajak:</strong> Memahami sajak sebagai puisi moden yang bebas bentuk dan rima berbanding pantun atau syair.
                  </li>
                  <li>
                    <strong>Mengenal Pasti Struktur &amp; Makna:</strong> Membezakan rangkap dan baris serta menentukan tema, persoalan, dan maksud rangkap sajak.
                  </li>
                  <li>
                    <strong>Mengaplikasi Teknik Deklamasi:</strong> Menggunakan intonasi, tekanan suara, jeda (<code>/</code> dan <code>//</code>), serta mimik muka yang sesuai.
                  </li>
                  <li>
                    <strong>Menghargai Seni Puisi:</strong> Menghayati nilai murni dan pengajaran dalam sajak Bahasa Melayu dengan penuh keyakinan.
                  </li>
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveInfo(null)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm cursor-pointer"
            >
              Faham, Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
