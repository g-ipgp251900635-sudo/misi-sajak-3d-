const BGM_SRC = './assets/aistudio/Canggung__Instrumental__cd6abb3d.mp3';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  // Background Music (Canggung Instrumental)
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmStarted = false;
  private bgmEnabled = true;
  private bgmVolume = 0.38;
  private bgmPausedReasons = new Set<string>();
  private bgmDuckedReasons = new Set<string>();

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureBgm(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgmAudio) {
      const audio = new Audio(BGM_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.bgmVolume;
      this.bgmAudio = audio;
    }
    return this.bgmAudio;
  }

  private syncBgmPlayback() {
    const audio = this.bgmAudio;
    if (!audio) return;

    const targetVol = this.bgmDuckedReasons.size > 0 ? this.bgmVolume * 0.22 : this.bgmVolume;
    audio.volume = Math.max(0, Math.min(1, targetVol));

    const shouldPlay =
      this.bgmStarted &&
      this.bgmEnabled &&
      !this.muted &&
      this.bgmPausedReasons.size === 0;

    if (shouldPlay) {
      if (audio.paused) {
        audio.play().catch(() => {
          // Browser autoplay block until next user gesture
        });
      }
    } else if (!audio.paused) {
      audio.pause();
    }
  }

  public startBgm() {
    this.ensureBgm();
    this.bgmStarted = true;
    this.syncBgmPlayback();
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (enabled && !this.bgmStarted) {
      this.ensureBgm();
      this.bgmStarted = true;
    }
    this.syncBgmPlayback();
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.syncBgmPlayback();
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public pauseBgmFor(reason: string) {
    this.bgmPausedReasons.add(reason);
    this.syncBgmPlayback();
  }

  public resumeBgmFor(reason: string) {
    this.bgmPausedReasons.delete(reason);
    this.syncBgmPlayback();
  }

  public duckBgmFor(reason: string) {
    this.bgmDuckedReasons.add(reason);
    this.syncBgmPlayback();
  }

  public unduckBgmFor(reason: string) {
    this.bgmDuckedReasons.delete(reason);
    this.syncBgmPlayback();
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.syncBgmPlayback();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.12,
    delay = 0,
    endFreq?: number,
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playJump() {
    this.playTone(260, 0.18, 'triangle', 0.12, 0, 520);
  }

  public playGem() {
    this.playTone(587.33, 0.14, 'sine', 0.12, 0);
    this.playTone(880, 0.22, 'triangle', 0.11, 0.07);
  }

  public playCoin() {
    this.playTone(987.77, 0.1, 'sine', 0.1, 0);
    this.playTone(1318.51, 0.2, 'sine', 0.1, 0.08);
  }

  public playCorrect() {
    this.playTone(523.25, 0.14, 'triangle', 0.13, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.13, 0.09);
    this.playTone(783.99, 0.28, 'triangle', 0.14, 0.18);
  }

  public playWrong() {
    this.playTone(220, 0.18, 'sawtooth', 0.07, 0, 155);
  }

  public playQuestComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.26, 'triangle', 0.14, idx * 0.1);
    });
  }

  public playStep() {
    this.playTone(140 + Math.random() * 30, 0.05, 'sine', 0.03, 0, 90);
  }

  public playRecitationChime(lineIndex: number) {
    const scale = [392.0, 440.0, 523.25, 587.33, 659.25];
    const freq = scale[lineIndex % scale.length];
    this.playTone(freq, 0.45, 'sine', 0.07, 0);
  }
}

export const soundEngine = new SoundEngine();
