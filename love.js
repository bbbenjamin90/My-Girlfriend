/* ==========================================================================
   MAIN APPLICATION & UI INTERACTION CONTROLLER
   ========================================================================== */
class AppUI {
    constructor() {
        this.correctPasscode = "0707"; // Secret Passcode
        this.isVoicePlaying = false;
        this.voiceTimerInterval = null;
        this.voiceCurrentTime = 0;
        this.voiceDuration = 45; // Voice note duration in seconds

        // Media Gallery Register
        this.mediaItems = [
            { type: 'image', src: 'images/19.jpeg', caption: 'Unforgettable Moments ❤️' },
            { type: 'image', src: 'images/20.jpeg', caption: 'Your Gorgeous Smile ✨' },
            { type: 'video', src: 'images/21.mp4', caption: 'Special Moment #1 💖' },
            { type: 'image', src: 'images/22.jpeg', caption: 'Hand in Hand Forever 🤝' },
            { type: 'video', src: 'images/23.mp4', caption: 'Sweet Video Clip #2 ✨' },
            { type: 'video', src: 'images/24.mp4', caption: 'Fun Memories #3 🌸' },
            { type: 'video', src: 'images/25.mp4', caption: 'Unforgettable Memory #4 🎉' },
            { type: 'video', src: 'images/26.mp4', caption: 'Adventures Together #5 🚀' },
            { type: 'video', src: 'images/27.mp4', caption: 'Golden Hours #6 🌅' },
            { type: 'image', src: 'images/34.jpeg', caption: 'Pure Happiness 💕' },
            { type: 'image', src: 'images/35.jpeg', caption: 'My Favorite View 🌸' },
            { type: 'image', src: 'images/38.jpeg', caption: 'Starlight Magic 🌟' },
            { type: 'image', src: 'images/46.jpeg', caption: 'Endless Laughs Together 😂' },
            { type: 'image', src: 'images/53.jpeg', caption: 'My Princess 👑' },
            { type: 'image', src: 'images/54.jpeg', caption: 'Always & Forever 💕' },
            { type: 'image', src: 'images/63.jpeg', caption: 'Precious Memories 🌹' },
            { type: 'image', src: 'images/64.jpeg', caption: 'Sweetest Person Ever 🥰' },
            { type: 'image', src: 'images/65.jpeg', caption: 'To Infinity and Beyond 🚀' },
            { type: 'image', src: 'images/WhatsApp Image 2026-07-31 at 17.06.18.jpeg', caption: 'Sunshine in My Life ☀️' },
            { type: 'image', src: 'images/WhatsApp Image 2026-07-31 at 17.06.13.jpeg', caption: 'My Whole Heart ❤️' },
            { type: 'image', src: 'images/WhatsApp Image 2026-07-31 at 17.06.12.jpeg', caption: 'Cute Moments With You 💖' },
            { type: 'video', src: 'images/WhatsApp Video 2026-07-31 at 17.06.17.mp4', caption: 'Special Recorded Reel 🎬💕' }
        ];

        // Interactive Love Quiz Data
        this.quizData = [
            {
                q: "What is my absolute favourite thing about you?",
                options: ["Your contagious smile", "Your gentle heart", "How smart you are", "EVERYTHING about you!"],
                correct: 3
            },
            {
                q: "What is our ideal weekend date?",
                options: ["Late night movie & cuddles", "Exploring a cute café", "Long drives with good music", "All of the above!"],
                correct: 3
            },
            {
                q: "How much do I love you?",
                options: ["To the moon and back", "More than words can say", "3,000 times over", "Infinitely & Forever!"],
                correct: 3
            }
        ];
        this.currentQuizIdx = 0;

        // Songs available for the persistent music player (in playback order)
        // Love Me JeJe & All The Love use the artists' official Audiomack uploads,
        // which stream the FULL track to every visitor, no login required.
        // "pov" isn't officially on Audiomack, so it stays on Spotify.
        this.songs = [
            {
                key: 'love-me-jeje',
                title: 'Love Me JeJe - Tems',
                platform: 'audiomack',
                embedUrl: 'https://audiomack.com/embed/song/temsbaby/love-me-jeje',
                height: 252,
                duration: 178 // 2:58
            },
            {
                key: 'pov',
                title: 'pov - Ariana Grande',
                platform: 'spotify',
                embedUrl: 'https://open.spotify.com/embed/track/3UoULw70kMsiVXxW0L3A33?utm_source=generator&theme=0',
                spotifyUri: 'spotify:track:3UoULw70kMsiVXxW0L3A33',
                height: 80,
                duration: 201 // 3:21 — used only as a safety-net timer; real end-detection comes from the Spotify iFrame API
            },
            {
                key: 'all-the-love',
                title: 'All The Love - Ayra Starr',
                platform: 'audiomack',
                embedUrl: 'https://audiomack.com/embed/song/ayrastarr/all-the-love-7293358',
                height: 252,
                duration: 188 // 3:08
            }
        ];
        this.currentSongIndex = 0;
        this.advanceTimer = null;

        this.init();
    }

    init() {
        this.bindPasscodeInputs();
        this.startCountdown();
        this.startTogetherCounter();
        this.renderQuiz();
        this.bindEvents();
        this.loadLocalStorageState();
    }

    bindPasscodeInputs() {
        const digits = document.querySelectorAll('.pass-digit');
        digits.forEach((input, idx) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= '0' && e.key <= '9') {
                    if (idx < digits.length - 1) digits[idx + 1].focus();
                } else if (e.key === 'Backspace') {
                    if (idx > 0) digits[idx - 1].focus();
                }
            });
        });
    }

    verifyPasscode() {
        const digits = document.querySelectorAll('.pass-digit');
        let entered = "";
        digits.forEach(d => entered += d.value);

        if (entered === this.correctPasscode) {
            const gate = document.getElementById('passcodeGate');
            if (gate) gate.classList.add('unlocked');
            if (window.synthEngine) window.synthEngine.playUnlockSFX();
            this.showToast("Welcome My Love! Secret Surprise Unlocked 💕");

            // This click is a real user gesture, so it's the earliest moment
            // the browser will actually allow audio to start with sound.
            this.startPlaybackFromGesture();
        } else {
            const err = document.getElementById('passcodeError');
            if (err) err.innerText = "Incorrect code! Think about the day we decided to try again 💕";
            if (window.synthEngine) window.synthEngine.playErrorSFX();
            digits.forEach(d => d.value = "");
            if (digits[0]) digits[0].focus();
        }
    }

    toggleVoiceNote() {
        const playIcon = document.getElementById('voicePlayIcon');
        
        if (this.isVoicePlaying) {
            this.pauseVoiceNote();
        } else {
            this.isVoicePlaying = true;
            if (playIcon) playIcon.className = "fa-solid fa-pause";
            if (window.synthEngine) window.synthEngine.playPopSFX();
            
            this.voiceTimerInterval = setInterval(() => {
                this.voiceCurrentTime++;
                this.updateVoiceUI();
                
                if (this.voiceCurrentTime >= this.voiceDuration) {
                    this.pauseVoiceNote();
                    this.voiceCurrentTime = 0;
                    this.updateVoiceUI();
                }
            }, 1000);
        }
    }

    pauseVoiceNote() {
        this.isVoicePlaying = false;
        const playIcon = document.getElementById('voicePlayIcon');
        if (playIcon) playIcon.className = "fa-solid fa-play";
        if (this.voiceTimerInterval) clearInterval(this.voiceTimerInterval);
    }

    updateVoiceUI() {
        const pct = (this.voiceCurrentTime / this.voiceDuration) * 100;
        const bar = document.getElementById('voiceProgressBar');
        if (bar) bar.style.width = `${pct}%`;
        
        const mins = Math.floor(this.voiceCurrentTime / 60);
        const secs = String(this.voiceCurrentTime % 60).padStart(2, '0');
        const timer = document.getElementById('voiceTimer');
        if (timer) timer.innerText = `${mins}:${secs} / 0:45`;
    }

    seekVoiceNote(e) {
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        this.voiceCurrentTime = Math.floor(pct * this.voiceDuration);
        this.updateVoiceUI();
    }

    voteDateNight(card, dateTitle) {
        document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Save choice in localStorage
        localStorage.setItem('voted_date_night', dateTitle);
        
        if (window.synthEngine) window.synthEngine.playChimeSFX();
        this.showToast(`Voted for: ${dateTitle}! It's a date! 🥂`);
    }

    bindEvents() {
        // Toggle Our Song Player (mini player)
        const musicBtn = document.getElementById('musicToggle');
        const audioBar = document.getElementById('floatingAudioBar');
        if (musicBtn && audioBar) {
            musicBtn.addEventListener('click', () => {
                const expanded = audioBar.classList.toggle('expanded');
                if (window.synthEngine) window.synthEngine.playPopSFX();
                musicBtn.innerHTML = expanded
                    ? '<i class="fa-solid fa-chevron-up"></i>'
                    : '<i class="fa-solid fa-music"></i>';
                if (expanded) this.startQueueTimer();
            });
        }

        // Song Switcher (works for both the floating player and the "Our Song" section)
        this.bindSongSwitcher();

        // Toggle Sound Effects
        const sfxBtn = document.getElementById('sfxToggle');
        if (sfxBtn) {
            sfxBtn.addEventListener('click', () => {
                if (!window.synthEngine) return;
                window.synthEngine.sfxEnabled = !window.synthEngine.sfxEnabled;
                sfxBtn.style.opacity = window.synthEngine.sfxEnabled ? "1" : "0.5";
                this.showToast(window.synthEngine.sfxEnabled ? "Sound Effects Enabled 🔊" : "Sound Effects Muted 🔇");
            });
        }

        // Toggle Love Envelope
        const envelope = document.getElementById('envelope');
        if (envelope) {
            envelope.addEventListener('click', () => {
                envelope.classList.toggle('open');
                if (window.synthEngine) window.synthEngine.playChimeSFX();

                if (envelope.classList.contains('open') && audioBar && !audioBar.classList.contains('expanded')) {
                    audioBar.classList.add('expanded');
                    if (musicBtn) musicBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
                    this.startQueueTimer();
                    this.showToast("Our song is waiting in the corner 🎵");
                }
            });
        }

        // Fleeing 'No' Button with Touch Safety for Mobile
        const noBtn = document.getElementById('noBtn');
        if (noBtn) {
            const triggerFlee = (e) => {
                e.preventDefault();
                this.moveNoButton();
            };
            noBtn.addEventListener('mouseover', triggerFlee);
            noBtn.addEventListener('touchstart', triggerFlee, { passive: false });
        }
    }

    setupSpotifyController(IFrameAPI) {
        const target = document.getElementById('spotifyPovPlayer');
        const povSong = this.songs.find(s => s.key === 'pov');
        if (!target || !povSong) return;

        IFrameAPI.createController(target, { width: 280, height: 80, uri: povSong.spotifyUri }, (controller) => {
            this.spotifyController = controller;
            this.spotifyReady = true;
            this._povStarted = false;

            // Real end-of-track detection for pov, straight from Spotify's own playback state
            controller.addListener('playback_update', (e) => {
                const { position, isPaused } = e.data;
                if (!isPaused && position > 0) this._povStarted = true;

                const onPov = this.songs[this.currentSongIndex].key === 'pov';
                if (onPov && this._povStarted && isPaused && position === 0) {
                    this._povStarted = false;
                    this.advancePastCurrent();
                }
            });

            // If pov is already the active track by the time the API finishes loading, get it playing
            if (this.songs[this.currentSongIndex].key === 'pov') {
                controller.play();
            }
        });
    }

    advancePastCurrent() {
        if (this._advancing) return;
        this._advancing = true;
        if (this.advanceTimer) clearTimeout(this.advanceTimer);
        this.playNextInQueue();
        setTimeout(() => { this._advancing = false; }, 500);
    }

    startPlaybackFromGesture() {
        const audioBar = document.getElementById('floatingAudioBar');
        const musicBtn = document.getElementById('musicToggle');
        if (audioBar && !audioBar.classList.contains('expanded')) {
            audioBar.classList.add('expanded');
            if (musicBtn) musicBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        }
        // Re-issuing this from directly inside the click handler (not a callback,
        // not a timeout) is what lets the browser treat it as user-initiated audio.
        this.loadTrack(this.currentSongIndex, { auto: true });
    }

    startQueueTimer() {
        const song = this.songs[this.currentSongIndex];
        if (!song) return;

        if (this.advanceTimer) clearTimeout(this.advanceTimer);

        if (song.platform === 'spotify' && this.spotifyReady && this.spotifyController) {
            this.spotifyController.play();
            // Safety-net only — real advance comes from the playback_update listener
            this.advanceTimer = setTimeout(() => this.advancePastCurrent(), (song.duration + 5) * 1000);
        } else {
            this.advanceTimer = setTimeout(() => this.playNextInQueue(), (song.duration + 2) * 1000);
        }
    }

    loadTrack(index, { auto = false } = {}) {
        const song = this.songs[index];
        if (!song) return;

        this.currentSongIndex = index;

        const audiomackFrame = document.getElementById('bgMusicPlayer');
        const spotifyContainer = document.getElementById('spotifyPovPlayer');

        if (this.advanceTimer) clearTimeout(this.advanceTimer);

        if (song.platform === 'spotify') {
            if (audiomackFrame) { audiomackFrame.style.display = 'none'; audiomackFrame.src = 'about:blank'; }
            if (spotifyContainer) spotifyContainer.style.display = 'block';
            this._povStarted = false;

            if (this.spotifyReady && this.spotifyController) {
                this.spotifyController.loadUri(song.spotifyUri);
                this.spotifyController.play();
                // Safety-net only — real advance comes from the playback_update listener
                this.advanceTimer = setTimeout(() => this.advancePastCurrent(), (song.duration + 5) * 1000);
            } else {
                // Spotify API hasn't finished loading yet — fall back to a plain iframe + timer just this once
                if (spotifyContainer) spotifyContainer.style.display = 'none';
                if (audiomackFrame) {
                    audiomackFrame.style.display = 'block';
                    audiomackFrame.src = song.embedUrl;
                    audiomackFrame.height = song.height;
                }
                this.advanceTimer = setTimeout(() => this.playNextInQueue(), (song.duration + 2) * 1000);
            }
        } else {
            if (spotifyContainer) spotifyContainer.style.display = 'none';
            if (this.spotifyController) this.spotifyController.pause();

            if (audiomackFrame) {
                audiomackFrame.style.display = 'block';
                audiomackFrame.src = song.embedUrl;
                audiomackFrame.height = song.height;
            }
            this.advanceTimer = setTimeout(() => this.playNextInQueue(), (song.duration + 2) * 1000);
        }

        const trackTitle = document.getElementById('trackTitle');
        if (trackTitle) trackTitle.innerText = song.title;

        document.querySelectorAll('.song-tab, .song-pick-card').forEach(el => {
            el.classList.toggle('active', el.dataset.trackKey === song.key);
        });

        if (!auto) {
            const audioBar = document.getElementById('floatingAudioBar');
            const musicBtn = document.getElementById('musicToggle');
            if (audioBar && !audioBar.classList.contains('expanded')) {
                audioBar.classList.add('expanded');
                if (musicBtn) musicBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
            }
            if (window.synthEngine) window.synthEngine.playChimeSFX();
            this.showToast(`Now Playing: ${song.title} 🎵 — tap play in the corner!`);
        }
    }

    playNextInQueue() {
        const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadTrack(nextIndex, { auto: true });
        this.showToast(`Now Playing: ${this.songs[nextIndex].title} 🎵`);
    }

    bindSongSwitcher() {
        document.querySelectorAll('.song-tab, .song-pick-card').forEach(el => {
            el.addEventListener('click', () => {
                const key = el.dataset.trackKey;
                const idx = this.songs.findIndex(s => s.key === key);
                if (idx !== -1) this.loadTrack(idx);
            });
        });
    }

    startCountdown() {
        const startDate = new Date("2026-07-07T00:00:00").getTime();

        setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.max(0, now - startDate);

            const daysEl = document.getElementById('daysNum');
            const hoursEl = document.getElementById('hoursNum');
            const minsEl = document.getElementById('minsNum');
            const secsEl = document.getElementById('secsNum');

            if (daysEl) daysEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
            if (hoursEl) hoursEl.innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            if (minsEl) minsEl.innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            if (secsEl) secsEl.innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        }, 1000);
    }

    startTogetherCounter() {
        const startDate = new Date("2026-07-07T00:00:00").getTime();

        const update = () => {
            const now = new Date().getTime();
            const days = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
            const el = document.getElementById('togetherText');
            if (el) el.innerText = `Together Since July 7, 2026 • ${days} Day${days === 1 ? '' : 's'} & Counting`;
        };

        update();
        setInterval(update, 60000);
    }

    revealReason(card, index) {
        if (card) {
            const isRevealed = card.classList.toggle('revealed');
            if (window.synthEngine) window.synthEngine.playPopSFX();

            if (isRevealed) {
                localStorage.setItem(`reason_revealed_${index}`, 'true');
                this.showToast(`Revealed Reason #${index} 💕`);
            } else {
                localStorage.removeItem(`reason_revealed_${index}`);
            }
        }
    }

    redeemCoupon(id, title) {
        const coupon = document.getElementById(id);
        if (coupon && !coupon.classList.contains('redeemed')) {
            coupon.classList.add('redeemed');
            const btn = coupon.querySelector('.btn-coupon');
            if (btn) btn.innerText = "Coupon Redeemed! ✔️";
            
            // Save in localStorage
            localStorage.setItem(`coupon_${id}`, 'redeemed');

            if (window.synthEngine) window.synthEngine.playChimeSFX();
            this.showToast(`Redeemed: ${title} 🎉`);
            
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 40,
                    spread: 70,
                    origin: { y: 0.8 },
                    colors: ['#ff4b72', '#ffd166', '#ffffff']
                });
            }
        }
    }

    toggleBucketItem(id, title) {
        const item = document.getElementById(id);
        if (item) {
            item.classList.toggle('completed');
            const isDone = item.classList.contains('completed');
            
            localStorage.setItem(`bucket_${id}`, isDone ? 'completed' : 'pending');
            
            if (isDone) {
                if (window.synthEngine) window.synthEngine.playChimeSFX();
                this.showToast(`Completed Dream: ${title}! ✨`);
            } else {
                if (window.synthEngine) window.synthEngine.playPopSFX();
            }

            this.updateBucketProgress();
        }
    }

    updateBucketProgress() {
        const total = document.querySelectorAll('.bucket-item').length;
        const done = document.querySelectorAll('.bucket-item.completed').length;
        const pct = (done / total) * 100;

        const progressBar = document.getElementById('bucketProgressBar');
        const statusText = document.getElementById('bucketStatusText');

        if (progressBar) progressBar.style.width = `${pct}%`;
        if (statusText) statusText.innerText = `${done} of ${total} Dreams Completed 💕`;
    }

    loadLocalStorageState() {
        // Restore Redeemed Coupons
        ['coupon1', 'coupon2', 'coupon3', 'coupon4'].forEach(id => {
            if (localStorage.getItem(`coupon_${id}`) === 'redeemed') {
                const coupon = document.getElementById(id);
                if (coupon) {
                    coupon.classList.add('redeemed');
                    const btn = coupon.querySelector('.btn-coupon');
                    if (btn) btn.innerText = "Coupon Redeemed! ✔️";
                }
            }
        });

        // Restore Bucket List Checked Items
        ['bucket1', 'bucket2', 'bucket3', 'bucket4', 'bucket5', 'bucket6'].forEach(id => {
            if (localStorage.getItem(`bucket_${id}`) === 'completed') {
                const item = document.getElementById(id);
                if (item) item.classList.add('completed');
            }
        });
        this.updateBucketProgress();

        // Restore Reasons
        document.querySelectorAll('.reason-card').forEach((card, idx) => {
            if (localStorage.getItem(`reason_revealed_${idx + 1}`) === 'true') {
                card.classList.add('revealed');
            }
        });
    }

    renderQuiz() {
        const quiz = this.quizData[this.currentQuizIdx];
        const quizStep = document.getElementById('quizStep');
        const quizQuestion = document.getElementById('quizQuestion');
        const optionsContainer = document.getElementById('quizOptions');

        if (quizStep) quizStep.innerText = `Question ${this.currentQuizIdx + 1} of ${this.quizData.length}`;
        if (quizQuestion) quizQuestion.innerText = quiz.q;

        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            quiz.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerText = `${String.fromCharCode(65 + idx)}. ${opt}`;
                btn.onclick = () => this.handleQuizAnswer(idx);
                optionsContainer.appendChild(btn);
            });
        }
    }

    handleQuizAnswer(selectedIdx) {
        if (window.synthEngine) window.synthEngine.playPopSFX();
        this.showToast("Correct Answer! ❤️");

        if (this.currentQuizIdx < this.quizData.length - 1) {
            this.currentQuizIdx++;
            this.renderQuiz();
        } else {
            const quizContainer = document.getElementById('quizContainer');
            if (quizContainer) {
                quizContainer.innerHTML = `
                    <div style="padding: 20px;">
                        <i class="fa-solid fa-award" style="font-size: 3rem; color: #ffd166;"></i>
                        <h3 style="margin-top: 10px; font-size: 1.5rem;">100% Relationship Score! 🎉</h3>
                        <p style="color: var(--text-sub);">You know us better than anyone else in the world!</p>
                    </div>
                `;
            }
        }
    }

    moveNoButton() {
        const noBtn = document.getElementById('noBtn');
        if (!noBtn) return;
        
        // Mobile-safe bounded random positioning
        const maxOffset = Math.min(window.innerWidth / 2 - 80, 150);
        const randomX = (Math.random() - 0.5) * (maxOffset * 2);
        const randomY = (Math.random() - 0.5) * 160;

        noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        if (window.synthEngine) window.synthEngine.playPopSFX();
    }

    celebrateLove() {
        if (window.synthEngine) window.synthEngine.playChimeSFX();
        const modal = document.getElementById('celebrationModal');
        if (modal) modal.classList.add('active');

        if (typeof confetti === 'function') {
            const duration = 4 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 6,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ff4b72', '#ff85a2', '#ffd166']
                });
                confetti({
                    particleCount: 6,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ff4b72', '#ff85a2', '#ffd166']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    closeCelebration() {
        const modal = document.getElementById('celebrationModal');
        if (modal) modal.classList.remove('active');
    }

    openLightbox(src, caption) {
        const img = document.getElementById('lightboxImg');
        const cap = document.getElementById('lightboxCaption');
        const modal = document.getElementById('lightboxModal');

        if (img) img.src = src;
        if (cap) cap.innerText = caption;
        if (modal) modal.classList.add('active');
        if (window.synthEngine) window.synthEngine.playPopSFX();
    }

    closeLightbox() {
        const modal = document.getElementById('lightboxModal');
        if (modal) modal.classList.remove('active');
    }

    showToast(message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Spotify iFrame API calls this globally once it has loaded — wires it into the pov controller only
window.onSpotifyIframeApiReady = (IFrameAPI) => {
    if (window.appUI) window.appUI.setupSpotifyController(IFrameAPI);
};

// Initialize application on load
window.appUI = new AppUI();