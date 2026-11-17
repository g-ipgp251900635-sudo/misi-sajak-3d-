import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Pause,
  Play,
  Square,
  Volume2,
  Waves,
  X,
  XCircle,
} from 'lucide-react';
import { IRAMA_QUESTIONS, ORIGINAL_SAJAK } from '../../data/sajakContent';
import { soundEngine } from '../../game/audio';

interface IramaStudioModalProps {
  alreadyCompleted: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export const IramaStudioModal: React.FC<IramaStudioModalProps> = ({
  alreadyCompleted,
  onComplete,
  onClose,
}) => {
  const [tab, setTab] = useState<'studio' | 'quiz'>('studio');
  const [stanzaIdx, setStanzaIdx] = useState(0);
  const [speed, setSpeed] = useState<'perlahan' | 'sederhana' | 'laju'>('sederhana');
  const [playState, setPlayState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [activeLine, setActiveLine] = useState<number>(-1);

  const timerRef = useRef<number | null>(null);
  const playingLineRef = useRef(0);

  // Quiz state
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const stanza = ORIGINAL_SAJAK.stanzas[stanzaIdx];
  const currentQ = IRAMA_QUESTIONS[qIdx];

  const clearPlayback = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => {
      clearPlayback();
      soundEngine.resumeBgmFor('irama');
    };
  }, []);

  const getRate = () => (speed === 'perlahan' ? 0.78 : speed === 'laju' ? 1.08 : 0.92);
  const getLineDurationMs = () => (speed === 'perlahan' ? 3600 : speed === 'laju' ? 2300 : 2900);

  const speakLine = (lineIndex: number, targetStanzaIdx: number) => {
    const targetStanza = ORIGINAL_SAJAK.stanzas[targetStanzaIdx];
    if (lineIndex >= targetStanza.lines.length) {
      setPlayState('idle');
      setActiveLine(-1);
      soundEngine.resumeBgmFor('irama');
      return;
    }

    playingLineRef.current = lineIndex;
    setActiveLine(lineIndex);
    soundEngine.playRecitationChime(lineIndex);

    const text = targetStanza.lines[lineIndex].raw;
    const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

    let speechTriggered = false;
    if (hasSpeech && !soundEngine.isMuted()) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const malayVoice = voices.find((v) =>
          /ms|may|ind|id/i.test(v.lang),
        );
        if (malayVoice) utter.voice = malayVoice;
        utter.lang = malayVoice?.lang || 'ms-MY';
        utter.rate = getRate();
        utter.pitch = lineIndex === targetStanza.lines.length - 1 ? 0.94 : 1.04;

        let advanced = false;
        const advanceOnce = () => {
          if (advanced) return;
          advanced = true;
          if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          speakLine(lineIndex + 1, targetStanzaIdx);
        };

        utter.onend = () => {
          timerRef.current = window.setTimeout(advanceOnce, 380);
        };
        utter.onerror = () => {
          timerRef.current = window.setTimeout(advanceOnce, getLineDurationMs());
        };

        window.speechSynthesis.speak(utter);
        speechTriggered = true;
        // Safety fallback timer in case browser speech engine stalls silently
        timerRef.current = window.setTimeout(advanceOnce, getLineDurationMs() + 1800);
      } catch {
        speechTriggered = false;
      }
    }

    if (!speechTriggered) {
      timerRef.current = window.setTimeout(() => {
        speakLine(lineIndex + 1, targetStanzaIdx);
      }, getLineDurationMs());
    }
  };

  const handlePlay = () => {
    soundEngine.pauseBgmFor('irama');
    if (playState === 'paused') {
      setPlayState('playing');
      speakLine(Math.max(0, playingLineRef.current), stanzaIdx);
      return;
    }
    clearPlayback();
    setPlayState('playing');
    speakLine(0, stanzaIdx);
  };

  const handlePause = () => {
    clearPlayback();
    setPlayState('paused');
    soundEngine.resumeBgmFor('irama');
  };

  const handleStop = () => {
    clearPlayback();
    playingLineRef.current = 0;
    setPlayState('idle');
    setActiveLine(-1);
    soundEngine.resumeBgmFor('irama');
  };

  const handleSelectStanza = (idx: number) => {
    handleStop();
    setStanzaIdx(idx);
  };

  const handleAnswer = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === currentQ.correctIndex) {
      setScore((s) => s + 1);
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNextQ = () => {
    if (qIdx + 1 < IRAMA_QUESTIONS.length) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setQuizDone(true);
      soundEngine.playQuestComplete();
    }
  };

  const renderAnnotatedText = (annotated: string) => {
    // Bold words wrapped in **...**
    const parts = annotated.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, idx) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return (
          <strong key={idx} className="text-sky-700 underline decoration-amber-400 decoration-2 underline-offset-4">
            {p.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{p}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-sky-200 p-6 text-slate-900 max-h-[92vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Makmal Tasik Irama
              </h2>
              <p className="text-xs font-medium text-sky-700">
                Intonasi · Tekanan · Jeda Deklamasi Sajak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStop();
              onClose();
            }}
            aria-label="Tutup"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="mt-4 flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('studio')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'studio'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Dengar Contoh Deklamasi
          </button>
          <button
            type="button"
            onClick={() => {
              handleStop();
              setTab('quiz');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              tab === 'quiz'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Latihan Teknik ({IRAMA_QUESTIONS.length} Soalan)
          </button>
        </div>

        {tab === 'studio' ? (
          <div className="mt-4 space-y-4">
            {/* Guide Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-sky-50 border border-sky-200 rounded-xl p-3 text-slate-700">
              <div>
                <span className="font-bold text-sky-900">Jeda ( / , // ):</span> Hentian sejenak atau hentian akhir rangkap.
              </div>
              <div>
                <span className="font-bold text-sky-900">Tekanan (Garis):</span> Sebut kata kunci dengan tegas.
              </div>
              <div>
                <span className="font-bold text-sky-900">Intonasi:</span> Turun naik nada ikut emosi rangkap.
              </div>
            </div>

            {/* Stanza Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {ORIGINAL_SAJAK.stanzas.map((st, idx) => (
                  <button
                    key={st.rangkap}
                    type="button"
                    onClick={() => handleSelectStanza(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      stanzaIdx === idx
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Rangkap {st.rangkap}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Kelajuan:</span>
                {(['perlahan', 'sederhana', 'laju'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpeed(sp)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize cursor-pointer ${
                      speed === sp
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-xl p-3.5">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-sky-400" />
                <div>
                  <p className="text-sm font-bold">
                    &ldquo;{ORIGINAL_SAJAK.title}&rdquo; · {stanza.tajukKecil}
                  </p>
                  <p className="text-xs text-slate-300">
                    {playState === 'playing'
                      ? `Sedang mendeklamasikan Baris ${activeLine + 1}...`
                      : playState === 'paused'
                        ? 'Deklamasi dijeda sebentar'
                        : 'Tekan Main untuk mendengar alunan deklamasi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {playState !== 'playing' ? (
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{playState === 'paused' ? 'Sambung' : 'Main Audio'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Jeda</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleStop}
                  disabled={playState === 'idle'}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Henti</span>
                </button>
              </div>
            </div>

            {/* Annotated Stanza Lines */}
            <div className="space-y-2">
              {stanza.lines.map((line, idx) => {
                const isActive = activeLine === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-sky-50 border-sky-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="text-base font-medium text-slate-900">
                      {renderAnnotatedText(line.annotated)}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-sky-800">Intonasi:</span> {line.intonasi}{' '}
                      <span aria-hidden="true">·</span>{' '}
                      <span className="font-semibold text-amber-800">Jeda:</span> {line.jedaTip}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  handleStop();
                  setTab('quiz');
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold cursor-pointer"
              >
                Terus ke Latihan Teknik →
              </button>
            </div>
          </div>
        ) : !quizDone ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Fokus: {currentQ.concept}</span>
              <span className="font-mono-num">
                Soalan {qIdx + 1} / {IRAMA_QUESTIONS.length}
              </span>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 italic text-slate-900 text-base font-medium">
              &ldquo;{currentQ.excerpt}&rdquo;
            </div>

            <p className="text-sm font-bold text-slate-900">{currentQ.question}</p>

            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                const isThisSelected = selected === idx;
                const isThisCorrect = idx === currentQ.correctIndex;
                let style = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';
                if (answered) {
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
                    {selected === currentQ.correctIndex ? 'Tepat sekali!' : 'Hampir tepat!'}
                  </p>
                  <p className="mt-0.5">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {!answered ? (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleAnswer}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-bold cursor-pointer disabled:cursor-not-allowed"
                >
                  Semak Jawapan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQ}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
                >
                  {qIdx + 1 < IRAMA_QUESTIONS.length ? 'Soalan Seterusnya →' : 'Lihat Keputusan'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Waves className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">
              Latihan Tasik Irama Selesai!
            </h3>
            <p className="text-base text-slate-700">
              Kamu menjawab{' '}
              <strong className="font-mono-num text-sky-700">
                {score} / {IRAMA_QUESTIONS.length}
              </strong>{' '}
              soalan teknik deklamasi dengan betul.
            </p>
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
            >
              {alreadyCompleted
                ? 'Tutup Makmal Irama'
                : `Tuntut Ganjaran (+${40 + score * 15} Syiling, +${80 + score * 20} Mata)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
