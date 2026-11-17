import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { MobileControls } from './components/MobileControls';
import { BadgesAndNotesModal } from './components/modals/BadgesAndNotesModal';
import { BookLearnModal } from './components/modals/BookLearnModal';
import { DengarkanSajakModal } from './components/modals/DengarkanSajakModal';
import { DialogueModal } from './components/modals/DialogueModal';
import { FragmentQuizModal } from './components/modals/FragmentQuizModal';
import { GunungQuizModal } from './components/modals/GunungQuizModal';
import { IramaStudioModal } from './components/modals/IramaStudioModal';
import { VictoryModal } from './components/modals/VictoryModal';
import {
  AREAS,
  BADGES,
  HUTAN_FRAGMENTS,
  KAMPUNG_BOOKS,
  NPC_DIALOGUES,
} from './data/sajakContent';
import { soundEngine } from './game/audio';
import { GameEngine } from './game/GameEngine';
import {
  AreaId,
  GameProgress,
  InteractableTarget,
  MinimapMarker,
  PlayerProfile,
  PlayerTelemetry,
  ToastNotification,
} from './types/game';
import { clearProgress, loadProgress, saveProgress } from './utils/storage';

type ActiveModal =
  | { type: 'npc'; id: string }
  | { type: 'book'; id: string }
  | { type: 'fragment'; id: string }
  | { type: 'irama' }
  | { type: 'dengarkan_sajak' }
  | { type: 'gunung' }
  | { type: 'badges'; tab: 'badges' | 'notes' }
  | { type: 'victory' }
  | null;

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [telemetry, setTelemetry] = useState<PlayerTelemetry>({
    x: 0,
    y: 0.35,
    z: 12,
    yaw: Math.PI,
    currentArea: 'kampung',
  });
  const [markers, setMarkers] = useState<MinimapMarker[]>([]);
  const [nearestTarget, setNearestTarget] = useState<InteractableTarget | null>(null);
  const [muted, setMuted] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(() => soundEngine.isBgmEnabled());
  const [bgmVolume, setBgmVolume] = useState(() => soundEngine.getBgmVolume());
  const [contextLost, setContextLost] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  const pushToast = useCallback(
    (title: string, subtitle: string, tone: ToastNotification['tone'] = 'info') => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, subtitle, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    [],
  );

  const applyProgressUpdate = useCallback(
    (updater: (prev: GameProgress) => GameProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        const newlyUnlocked: string[] = [];
        const badges = new Set(next.unlockedBadges);

        const tryUnlock = (id: string, condition: boolean) => {
          if (condition && !badges.has(id)) {
            badges.add(id);
            newlyUnlocked.push(id);
          }
        };

        tryUnlock('badge_kampung', next.collectedBooks.length >= KAMPUNG_BOOKS.length);
        tryUnlock('badge_hutan', next.completedFragments.length >= HUTAN_FRAGMENTS.length);
        tryUnlock('badge_tasik', next.completedIrama);
        tryUnlock('badge_dengarkan', next.completedDengarkanSajak);
        tryUnlock('badge_gunung', next.completedGunung);
        tryUnlock('badge_permata', next.collectedGems.length >= 8);

        const allAreasDone =
          next.collectedBooks.length >= KAMPUNG_BOOKS.length &&
          next.completedFragments.length >= HUTAN_FRAGMENTS.length &&
          next.completedIrama &&
          next.completedDengarkanSajak &&
          next.completedGunung;
        tryUnlock('badge_juara', allAreasDone);

        const finalProgress: GameProgress = {
          ...next,
          unlockedBadges: Array.from(badges),
        };
        saveProgress(finalProgress);
        engineRef.current?.syncProgress(finalProgress);

        if (newlyUnlocked.length > 0) {
          soundEngine.playQuestComplete();
          newlyUnlocked.forEach((bId) => {
            const def = BADGES.find((b) => b.id === bId);
            if (def) {
              pushToast(`Lencana Dibuka: ${def.title}`, def.description, 'badge');
            }
          });
        }

        return finalProgress;
      });
    },
    [pushToast],
  );

  // Refs for engine callbacks so engine never re-mounts
  const handleInteractRef = useRef<(target: InteractableTarget) => void>(() => {});
  const handleCollectGemRef = useRef<(gemId: string) => void>(() => {});

  handleInteractRef.current = (target: InteractableTarget) => {
    if (target.type === 'npc') {
      setActiveModal({ type: 'npc', id: target.id });
    } else if (target.type === 'book') {
      setActiveModal({ type: 'book', id: target.id });
    } else if (target.type === 'fragment') {
      setActiveModal({ type: 'fragment', id: target.id });
    } else if (target.type === 'irama') {
      setActiveModal({ type: 'irama' });
    } else if (target.type === 'dengarkan_sajak') {
      setActiveModal({ type: 'dengarkan_sajak' });
    } else if (target.type === 'gunung') {
      setActiveModal({ type: 'gunung' });
    }
  };

  handleCollectGemRef.current = (gemId: string) => {
    applyProgressUpdate((prev) => {
      if (prev.collectedGems.includes(gemId)) return prev;
      pushToast('Permata Puisi Ditemui!', '+15 Syiling · +25 Mata', 'success');
      return {
        ...prev,
        coins: prev.coins + 15,
        points: prev.points + 25,
        collectedGems: [...prev.collectedGems, gemId],
      };
    });
  };

  // Mount Three.js GameEngine once
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const engine = new GameEngine(mount, {
      onTelemetry: (t) => setTelemetry(t),
      onNearestTarget: (target) => setNearestTarget(target),
      onInteract: (target) => handleInteractRef.current(target),
      onCollectGem: (gemId) => handleCollectGemRef.current(gemId),
      onMarkersUpdate: (m) => setMarkers(m),
      onContextLost: (lost) => setContextLost(lost),
    });

    engine.syncProgress(loadProgress());
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync engine mode and menu music state whenever screen or modal changes
  useEffect(() => {
    if (!engineRef.current) return;
    if (screen === 'menu') {
      engineRef.current.setMode('menu');
      soundEngine.pauseBgmFor('menu');
    } else if (activeModal !== null) {
      engineRef.current.setMode('paused');
      soundEngine.resumeBgmFor('menu');
    } else {
      engineRef.current.setMode('playing');
      soundEngine.resumeBgmFor('menu');
    }
  }, [screen, activeModal]);

  // Lower BGM while important NPC dialogue is open; restore afterwards
  useEffect(() => {
    if (screen === 'playing' && activeModal?.type === 'npc') {
      soundEngine.duckBgmFor('dialogue');
    } else {
      soundEngine.unduckBgmFor('dialogue');
    }
  }, [screen, activeModal]);

  const handleStartGame = (profile: PlayerProfile) => {
    applyProgressUpdate((prev) => ({ ...prev, profile }));
    setScreen('playing');
    soundEngine.startBgm();
    // Greet first-time pupil with Cikgu Aminah tutorial dialogue
    if (!progress.talkedNpcs.includes('cikgu_aminah')) {
      setActiveModal({ type: 'npc', id: 'cikgu_aminah' });
    }
  };

  const handleResetProgress = () => {
    const fresh = clearProgress();
    setProgress(fresh);
    engineRef.current?.syncProgress(fresh);
    engineRef.current?.teleportToArea('kampung');
    pushToast('Kemajuan Ditetapkan Semula', 'Sedia untuk pengembaraan baharu!', 'info');
  };

  const handleCompleteBook = (bookId: string) => {
    const already = progress.collectedBooks.includes(bookId);
    if (!already) {
      soundEngine.playCoin();
      applyProgressUpdate((prev) => {
        if (prev.collectedBooks.includes(bookId)) return prev;
        const nextBooks = [...prev.collectedBooks, bookId];
        if (nextBooks.length >= KAMPUNG_BOOKS.length) {
          pushToast(
            'Misi Kampung Puisi Selesai!',
            'Seberangi jambatan timur ke Hutan Makna.',
            'success',
          );
        } else {
          pushToast(
            `Buku Dikumpul (${nextBooks.length}/${KAMPUNG_BOOKS.length})`,
            '+30 Syiling · +50 Mata',
            'success',
          );
        }
        return {
          ...prev,
          coins: prev.coins + 30,
          points: prev.points + 50,
          collectedBooks: nextBooks,
        };
      });
    }
    setActiveModal(null);
  };

  const handleCompleteFragment = (fragId: string) => {
    const already = progress.completedFragments.includes(fragId);
    if (!already) {
      soundEngine.playCoin();
      applyProgressUpdate((prev) => {
        if (prev.completedFragments.includes(fragId)) return prev;
        const nextFrags = [...prev.completedFragments, fragId];
        if (nextFrags.length >= HUTAN_FRAGMENTS.length) {
          pushToast(
            'Misi Hutan Makna Selesai!',
            'Pergi ke utara menuju Tasik Irama!',
            'success',
          );
        } else {
          pushToast(
            `Serpihan Disimpan (${nextFrags.length}/${HUTAN_FRAGMENTS.length})`,
            '+40 Syiling · +60 Mata',
            'success',
          );
        }
        return {
          ...prev,
          coins: prev.coins + 40,
          points: prev.points + 60,
          completedFragments: nextFrags,
        };
      });
    }
    setActiveModal(null);
  };

  const handleCompleteIrama = (score: number) => {
    const already = progress.completedIrama;
    if (!already) {
      const coinBonus = 40 + score * 15;
      const pointBonus = 80 + score * 20;
      applyProgressUpdate((prev) => ({
        ...prev,
        coins: prev.coins + coinBonus,
        points: prev.points + pointBonus,
        completedIrama: true,
        iramaScore: Math.max(prev.iramaScore, score),
      }));
      pushToast(
        'Misi Tasik Irama Selesai!',
        `+${coinBonus} Syiling · +${pointBonus} Mata. Kini daki Gunung Puisi di barat!`,
        'success',
      );
    } else {
      applyProgressUpdate((prev) => ({
        ...prev,
        iramaScore: Math.max(prev.iramaScore, score),
      }));
    }
    setActiveModal(null);
  };

  const handleDengarkanVideoFinished = () => {
    applyProgressUpdate((prev) => {
      if (prev.watchedDengarkanVideo) return prev;
      return {
        ...prev,
        watchedDengarkanVideo: true,
      };
    });
  };

  const handleCompleteDengarkanSajak = (score: number) => {
    const already = progress.completedDengarkanSajak;
    if (!already) {
      const coinBonus = 50 + score * 15;
      const pointBonus = 90 + score * 20;
      applyProgressUpdate((prev) => ({
        ...prev,
        coins: prev.coins + coinBonus,
        points: prev.points + pointBonus,
        watchedDengarkanVideo: true,
        completedDengarkanSajak: true,
        dengarkanSajakScore: Math.max(prev.dengarkanSajakScore, score),
      }));
      pushToast(
        'Misi Dengarkan Sajak Selesai!',
        `+${coinBonus} Syiling · +${pointBonus} Mata. Hebat menghayati sajak!`,
        'success',
      );
    } else {
      applyProgressUpdate((prev) => ({
        ...prev,
        watchedDengarkanVideo: true,
        dengarkanSajakScore: Math.max(prev.dengarkanSajakScore, score),
      }));
    }
    setActiveModal(null);
  };

  const handleCompleteGunung = (score: number) => {
    const already = progress.completedGunung;
    let willShowVictory = false;

    applyProgressUpdate((prev) => {
      const coinBonus = already ? 0 : 60 + score * 12;
      const pointBonus = already ? 0 : 120 + score * 25;
      const next: GameProgress = {
        ...prev,
        coins: prev.coins + coinBonus,
        points: prev.points + pointBonus,
        completedGunung: true,
        gunungScore: Math.max(prev.gunungScore, score),
      };
      willShowVictory =
        next.collectedBooks.length >= KAMPUNG_BOOKS.length &&
        next.completedFragments.length >= HUTAN_FRAGMENTS.length &&
        next.completedIrama &&
        next.completedDengarkanSajak &&
        next.completedGunung;
      return next;
    });

    if (
      willShowVictory ||
      (progress.collectedBooks.length >= KAMPUNG_BOOKS.length &&
        progress.completedFragments.length >= HUTAN_FRAGMENTS.length &&
        progress.completedIrama &&
        progress.completedDengarkanSajak)
    ) {
      setActiveModal({ type: 'victory' });
    } else {
      pushToast(
        'Cabaran Gunung Puisi Selesai!',
        'Selesaikan kawasan dan misi lain yang belum tamat untuk membuka Sijil Juara!',
        'info',
      );
      setActiveModal(null);
    }
  };

  const handleTeleport = (areaId: AreaId) => {
    engineRef.current?.teleportToArea(areaId);
    pushToast(`Tiba di ${AREAS[areaId].name}`, AREAS[areaId].subtitle, 'info');
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    soundEngine.setBgmEnabled(next);
  };

  const handleChangeBgmVolume = (vol: number) => {
    setBgmVolume(vol);
    soundEngine.setBgmVolume(vol);
  };

  // Determine modal entity
  const currentNpc =
    activeModal?.type === 'npc' ? NPC_DIALOGUES[activeModal.id] : null;
  const currentBook =
    activeModal?.type === 'book'
      ? KAMPUNG_BOOKS.find((b) => b.id === activeModal.id) ?? null
      : null;
  const currentFragment =
    activeModal?.type === 'fragment'
      ? HUTAN_FRAGMENTS.find((f) => f.id === activeModal.id) ?? null
      : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-sky-200">
      {/* Dedicated isolated 3D WebGL Canvas container */}
      <div ref={canvasMountRef} className="fixed inset-0 z-0" />

      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 text-white p-6 text-center">
          <div className="max-w-md space-y-3">
            <h2 className="font-display text-2xl font-bold">Paparan 3D Terhenti Sebentar</h2>
            <p className="text-sm text-slate-300">
              Sila tunggu sebentar atau muat semula halaman jika paparan 3D tidak pulih secara automatik.
            </p>
          </div>
        </div>
      )}

      {screen === 'menu' && (
        <MainMenu
          progress={progress}
          onStart={handleStartGame}
          onResetProgress={handleResetProgress}
        />
      )}

      {screen === 'playing' && (
        <>
          <GameHUD
            progress={progress}
            telemetry={telemetry}
            markers={markers}
            nearestTarget={nearestTarget}
            muted={muted}
            bgmEnabled={bgmEnabled}
            bgmVolume={bgmVolume}
            showTouchControls={showTouchControls}
            toasts={toasts}
            onToggleMute={handleToggleMute}
            onToggleBgm={handleToggleBgm}
            onChangeBgmVolume={handleChangeBgmVolume}
            onToggleTouchControls={() => setShowTouchControls((v) => !v)}
            onInteract={() => engineRef.current?.triggerInteract()}
            onTeleport={handleTeleport}
            onResetCamera={() => engineRef.current?.resetCamera()}
            onOpenBadges={() => setActiveModal({ type: 'badges', tab: 'badges' })}
            onOpenNotes={() => setActiveModal({ type: 'badges', tab: 'notes' })}
            onOpenMenu={() => {
              setActiveModal(null);
              setScreen('menu');
            }}
            onOpenVictory={() => setActiveModal({ type: 'victory' })}
          />

          {showTouchControls && activeModal === null && (
            <MobileControls
              onMove={(x, y) => engineRef.current?.setJoystick(x, y)}
              onJump={() => engineRef.current?.triggerJump()}
              onInteract={() => engineRef.current?.triggerInteract()}
              canInteract={nearestTarget !== null}
            />
          )}
        </>
      )}

      {/* Educational Modals */}
      {currentNpc && (
        <DialogueModal
          npc={currentNpc}
          onClose={() => {
            applyProgressUpdate((prev) =>
              prev.talkedNpcs.includes(currentNpc.id)
                ? prev
                : { ...prev, talkedNpcs: [...prev.talkedNpcs, currentNpc.id] },
            );
            setActiveModal(null);
          }}
          onAction={() => {
            applyProgressUpdate((prev) =>
              prev.talkedNpcs.includes(currentNpc.id)
                ? prev
                : { ...prev, talkedNpcs: [...prev.talkedNpcs, currentNpc.id] },
            );
            if (currentNpc.id === 'puan_melati') {
              setActiveModal({ type: 'irama' });
            } else if (currentNpc.id === 'penjaga_sajak') {
              setActiveModal({ type: 'dengarkan_sajak' });
            } else if (currentNpc.id === 'tok_pendeta') {
              setActiveModal({ type: 'gunung' });
            } else {
              setActiveModal(null);
            }
          }}
        />
      )}

      {currentBook && (
        <BookLearnModal
          book={currentBook}
          alreadyCollected={progress.collectedBooks.includes(currentBook.id)}
          onComplete={handleCompleteBook}
          onClose={() => setActiveModal(null)}
        />
      )}

      {currentFragment && (
        <FragmentQuizModal
          fragment={currentFragment}
          alreadyCompleted={progress.completedFragments.includes(currentFragment.id)}
          onComplete={handleCompleteFragment}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'irama' && (
        <IramaStudioModal
          alreadyCompleted={progress.completedIrama}
          onComplete={handleCompleteIrama}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'dengarkan_sajak' && (
        <DengarkanSajakModal
          alreadyWatchedVideo={progress.watchedDengarkanVideo}
          alreadyCompletedQuiz={progress.completedDengarkanSajak}
          onVideoFinished={handleDengarkanVideoFinished}
          onCompleteQuiz={handleCompleteDengarkanSajak}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'gunung' && (
        <GunungQuizModal
          alreadyCompleted={progress.completedGunung}
          onComplete={handleCompleteGunung}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'badges' && (
        <BadgesAndNotesModal
          progress={progress}
          initialTab={activeModal.tab}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'victory' && (
        <VictoryModal
          progress={progress}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
