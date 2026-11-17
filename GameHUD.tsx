import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Coins,
  Compass,
  Gamepad2,
  Gem,
  Home,
  Music,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AREAS,
  BADGES,
  HUTAN_FRAGMENTS,
  KAMPUNG_BOOKS,
  POETRY_GEMS,
} from '../data/sajakContent';
import {
  AreaId,
  GameProgress,
  InteractableTarget,
  MinimapMarker,
  PlayerTelemetry,
  ToastNotification,
} from '../types/game';
import { Minimap } from './Minimap';

interface GameHUDProps {
  progress: GameProgress;
  telemetry: PlayerTelemetry;
  markers: MinimapMarker[];
  nearestTarget: InteractableTarget | null;
  muted: boolean;
  bgmEnabled: boolean;
  bgmVolume: number;
  showTouchControls: boolean;
  toasts: ToastNotification[];
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onChangeBgmVolume: (volume: number) => void;
  onToggleTouchControls: () => void;
  onInteract: () => void;
  onTeleport: (area: AreaId) => void;
  onResetCamera: () => void;
  onOpenBadges: () => void;
  onOpenNotes: () => void;
  onOpenMenu: () => void;
  onOpenVictory: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  progress,
  telemetry,
  markers,
  nearestTarget,
  muted,
  bgmEnabled,
  bgmVolume,
  showTouchControls,
  toasts,
  onToggleMute,
  onToggleBgm,
  onChangeBgmVolume,
  onToggleTouchControls,
  onInteract,
  onTeleport,
  onResetCamera,
  onOpenBadges,
  onOpenNotes,
  onOpenMenu,
  onOpenVictory,
}) => {
  const [questExpanded, setQuestExpanded] = useState(true);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [bgmPanelOpen, setBgmPanelOpen] = useState(false);

  const areaInfo = AREAS[telemetry.currentArea];

  // Calculate overall mission progress across all 4 areas + Dengarkan Sajak
  const totalSteps =
    KAMPUNG_BOOKS.length + HUTAN_FRAGMENTS.length + 1 + 1 + 1; // 3 + 4 + 1 (Irama) + 1 (Dengarkan Sajak) + 1 (Gunung) = 10
  const doneSteps =
    progress.collectedBooks.length +
    progress.completedFragments.length +
    (progress.completedIrama ? 1 : 0) +
    (progress.completedDengarkanSajak ? 1 : 0) +
    (progress.completedGunung ? 1 : 0);
  const overallPct = Math.round((doneSteps / totalSteps) * 100);

  const allCompleted =
    progress.collectedBooks.length >= KAMPUNG_BOOKS.length &&
    progress.completedFragments.length >= HUTAN_FRAGMENTS.length &&
    progress.completedIrama &&
    progress.completedDengarkanSajak &&
    progress.completedGunung;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Top-Left: Area, Progress Bar & Collapsible Quest Tracker */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-72 max-w-[calc(100vw-180px)] pointer-events-auto space-y-2">
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3 text-white shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-amber-300 font-semibold">
                Kawasan {areaInfo.order}/4
              </p>
              <h2 className="font-display text-base sm:text-lg font-bold leading-tight">
                {areaInfo.name}
              </h2>
            </div>
            <span className="font-mono-num text-sm font-bold text-emerald-300">
              {overallPct}%
            </span>
          </div>

          <div className="mt-2 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate">
              {progress.profile?.name} · {progress.profile?.kelas}
            </span>
            <button
              type="button"
              onClick={() => setQuestExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-amber-300 font-semibold hover:text-amber-200 cursor-pointer shrink-0"
            >
              <span>Misi</span>
              {questExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {questExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {progress.collectedBooks.length >= 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>1. Kampung: Kumpul Buku</span>
                </span>
                <span className="font-mono-num text-slate-300">
                  {progress.collectedBooks.length}/3
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {progress.completedFragments.length >= 4 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>2. Hutan: Serpihan Puisi</span>
                </span>
                <span className="font-mono-num text-slate-300">
                  {progress.completedFragments.length}/4
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {progress.completedIrama ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>3a. Tasik: Makmal Irama</span>
                </span>
                <span className="font-mono-num text-slate-300">
                  {progress.completedIrama ? 'Selesai' : '0/1'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {progress.completedDengarkanSajak ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>3b. Tasik: Dengarkan Sajak</span>
                </span>
                <span className="font-mono-num text-slate-300">
                  {progress.completedDengarkanSajak
                    ? `${progress.dengarkanSajakScore}/5`
                    : progress.watchedDengarkanVideo
                      ? 'Video OK'
                      : '0/1'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  {progress.completedGunung ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>4. Gunung: 10 Soalan</span>
                </span>
                <span className="font-mono-num text-slate-300">
                  {progress.completedGunung ? `${progress.gunungScore}/10` : '0/1'}
                </span>
              </div>
            </div>
          )}
        </div>

        {allCompleted && (
          <button
            type="button"
            onClick={onOpenVictory}
            className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
          >
            Lihat Sijil &amp; Ringkasan Tahniah
          </button>
        )}
      </div>

      {/* Top-Right: Counters, Minimap & Utility Actions */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Economy & Score Strip */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl px-3 py-2 text-white shadow-xl flex items-center gap-3 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-1 text-amber-300" title="Syiling">
            <Coins className="w-4 h-4" />
            <span className="font-mono-num">{progress.coins}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">|</span>
          <div className="flex items-center gap-1 text-emerald-300" title="Mata">
            <Star className="w-4 h-4" />
            <span className="font-mono-num">{progress.points}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">|</span>
          <div className="flex items-center gap-1 text-purple-300" title="Permata Puisi">
            <Gem className="w-4 h-4" />
            <span className="font-mono-num">
              {progress.collectedGems.length}/{POETRY_GEMS.length}
            </span>
          </div>
        </div>

        {/* Minimap */}
        <div className="hidden sm:block">
          <Minimap telemetry={telemetry} markers={markers} />
        </div>

        {/* Utility Action Row */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNotes}
            title="Nota Sajak"
            className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-sky-300" />
            <span className="hidden md:inline">Nota</span>
          </button>

          <button
            type="button"
            onClick={onOpenBadges}
            title="Lencana Pencapaian"
            className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span className="font-mono-num">
              {progress.unlockedBadges.length}/{BADGES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBgmPanelOpen((v) => !v)}
            title="Muzik Latar (Canggung)"
            aria-label="Tetapan Muzik Latar"
            className={`px-2.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg cursor-pointer ${
              bgmEnabled && !muted
                ? 'bg-slate-900/90 hover:bg-slate-800 border-emerald-500/70 text-emerald-300'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden md:inline">{bgmEnabled ? 'Muzik ON' : 'Muzik OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? 'Hidupkan Semua Audio' : 'Senyapkan Semua Audio'}
            aria-label={muted ? 'Hidupkan Semua Audio' : 'Senyapkan Semua Audio'}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white shadow-lg cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            title="Menu Utama"
            aria-label="Menu Utama"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white shadow-lg cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-200" />
          </button>
        </div>

        {/* Compact Music ON/OFF & Volume Popover */}
        {bgmPanelOpen && (
          <div className="w-60 bg-slate-900/95 border border-slate-700 rounded-2xl p-3 text-white shadow-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-amber-300 truncate">
                Muzik: Canggung
              </span>
              <button
                type="button"
                onClick={onToggleBgm}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                  bgmEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {bgmEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={bgmVolume}
                onChange={(e) => onChangeBgmVolume(parseFloat(e.target.value))}
                aria-label="Kelantangan Muzik Latar"
                className="flex-1 accent-emerald-400 cursor-pointer"
              />
              <span className="font-mono-num text-slate-300 w-8 text-right">
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top-Center Quest & Badge Notifications */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-sm px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-full rounded-xl px-4 py-2.5 shadow-2xl border text-center ${
              t.tone === 'badge'
                ? 'bg-amber-400 border-amber-200 text-slate-950'
                : t.tone === 'success'
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            <p className="font-display text-sm font-bold">{t.title}</p>
            <p className="text-xs opacity-90">{t.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Bottom-Center Interaction Prompt + Collapsible Dock */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto transition-all ${
          showTouchControls ? 'bottom-36 sm:bottom-5' : 'bottom-4'
        }`}
      >
        {nearestTarget && (
          <button
            type="button"
            onClick={onInteract}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-sm shadow-2xl border-2 border-white flex items-center gap-2 cursor-pointer"
          >
            <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 font-mono-num text-xs">
              E
            </span>
            <span>{nearestTarget.label}</span>
          </button>
        )}

        {/* Collapsible Quick Navigation & Controls Dock */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockExpanded((v) => !v)}
            className="px-3 py-1 rounded-t-xl bg-slate-900/90 border border-b-0 border-slate-700 text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>{dockExpanded ? 'Sembunyi Peta Pantas' : 'Peta Pantas & Kawalan'}</span>
          </button>

          {dockExpanded && (
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl px-2.5 py-2 shadow-xl flex flex-wrap items-center justify-center gap-1.5 max-w-[94vw]">
              {(['kampung', 'hutan', 'tasik', 'gunung'] as AreaId[]).map((id) => {
                const a = AREAS[id];
                const active = telemetry.currentArea === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onTeleport(id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {a.order}. {a.name}
                  </button>
                );
              })}

              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>

              <button
                type="button"
                onClick={onResetCamera}
                title="Tetapkan Semula Kamera (R)"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kamera</span>
              </button>

              <button
                type="button"
                onClick={onToggleTouchControls}
                title="Togol Kawalan Sentuh"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  showTouchControls
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sentuh</span>
              </button>
            </div>
          )}
        </div>

        {!showTouchControls && (
          <p className="hidden md:block text-xs text-white/85 bg-slate-950/65 px-3 py-1 rounded-lg">
            WASD / Anak Panah: Gerak · Seret Tetikus: Kamera · Space: Lompat · E: Interaksi
          </p>
        )}
      </div>
    </div>
  );
};
