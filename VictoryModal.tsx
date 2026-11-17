import React from 'react';
import { Award, Coins, Crown, Download, Gem, Sparkles, Star, X } from 'lucide-react';
import { BADGES, POETRY_GEMS } from '../../data/sajakContent';
import { GameProgress } from '../../types/game';

interface VictoryModalProps {
  progress: GameProgress;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ progress, onClose }) => {
  const pupilName = progress.profile?.name || 'Pengembara Puisi';
  const pupilKelas = progress.profile?.kelas || 'Tahun 5';

  const handleDownloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Certificate Background
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, 1200, 850);

    // Borders
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 18;
    ctx.strokeRect(28, 28, 1144, 794);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, 1100, 750);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('MISI SAJAK 3D: PENGEMBARAAN DUNIA PUISI', 600, 130);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('SIJIL PENGHARGAAN', 600, 210);

    ctx.fillStyle = '#475569';
    ctx.font = '26px sans-serif';
    ctx.fillText('Dengan ini diakui bahawa', 600, 290);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(pupilName.toUpperCase(), 600, 365);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`Kelas: ${pupilKelas}`, 600, 415);

    ctx.fillStyle = '#1e293b';
    ctx.font = '24px sans-serif';
    ctx.fillText(
      'telah berjaya menamatkan penerokaan di kesemua empat alam puisi',
      600,
      490,
    );
    ctx.fillText(
      '(Kampung Puisi, Hutan Makna, Tasik Irama dan Gunung Puisi)',
      600,
      530,
    );
    ctx.fillText(
      'serta menguasai kemahiran sajak Bahasa Melayu Tahun 5 dengan cemerlang.',
      600,
      570,
    );

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(
      `Mata: ${progress.points}   |   Syiling: ${progress.coins}   |   Permata: ${progress.collectedGems.length}/${POETRY_GEMS.length}   |   Skor Puncak: ${progress.gunungScore}/10`,
      600,
      650,
    );

    const today = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#64748b';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Tarikh Pencapaian: ${today}`, 600, 735);

    const link = document.createElement('a');
    link.download = `Sijil_Misi_Sajak_3D_${pupilName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-amber-400 p-6 sm:p-7 text-slate-900 max-h-[92vh] overflow-y-auto custom-scroll">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <Crown className="w-9 h-9" />
          </div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Pengembaraan Selesai!
          </p>
          <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
            Tahniah, {pupilName}!
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Kelas {pupilKelas} · Juara Sajak Bahasa Melayu Tahun 5
          </p>
        </div>

        {/* Performance Summary */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <Star className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="font-mono-num text-xl font-bold text-emerald-900">{progress.points}</p>
            <p className="text-xs text-emerald-800">Jumlah Mata</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <Coins className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="font-mono-num text-xl font-bold text-amber-900">{progress.coins}</p>
            <p className="text-xs text-amber-800">Syiling Puisi</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <Gem className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="font-mono-num text-xl font-bold text-purple-900">
              {progress.collectedGems.length}/{POETRY_GEMS.length}
            </p>
            <p className="text-xs text-purple-800">Permata Puisi</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
            <Award className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <p className="font-mono-num text-xl font-bold text-sky-900">
              {progress.gunungScore}/10
            </p>
            <p className="text-xs text-sky-800">Skor Gunung</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Pencapaian Lencana ({progress.unlockedBadges.length}/{BADGES.length})</span>
          </div>
          <p className="text-xs text-slate-600">
            Kamu telah menguasai definisi sajak, ciri-ciri sajak, rangkap dan baris, tema dan persoalan, maksud rangkap, serta teknik deklamasi intonasi, tekanan dan jeda!
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownloadCertificate}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Muat Turun Sijil (PNG)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
          >
            Terus Teroka Dunia 3D
          </button>
        </div>
      </div>
    </div>
  );
};
