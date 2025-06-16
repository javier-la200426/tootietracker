// Sound utility for generating authentic fart sounds based on duration
export class FartSoundGenerator {
  private audioContext: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private currentGainNodes: GainNode[] = [];
  private isPlaying: boolean = false;

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Start playing fart sound (for when button is pressed)
  async startFartSound() {
    await this.ensureAudioContext();
    
    if (!this.audioContext || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.stopCurrentSounds();

    const now = this.audioContext.currentTime;

    // Create main fart oscillator with more audible frequency
    const mainOsc = this.audioContext.createOscillator();
    const mainGain = this.audioContext.createGain();
    const mainFilter = this.audioContext.createBiquadFilter();

    // Higher frequency range for better audibility - typical fart range
    const baseFreq = 80 + Math.random() * 40; // 80-120 Hz range (much more audible)
    mainOsc.frequency.setValueAtTime(baseFreq, now);
    mainOsc.type = 'sawtooth';

    // Less aggressive filtering to keep more audible frequencies
    mainFilter.type = 'lowpass';
    mainFilter.frequency.setValueAtTime(300 + Math.random() * 200, now); // 300-500 Hz cutoff
    mainFilter.Q.setValueAtTime(1.5, now);

    // Much higher volume for audibility
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.exponentialRampToValueAtTime(0.4, now + 0.05); // Increased from 0.15 to 0.4

    mainOsc.connect(mainFilter);
    mainFilter.connect(mainGain);
    mainGain.connect(this.audioContext.destination);

    mainOsc.start(now);
    this.currentOscillators.push(mainOsc);
    this.currentGainNodes.push(mainGain);

    // Add some texture with filtered noise - more audible
    const noiseBuffer = this.createBubblyNoiseBuffer(2); // 2 second buffer
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();

    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(150, now); // Higher frequency for more audible noise
    noiseFilter.Q.setValueAtTime(2, now);

    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.2, now + 0.1); // Increased from 0.08 to 0.2

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);

    noiseSource.start(now);
    this.currentGainNodes.push(noiseGain);

    // Add more prominent harmonic for richness
    const harmonic = this.audioContext.createOscillator();
    const harmonicGain = this.audioContext.createGain();
    
    harmonic.frequency.setValueAtTime(baseFreq * 2, now); // More prominent harmonic
    harmonic.type = 'triangle';
    
    harmonicGain.gain.setValueAtTime(0, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.15, now + 0.15); // Increased from 0.05 to 0.15
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(this.audioContext.destination);
    
    harmonic.start(now);
    this.currentOscillators.push(harmonic);
    this.currentGainNodes.push(harmonicGain);
  }

  // Update the sound based on current duration (called while button is held)
  updateFartSound(currentDurationMs: number) {
    if (!this.audioContext || !this.isPlaying || this.currentOscillators.length === 0) {
      return;
    }

    const now = this.audioContext.currentTime;
    const duration = currentDurationMs / 1000;

    // Adjust frequency based on duration - but keep it more audible
    const mainOsc = this.currentOscillators[0];
    if (mainOsc) {
      const newFreq = Math.max(60, 100 - (duration * 4)); // 100Hz down to 60Hz (more audible range)
      const wobble = Math.sin(duration * 6) * 8; // More pronounced wobble
      mainOsc.frequency.setValueAtTime(newFreq + wobble, now);
    }

    // Adjust volume based on duration - higher volumes
    this.currentGainNodes.forEach((gainNode, index) => {
      if (index === 0) { // Main oscillator
        const volume = Math.min(0.5, 0.3 + (duration * 0.03)); // Increased base and scaling
        gainNode.gain.setValueAtTime(volume, now);
      } else if (index === 1) { // Noise
        const noiseVolume = Math.min(0.25, 0.15 + (duration * 0.02)); // Increased noise volume
        gainNode.gain.setValueAtTime(noiseVolume, now);
      } else if (index === 2) { // Harmonic
        const harmonicVolume = Math.min(0.2, 0.1 + (duration * 0.015)); // More prominent harmonic
        gainNode.gain.setValueAtTime(harmonicVolume, now);
      }
    });

    // Add random frequency variations for realism - more frequent
    if (Math.random() < 0.15) { // 15% chance each update (increased from 10%)
      const harmonic = this.currentOscillators[1];
      if (harmonic) {
        const variation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier (wider range)
        harmonic.frequency.setValueAtTime(
          harmonic.frequency.value * variation, 
          now + 0.05
        );
      }
    }
  }

  // Stop the fart sound (when button is released)
  stopFartSound() {
    if (!this.audioContext || !this.isPlaying) {
      return;
    }

    const now = this.audioContext.currentTime;
    const fadeOutTime = 0.15; // Slightly longer fade for smoother ending

    // Fade out all gain nodes
    this.currentGainNodes.forEach(gainNode => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeOutTime);
    });

    // Stop oscillators after fade out
    setTimeout(() => {
      this.stopCurrentSounds();
      this.isPlaying = false;
    }, fadeOutTime * 1000 + 50);
  }

  private createBubblyNoiseBuffer(duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create more organic, bubbly noise with higher amplitude
    let phase = 0;
    for (let i = 0; i < bufferSize; i++) {
      // Mix white noise with some periodic elements - higher amplitude
      const whiteNoise = (Math.random() * 2 - 1) * 0.6; // Increased from 0.3 to 0.6
      const bubble = Math.sin(phase) * 0.4 * Math.random(); // Increased from 0.2 to 0.4
      phase += (0.02 + Math.random() * 0.03); // Slightly faster phase changes
      
      data[i] = whiteNoise + bubble;
      
      // Add occasional pops/clicks for realism - more frequent and louder
      if (Math.random() < 0.002) { // Increased frequency from 0.001 to 0.002
        data[i] += (Math.random() - 0.5) * 0.8; // Increased amplitude from 0.5 to 0.8
      }
    }
    
    return buffer;
  }

  private stopCurrentSounds() {
    this.currentOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // Oscillator might already be stopped
      }
    });
    this.currentOscillators = [];
    this.currentGainNodes = [];
  }

  // Play a quick fart sound for taps
  async playQuickFart() {
    await this.startFartSound();
    setTimeout(() => {
      this.stopFartSound();
    }, 300); // Slightly longer for better audibility
  }

  // Legacy method for compatibility - now just plays a quick fart
  async playFartSound(durationMs: number) {
    await this.startFartSound();
    setTimeout(() => {
      this.stopFartSound();
    }, Math.min(durationMs, 5000)); // Cap at 5 seconds
  }

  // Clean up resources
  dispose() {
    this.stopCurrentSounds();
    this.isPlaying = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const fartSoundGenerator = new FartSoundGenerator(); 