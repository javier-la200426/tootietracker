// URLs for open-license fart sound effects (Pixabay, CC0). Feel free to replace
// these with your own clips placed in /public and change the paths below.
const QUICK_FART_URL = '/sounds/Fart1Final.mp3'; // ~0.4 s
const LONG_FART_URL  = '/sounds/Fart2Final.mp3'; // ~4 s – loops while held

class FartAudioPlayer {
  private quick = new Audio(QUICK_FART_URL);
  private long  = new Audio(LONG_FART_URL);
  private longPlaying = false;

  constructor() {
    // Prepare the <audio> elements
    this.quick.preload = 'auto';
    this.long.preload  = 'auto';
    this.long.loop     = true;
    this.quick.crossOrigin = 'anonymous';
    this.long.crossOrigin  = 'anonymous';
  }

  /** Play the looping "long fart" when the user starts holding the button. */
  async startFartSound() {
    if (this.longPlaying) return;
    try {
      this.longPlaying = true;
      this.long.currentTime = 0;
      this.long.volume = 0.7;
      await this.long.play();
    } catch (err) {
      console.warn('Unable to start fart audio', err);
    }
  }

  /** Optionally increase volume the longer the press lasts. */
  updateFartSound(currentDurationMs: number) {
    if (!this.longPlaying) return;
    const secs = currentDurationMs / 1000;
    this.long.volume = Math.min(1, 0.6 + secs * 0.08); // ramp up to 1 over ~5 s
  }

  /** Smoothly fade out and stop the looping sample. */
  stopFartSound() {
    if (!this.longPlaying) return;
    this.longPlaying = false;

    const fadeSteps = 10;
    const interval = 15; // ms
    const step = this.long.volume / fadeSteps;

    const fadetimer = setInterval(() => {
      if (this.long.volume - step > 0) {
        this.long.volume = this.long.volume - step;
      } else {
        clearInterval(fadetimer);
        this.long.pause();
        this.long.currentTime = 0;
        this.long.volume = 0.7;
      }
    }, interval);
  }

  /** Play a one-off, short fart for quick taps. */
  async playQuickFart() {
    try {
      this.quick.currentTime = 0;
      await this.quick.play();
    } catch (err) {
      console.warn('Unable to play quick fart', err);
    }
  }
}

// Singleton instance reused across components
export const fartAudio = new FartAudioPlayer(); 