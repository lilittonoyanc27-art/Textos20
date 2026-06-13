/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (arpeggio)
    const now = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.07 + 0.2);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.22);
    });
  }

  playIncorrect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.35);

    // Apply a bandpass filter to make it sound like a buzzer
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(160, now);
    
    // Connect osc -> filter -> gain
    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  playTurnChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Two high bell chime sounds
    const freqs = [587.33, 880.00]; // D5, A5
    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.15);

      gain.gain.setValueAtTime(0, now + index * 0.15);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.4);

      osc.start(now + index * 0.15);
      osc.stop(now + index * 0.15 + 0.45);
    });
  }

  playVictoryTheme() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C major arpeggio and scale upward (Retro style)
    const melody = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.50, d: 0.15 }, // C6
      { f: 880.00, d: 0.1 }, // A5
      { f: 1046.50, d: 0.15 }, // C6
      { f: 1174.66, d: 0.15 }, // D6
      { f: 1318.51, d: 0.4 }  // E6
    ];

    let currentStart = now;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, currentStart);

      gain.gain.setValueAtTime(0, currentStart);
      gain.gain.linearRampToValueAtTime(0.15, currentStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.005, currentStart + note.d);

      osc.start(currentStart);
      osc.stop(currentStart + note.d + 0.02);

      currentStart += note.d - 0.02; // overlap slightly
    });
  }
}

export const synth = new AudioSynth();
