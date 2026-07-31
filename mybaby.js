/* ==========================================================================
   WEB AUDIO SYNTHESIZER & SFX ENGINE
   ========================================================================== */
class AudioSynthEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.sfxEnabled = true;
        this.timer = null;
        this.noteIndex = 0;
        
        // Romantic Melodic Sequence frequencies (C Major / A Minor Ambient Scale)
        this.melody = [
            261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 329.63, 392.00,
            293.66, 349.23, 440.00, 493.88, 523.25, 392.00, 329.63, 261.63,
            349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00, 329.63,
            293.66, 329.63, 349.23, 392.00, 261.63, 329.63, 392.00, 523.25
        ];

        this.harmony = [
            130.81, 164.81, 196.00, 220.00, 174.61, 164.81, 146.83, 130.81
        ];

        this.tempo = 380; // Duration between notes in ms
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    playNote(freq, duration = 0.4, type = 'sine') {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // ADSR Envelope
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context Error:", e);
        }
    }

    // Sound Effect: Soft Click / Pop
    playPopSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        this.playNote(587.33, 0.1, 'triangle');
    }

    // Sound Effect: Unlock Passcode Sound
    playUnlockSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.3, 'sine'), i * 70);
        });
    }

    // Sound Effect: Envelope Chime
    playChimeSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        const chimeNotes = [523.25, 659.25, 783.99, 1046.50];
        chimeNotes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.35, 'sine'), i * 80);
        });
    }

    // Sound Effect: Heartbeat Pulse
    playHeartBeatSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        this.playNote(80, 0.15, 'triangle');
        setTimeout(() => this.playNote(70, 0.2, 'triangle'), 150);
    }

    // Sound Effect: Quiz Success Fanfare
    playSuccessSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanfare.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.4, 'sine'), i * 90);
        });
    }

    // Sound Effect: Soft Error Tone
    playErrorSFX() {
        if (!this.sfxEnabled) return;
        this.init();
        this.playNote(220, 0.2, 'sawtooth');
        setTimeout(() => this.playNote(196, 0.3, 'sawtooth'), 120);
    }

    start() {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.isPlaying = true;
        this.noteIndex = 0;
        
        this.timer = setInterval(() => {
            const freq = this.melody[this.noteIndex % this.melody.length];
            const bassFreq = this.harmony[Math.floor(this.noteIndex / 4) % this.harmony.length];
            
            this.playNote(freq, 0.5, 'sine');
            this.playNote(bassFreq, 0.8, 'triangle');

            this.noteIndex++;
            this.drawVisualizerFrame();
        }, this.tempo);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    drawVisualizerFrame() {
        const vizCanvas = document.getElementById('visualizerCanvas');
        if (!vizCanvas) return;
        const vCtx = vizCanvas.getContext('2d');
        vCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);

        vCtx.fillStyle = '#ff4b72';
        for (let i = 0; i < 5; i++) {
            const barHeight = Math.random() * (vizCanvas.height - 4) + 4;
            vCtx.fillRect(i * 12 + 2, vizCanvas.height - barHeight, 6, barHeight);
        }
    }
}

// Global Audio Engine Instance
window.synthEngine = new AudioSynthEngine();