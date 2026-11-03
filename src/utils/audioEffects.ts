// Web Audio API Synthesizer for high-fidelity devotional & celebration sounds
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Sacred Temple Bell / Ghanti ringing
  playTempleBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = [1046.5, 2093.0, 3135.96]; // High bright bell harmonics
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + i * 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  // Lotus Chime / Delicate celestial chime
  playLotusChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });
  }

  // Conch (Shankh) deep acoustic drone
  playConchSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(277.18, now + 0.4); // C#4
    osc.frequency.linearRampToValueAtTime(246.94, now + 1.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    // Low pass filter for warm brass horn timbre
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  // Diamond purchase / Coin chime
  playCoinChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.setValueAtTime(1975.53, now + 0.08); // B6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);
  }

  // Celestial Supernova celebration
  playSupernovaSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Rising sweep + deep boom
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(80, now + 1.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  playSoundForGift(effectName: string) {
    if (!this.enabled) return;
    try {
      switch (effectName) {
        case 'temple_bell':
        case 'temple_bells_poly':
          this.playTempleBell();
          break;
        case 'lotus_chime':
        case 'flute_echo':
          this.playLotusChime();
          break;
        case 'conch_trumpet':
        case 'deep_shankh':
          this.playConchSound();
          break;
        case 'supernova_boom':
        case 'celestial_harp':
          this.playSupernovaSound();
          break;
        default:
          this.playTempleBell();
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}

export const soundManager = new SoundSynthesizer();
