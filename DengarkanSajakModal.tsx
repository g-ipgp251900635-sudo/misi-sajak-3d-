import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Headphones,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from 'lucide-react';
import { DENGARKAN_QUESTIONS } from '../../data/sajakContent';
import { soundEngine } from '../../game/audio';

const VIDEO_SRC = './assets/aistudio/video_sajak_2_5840e8a1.mp4';

interface DengarkanSajakModalProps {
  alreadyWatchedVideo: boolean;
  alreadyCompletedQuiz: boolean;
  onVideoFinished: () => void;
  onCompleteQuiz: (score: number) => void;
  onClose: () => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const DengarkanSajakModal: React.FC<DengarkanSajakModalProps> = ({
  alreadyWatchedVideo,
  alreadyCompletedQuiz,
  onVideoFinished,
  onCompleteQuiz,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maxWatchedRef = useRef<number>(0);

  const [step, setStep] = useState<'video' | 'quiz'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoWatched, setVideoWatched] = useState(alreadyWatchedVideo);

  // Quiz state (5 interactive questions)
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  // Resume BGM if modal unmounts while video was playing
  useEffect(() => {
    return () => {
      soundEngine.resumeBgmFor('video');
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = videoMuted;
    v.volume = videoMuted ? 0 : volume;
  }, [volume, videoMuted]);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoError('');
    v.muted = videoMuted;
    v.volume = videoMuted ? 0 : volume;
    v.play().catch(() => {
      setVideoError(
        'Pelayar menyekat main balik audio/video secara automatik. Sila tekan butang Main sekali lagi.',
      );
    });
  };

  const handlePause = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
  };

  const handleReplay = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoError('');
    v.currentTime = 0;
    setCurrentTime(0);
    v.muted = videoMuted;
    v.volume = videoMuted ? 0 : volume;
    v.play().catch(() => {
      setVideoError('Gagal memulakan ulang video. Sila tekan butang Main.');
    });
  };

  const handleSeek = (targetTime: number) => {
    const v = videoRef.current;
    if (!v) return;
    const allowedMax = videoWatched ? duration : maxWatchedRef.current;
    const clamped = Math.max(0, Math.min(targetTime, allowedMax));
    v.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleVideoPlayEvent = () => {
    setIsPlaying(true);
    soundEngine.pauseBgmFor('video');
  };

  const handleVideoPauseEvent = () => {
    setIsPlaying(false);
    soundEngine.resumeBgmFor('video');
  };

  const handleVideoEndedEvent = () => {
    setIsPlaying(false);
    soundEngine.resumeBgmFor('video');
    if (!videoWatched) {
      soundEngine.playQuestComplete();
    }
    setVideoWatched(true);
    onVideoFinished();
  };

  const handleStartChallenge = () => {
    if (!videoWatched) return;
    const v = videoRef.current;
    if (v && !v.paused) {
      v.pause();
    }
    soundEngine.resumeBgmFor('video');
    setStep('quiz');
  };

  const currentQ = DENGARKAN_QUESTIONS[qIdx];
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleCheckAnswer = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === currentQ.correctIndex) {
      setScore((s) => s + 1);
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (qIdx + 1 < DENGARKAN_QUESTIONS.length) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setQuizDone(true);
      soundEngine.playQuestComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border-2 border-teal-300 p-5 sm:p-6 text-slate-900 max-h-[94vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                MISI DENGARKAN SAJAK
              </h2>
              <p className="text-xs font-medium text-teal-700">
                Pavilion Ajaib Tasik Irama · Penjaga Sajak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.resumeBgmFor('video');
              onClose();
            }}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'video' ? (
          <div className="mt-4 space-y-4">
            {/* Pavilion Video Stage */}
            <div className="rounded-2xl bg-slate-950 border-2 border-teal-500/60 overflow-hidden shadow-xl">
              <div className="relative w-full aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={VIDEO_SRC}
                  preload="auto"
                  playsInline
                  onLoadedMetadata={(e) => {
                    const el = e.currentTarget;
                    const dur = el.duration || 0;
                    setDuration(dur);
                    el.muted = videoMuted;
                    el.volume = videoMuted ? 0 : volume;
                  }}
                  onTimeUpdate={(e) => {
                    const ct = e.currentTarget.currentTime || 0;
                    setCurrentTime(ct);
                    if (ct > maxWatchedRef.current) {
                      maxWatchedRef.current = ct;
                    }
                  }}
                  onPlay={handleVideoPlayEvent}
                  onPause={handleVideoPauseEvent}
                  onEnded={handleVideoEndedEvent}
                  onError={() =>
                    setVideoError('Video sajak gagal dimuatkan. Sila muat semula halaman.')
                  }
                  onClick={() => (isPlaying ? handlePause() : handlePlay())}
                  className="w-full h-full object-contain cursor-pointer"
                />

                {/* Non-intrusive center Play button when paused/idle */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label="Mainkan Video Sajak"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/35 hover:bg-slate-950/25 transition-colors cursor-pointer"
                  >
                    <span className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </span>
                    <span className="px-4 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs sm:text-sm font-semibold border border-teal-400/50">
                      {currentTime > 1 && currentTime < duration - 0.5
                        ? 'Sambung Menonton Video Sajak'
                        : 'Tekan untuk Mendengar & Menghayati Sajak'}
                    </span>
                  </button>
                )}
              </div>

              {/* Custom 16:9 Player Controls Bar */}
              <div className="p-3 sm:p-4 bg-slate-900 text-white space-y-2.5">
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-xs text-slate-300 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      aria-label="Kemajuan Video"
                      className="w-full h-2 accent-amber-400 cursor-pointer"
                    />
                  </div>
                  <span className="font-mono-num text-xs text-slate-300 w-10">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Progress Indicator Text */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isPlaying ? (
                      <button
                        type="button"
                        onClick={handlePlay}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Main</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePause}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Jeda</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleReplay}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ulang Semula</span>
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoMuted((m) => !m)}
                      aria-label={videoMuted ? 'Nyahsenyap Video' : 'Senyapkan Video'}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 cursor-pointer"
                    >
                      {videoMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={videoMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        setVideoMuted(val === 0);
                      }}
                      aria-label="Kelantangan Video"
                      className="w-24 accent-teal-400 cursor-pointer"
                    />
                    <span className="font-mono-num text-xs text-slate-300 w-9 text-right">
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                </div>

                {videoError && (
                  <p className="text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-lg px-3 py-1.5">
                    {videoError}
                  </p>
                )}
              </div>
            </div>

            {/* Mission Completion Status & MULA CABARAN Unlock */}
            {videoWatched ? (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display font-bold text-emerald-950 text-base">
                      Tahniah! Misi Mendengar Video Selesai!
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Kamu telah menonton video sajak sehingga tamat. Tekan butang di sebelah untuk menjawab 5 soalan interaktif.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartChallenge}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm shadow-md cursor-pointer whitespace-nowrap"
                >
                  MULA CABARAN
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950 text-sm">
                      Tonton Video Sehingga Tamat
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Butang &ldquo;MULA CABARAN&rdquo; akan dibuka secara automatik selepas video ini selesai ditonton sepenuhnya.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 text-slate-500 font-display font-bold text-sm cursor-not-allowed whitespace-nowrap"
                >
                  MULA CABARAN
                </button>
              </div>
            )}
          </div>
        ) : !quizDone ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Topik: {currentQ.topic}</span>
              <span className="font-mono-num">
                Soalan {qIdx + 1} / {DENGARKAN_QUESTIONS.length} · Skor: {score}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{
                  width: `${Math.round(((qIdx + (answered ? 1 : 0)) / DENGARKAN_QUESTIONS.length) * 100)}%`,
                }}
              />
            </div>

            <p className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </p>

            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isSel = selected === idx;
                const isRight = idx === currentQ.correctIndex;
                let style = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                if (answered) {
                  if (isRight) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (isSel) {
                    style = 'border-rose-400 bg-rose-50 text-rose-900';
                  }
                } else if (isSel) {
                  style = 'border-teal-500 bg-teal-50 text-teal-950 font-semibold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected(idx)}
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

            {answered && (
              <div
                className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
                  selected === currentQ.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                {selected === currentQ.correctIndex ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {selected === currentQ.correctIndex
                      ? 'Syabas! Jawapan kamu betul.'
                      : `Jawapan yang betul ialah ${String.fromCharCode(65 + currentQ.correctIndex)}.`}
                  </p>
                  <p className="mt-0.5">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep('video')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                ← Tonton Video Semula
              </button>

              {!answered ? (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleCheckAnswer}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-bold cursor-pointer disabled:cursor-not-allowed"
                >
                  Semak Jawapan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
                >
                  {qIdx + 1 < DENGARKAN_QUESTIONS.length
                    ? 'Soalan Seterusnya →'
                    : 'Tamatkan Misi Dengarkan Sajak'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Misi Dengarkan Sajak Selesai!
            </h3>
            <p className="text-base text-slate-700">
              Skor kamu:{' '}
              <strong className="font-mono-num text-teal-700 text-xl">
                {score} / {DENGARKAN_QUESTIONS.length}
              </strong>
            </p>
            <button
              type="button"
              onClick={() => onCompleteQuiz(score)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
            >
              {alreadyCompletedQuiz
                ? 'Simpan Rekod Baharu'
                : `Tuntut Ganjaran (+${50 + score * 15} Syiling, +${90 + score * 20} Mata)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
