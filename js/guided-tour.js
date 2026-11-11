/**
 * VirtualVerse – Cosmic Archive
 * js/guided-tour.js
 * Automated Virtual Guided Tour Engine
 * Cinematic 3D camera transitions, typewriter narration, audio voice synthesis,
 * Play, Pause, Next, Prev, and Progress Bar.
 */

class GuidedTourEngine {
  constructor() {
    this.container = document.getElementById('tour-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.tourExhibits = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.autoAdvanceTimer = null;
    this.stepDuration = 12000; // 12 seconds per exhibit in auto play
    this.remainingTime = 12000;
    this.timerStartTime = null;

    // 3D Object state
    this.currentModelGroup = null;
    this.cameraTargetPos = new THREE.Vector3(0, 1.2, 4.0);

    // Audio narration
    this.speechUtterance = null;
    this.isVoiceMuted = false;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    this.setupLighting();

    // Curate flagship tour exhibits across categories
    const all = window.StorageManager.getArtifacts();
    const curatedIds = ['art-01', 'art-06', 'art-11', 'art-14', 'art-18', 'art-22'];
    this.tourExhibits = curatedIds.map(id => all.find(a => a.id === id)).filter(Boolean);

    if (this.tourExhibits.length === 0) {
      this.tourExhibits = all.slice(0, 6);
    }

    this.bindControls();
    this.loadTourStep(0);
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070914);
    this.scene.fog = new THREE.FogExp2(0x070914, 0.025);

    // Floating Cosmic Nebula particles
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 50;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.16, color: 0x00e5ff, transparent: true, opacity: 0.5 });
    this.scene.add(new THREE.Points(geo, mat));

    // Holographic floor platform
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.6, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x101426, metalness: 0.8, roughness: 0.3 })
    );
    floor.position.y = -1.2;
    this.scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.04, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 1 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.08;
    this.scene.add(ring);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.0);
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 6, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00e5ff, 1.2, 15);
    rimLight.position.set(-3, -1, -2);
    this.scene.add(rimLight);
  }

  loadTourStep(index) {
    if (index < 0 || index >= this.tourExhibits.length) return;
    this.currentIndex = index;
    const art = this.tourExhibits[index];

    window.StorageManager.recordArtifactView(art.id);
    window.VirtualVerseApp?.sound.playTeleport();

    // Replace 3D Model
    if (this.currentModelGroup) {
      this.scene.remove(this.currentModelGroup);
    }

    this.currentModelGroup = window.ProceduralModelFactory.createModel(art.modelType);
    this.currentModelGroup.position.set(0, 0, 0);
    this.currentModelGroup.scale.set(1.3, 1.3, 1.3);
    this.scene.add(this.currentModelGroup);

    // Dynamic Camera sweep effect
    this.camera.position.set(
      (Math.random() - 0.5) * 2,
      1.0 + Math.random() * 0.8,
      4.2 + Math.random() * 0.8
    );
    this.cameraTargetPos.set(0, 0.8, 4.0);

    // Update Narration UI
    this.updateNarrationUI(art);
    this.speakNarration(art);

    // Handle timer for auto advancement if playing
    if (this.isPlaying) {
      this.resetStepTimer();
    }
  }

  updateNarrationUI(art) {
    const titleEl = document.getElementById('tour-exhibit-title');
    const badgeEl = document.getElementById('tour-step-badge');
    const categoryEl = document.getElementById('tour-category-badge');
    const periodEl = document.getElementById('tour-period-text');
    const descEl = document.getElementById('tour-narration-body');
    const progressFill = document.getElementById('tour-progress-bar-fill');
    const totalEl = document.getElementById('tour-total-steps');
    const currentEl = document.getElementById('tour-current-step');

    if (titleEl) titleEl.textContent = art.name;
    if (badgeEl) badgeEl.textContent = `Exhibit ${this.currentIndex + 1} of ${this.tourExhibits.length}`;
    if (categoryEl) categoryEl.textContent = art.category;
    if (periodEl) periodEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${art.historicalPeriod} &bull; <i class="fa-solid fa-location-dot"></i> ${art.origin}`;
    if (totalEl) totalEl.textContent = this.tourExhibits.length;
    if (currentEl) currentEl.textContent = this.currentIndex + 1;

    // Progress percentage
    if (progressFill) {
      const pct = ((this.currentIndex + 1) / this.tourExhibits.length) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Typewriter effect for narration
    if (descEl) {
      descEl.textContent = '';
      const fullText = `${art.description} Cultural Significance: ${art.significance}`;
      let charIdx = 0;
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = setInterval(() => {
        if (charIdx < fullText.length) {
          descEl.textContent += fullText[charIdx];
          charIdx++;
        } else {
          clearInterval(this.typewriterInterval);
        }
      }, 18);
    }
  }

  speakNarration(art) {
    if (this.isVoiceMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = `Exhibit ${this.currentIndex + 1}. ${art.name}. From ${art.origin}, dated ${art.historicalPeriod}. ${art.description}`;
    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.speechUtterance.rate = 0.95;
    this.speechUtterance.pitch = 1.0;
    window.speechSynthesis.speak(this.speechUtterance);
  }

  play() {
    this.isPlaying = true;
    const playBtn = document.getElementById('tour-play-pause-btn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    }
    this.resetStepTimer();
    window.VirtualVerseApp?.showToast('Guided Tour in progress. Auto-gliding across cosmic exhibits.', 'info');
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.autoAdvanceTimer);
    const playBtn = document.getElementById('tour-play-pause-btn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    window.VirtualVerseApp?.showToast('Tour paused.', 'info');
  }

  resetStepTimer() {
    clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = setTimeout(() => {
      this.next();
    }, this.stepDuration);
  }

  next() {
    if (this.currentIndex < this.tourExhibits.length - 1) {
      this.loadTourStep(this.currentIndex + 1);
    } else {
      // Completed Tour!
      this.pause();
      window.StorageManager.recordTourCompleted();
      window.VirtualVerseApp?.showToast('Tour Completed! Achievement "Guided Voyager" unlocked!', 'achievement');

      // Prompt to replay or explore museum
      window.VirtualVerseApp?.showConfirm(
        'Tour Journey Concluded',
        'You have traversed the flagship exhibits of VirtualVerse! Would you like to enter the free-roaming 3D museum chambers?',
        () => { window.location.href = 'museum.html'; },
        'Enter 3D Museum',
        'Replay Tour'
      );
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.loadTourStep(this.currentIndex - 1);
    }
  }

  bindControls() {
    document.getElementById('tour-play-pause-btn')?.addEventListener('click', () => {
      if (this.isPlaying) this.pause();
      else this.play();
    });

    document.getElementById('tour-next-btn')?.addEventListener('click', () => {
      this.next();
    });

    document.getElementById('tour-prev-btn')?.addEventListener('click', () => {
      this.prev();
    });

    // Voice Narration Mute Toggle
    const voiceBtn = document.getElementById('tour-voice-toggle-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.isVoiceMuted = !this.isVoiceMuted;
        if (this.isVoiceMuted && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        } else if (!this.isVoiceMuted) {
          this.speakNarration(this.tourExhibits[this.currentIndex]);
        }
        voiceBtn.innerHTML = `<i class="fa-solid fa-${this.isVoiceMuted ? 'volume-xmark' : 'volume-high'}"></i> ${this.isVoiceMuted ? 'Voice Off' : 'Voice On'}`;
      });
    }

    // Inspect in Studio button
    document.getElementById('tour-inspect-studio-btn')?.addEventListener('click', () => {
      const art = this.tourExhibits[this.currentIndex];
      if (art) {
        window.location.href = `artifact-viewer.html?id=${art.id}`;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.currentModelGroup) {
      this.currentModelGroup.rotation.y += 0.007;
    }

    this.camera.position.lerp(this.cameraTargetPos, 0.03);
    this.camera.lookAt(0, 0.2, 0);

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tour-canvas-container')) {
    window.GuidedTourApp = new GuidedTourEngine();
  }
});