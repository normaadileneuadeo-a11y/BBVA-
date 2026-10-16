/**
 * Web Audio API Synthesizer for Authentic Apple iPhone System Sounds
 * Includes exact synthesis of Apple's iconic "Tri-tone" (Tri-tono), "Note" (Nota),
 * iOS keypad clicks, and bank notification alerts with native iOS haptics.
 * Zero external audio file dependencies, instant playback, zero lag.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Unlock Web Audio on iOS Safari / WebKit by playing an inaudible buffer
   */
  unlockAudio() {
    if (this.isUnlocked || typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;
    } catch (_) {}
  }

  /**
   * Authentic Apple iPhone "Tri-tone" (Tri-tono) notification chime
   * Frequencies:
   * 1. G#5 (830.61 Hz)
   * 2. B5  (987.77 Hz)
   * 3. E6  (1318.51 Hz)
   * Modeled after the iconic Apple marimba/glockenspiel with wooden mallet transient and acoustic body
   */
  playIPhoneTriTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // 3 signature Apple notes: G#5, B5, E6
      const tones = [
        { freq: 830.61, time: now, duration: 0.38, ringout: 0.35, gain: 0.28 },
        { freq: 987.77, time: now + 0.125, duration: 0.38, ringout: 0.35, gain: 0.30 },
        { freq: 1318.51, time: now + 0.250, duration: 0.70, ringout: 0.65, gain: 0.35 },
      ];

      tones.forEach(({ freq, time, duration, gain: peakGain }) => {
        // 1. Fundamental sine oscillator (pure, warm body)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Instant attack (1.5ms) followed by natural exponential marimba decay
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(peakGain, time + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(peakGain * 0.4, time + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + duration);

        // 2. Harmonic overtone (2.76x acoustic bar resonance for authentic marimba strike)
        const overtoneOsc = ctx.createOscillator();
        const overtoneGain = ctx.createGain();

        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(freq * 2.76, time);

        // Fast decay on the overtone (gives the crisp mallet attack)
        overtoneGain.gain.setValueAtTime(0, time);
        overtoneGain.gain.linearRampToValueAtTime(peakGain * 0.18, time + 0.001);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(ctx.destination);

        overtoneOsc.start(time);
        overtoneOsc.stop(time + 0.07);

        // 3. Subtle mallet transient click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(freq * 4, time);

        clickGain.gain.setValueAtTime(peakGain * 0.08, time);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);

        clickOsc.start(time);
        clickOsc.stop(time + 0.016);
      });

      // Authentic Apple iPhone haptic vibration: double pulse (tap-tap)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 60, 35]);
      }
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }
  }

  /**
   * Modern Apple iPhone "Note" / "Ding" chime (E6 single tone with chime ringout)
   */
  playIPhoneNote() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, now); // E6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch (_) {}
  }

  /**
   * Default notification sound - uses the authentic iPhone Tri-tone
   */
  playNotificationSound() {
    this.playIPhoneTriTone();
  }

  /**
   * Transfer success celebration chime (Apple Pay style rising success chord)
   */
  playTransferSuccessSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Authentic Apple Pay / iOS success tone sequence: F#5 -> A#5 -> C#6 (Major Triad)
      const notes = [
        { freq: 739.99, timeOffset: 0.00, dur: 0.35, gain: 0.22 }, // F#5
        { freq: 932.33, timeOffset: 0.09, dur: 0.40, gain: 0.25 }, // A#5
        { freq: 1108.73, timeOffset: 0.18, dur: 0.75, gain: 0.32 }, // C#6
      ];

      notes.forEach(({ freq, timeOffset, dur, gain: peakGain }) => {
        const now = ctx.currentTime + timeOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(peakGain * 0.5, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 40, 80]);
      }
    } catch (_) {}
  }

  /**
   * Authentic iOS keypad / keyboard click sound
   */
  playKeypadClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // iOS keyboard click is a quick wood-like transient click around 1400Hz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch (_) {}
  }

  /**
   * Authentic iOS screen lock "thock" sound
   */
  playLockSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch (_) {}
  }

  /**
   * iOS error warning buzz
   */
  playErrorSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 40, 50]);
      }
    } catch (_) {}
  }
}

export const sounds = new SoundEngine();

// Auto-unlock Web Audio on first user interaction on iOS Safari
if (typeof window !== 'undefined') {
  const unlock = () => {
    sounds.unlockAudio();
  };
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('touchend', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
}
