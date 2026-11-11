/**
 * VirtualVerse – Cosmic Archive
 * js/app.js
 * Global Application Engine: Web Audio Synthesizer, Toasts, Universal Modals, Search HUD, Navigation
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('vv_audio_muted') === 'true';
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.isAmbientPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('vv_audio_muted', this.muted);
    if (this.muted && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!this.muted && this.ambientGain && this.isAmbientPlaying) {
      this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    }
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  }

  playHover() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playTeleport() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }

  playSuccess() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.28);
      });
    } catch (e) {}
  }

  playError() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [220, 185].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.06, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.2);
      });
    } catch (e) {}
  }

  startAmbientDrone() {
    if (this.isAmbientPlaying || !window.AudioContext) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.muted ? 0 : 0.035, this.ctx.currentTime);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(98.0, this.ctx.currentTime); // G2

      // Subtle low-pass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {}
  }
}

class VirtualVerseApp {
  constructor() {
    this.sound = new SoundEngine();
    this.activeSearchModal = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindSoundTriggers();
      this.setupGlobalSearch();
      this.setupNavbarUser();
      this.setupKeyboardShortcuts();
      this.setupCustomCursor();
    });
  }

  bindSoundTriggers() {
    document.body.addEventListener('click', (e) => {
      if (e.target.closest('button, .cyber-btn, .nav-link, .card-interactive, .artifact-card, .portal-card')) {
        this.sound.playClick();
      }
    });

    document.body.addEventListener('mouseenter', (e) => {
      if (e.target.closest('button, .cyber-btn, .nav-link, .collection-card')) {
        this.sound.playHover();
      }
    }, true);

    // Resume audio on first user interaction
    const unlockAudio = () => {
      this.sound.initContext();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  /* ----------------- TOAST SYSTEM ----------------- */
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `cyber-toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') {
      icon = 'fa-check-circle';
      this.sound.playSuccess();
    } else if (type === 'error') {
      icon = 'fa-triangle-exclamation';
      this.sound.playError();
    } else if (type === 'achievement') {
      icon = 'fa-trophy';
      this.sound.playSuccess();
    }

    toast.innerHTML = `
      <div class="toast-glow"></div>
      <i class="fa-solid ${icon} toast-icon"></i>
      <div class="toast-body">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  /* ----------------- CONFIRMATION / MODAL SYSTEM ----------------- */
  showConfirm(title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') {
    const overlay = document.createElement('div');
    overlay.className = 'cyber-modal-overlay';
    overlay.innerHTML = `
      <div class="cyber-modal">
        <div class="modal-corner top-left"></div>
        <div class="modal-corner bottom-right"></div>
        <div class="modal-header">
          <i class="fa-solid fa-triangle-exclamation modal-icon"></i>
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-actions">
          <button class="cyber-btn btn-ghost modal-cancel-btn">${cancelText}</button>
          <button class="cyber-btn btn-danger modal-confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.sound.playClick();

    const cleanup = () => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 250);
    };

    overlay.querySelector('.modal-cancel-btn').addEventListener('click', () => {
      cleanup();
    });

    overlay.querySelector('.modal-confirm-btn').addEventListener('click', () => {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }

  /* ----------------- GLOBAL SEARCH MODAL ----------------- */
  setupGlobalSearch() {
    // Create global search modal HTML
    const searchModal = document.createElement('div');
    searchModal.id = 'global-search-modal';
    searchModal.className = 'search-modal-overlay';
    searchModal.innerHTML = `
      <div class="search-modal-container">
        <div class="search-box-bar">
          <i class="fa-solid fa-magnifying-glass search-bar-icon"></i>
          <input type="text" id="global-search-input" placeholder="Search 32+ artifacts, collections, periods, materials..." autocomplete="off">
          <span class="esc-badge">ESC</span>
        </div>
        <div class="search-filters-row">
          <button class="search-filter-tag active" data-cat="all">All</button>
          <button class="search-filter-tag" data-cat="Ancient Civilizations">Ancient</button>
          <button class="search-filter-tag" data-cat="Space and Astronomy">Space</button>
          <button class="search-filter-tag" data-cat="Science and Technology">Science</button>
          <button class="search-filter-tag" data-cat="Digital Art Gallery">Digital Art</button>
          <button class="search-filter-tag" data-cat="Historical Artifacts">History</button>
        </div>
        <div id="search-modal-results" class="search-modal-results">
          <div class="search-empty-prompt">
            <i class="fa-solid fa-compass"></i>
            <p>Type to search the Cosmic Archive across all civilisations & epochs...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);

    const input = searchModal.querySelector('#global-search-input');
    const resultsContainer = searchModal.querySelector('#search-modal-results');
    const filterTags = searchModal.querySelectorAll('.search-filter-tag');

    let activeCategory = 'all';

    const renderResults = (query) => {
      const artifacts = window.StorageManager ? window.StorageManager.getArtifacts() : [];
      const cleanQuery = query.trim().toLowerCase();

      let filtered = artifacts;
      if (activeCategory !== 'all') {
        filtered = filtered.filter(a => a.category === activeCategory);
      }
      if (cleanQuery) {
        filtered = filtered.filter(a => 
          a.name.toLowerCase().includes(cleanQuery) ||
          a.category.toLowerCase().includes(cleanQuery) ||
          a.origin.toLowerCase().includes(cleanQuery) ||
          a.historicalPeriod.toLowerCase().includes(cleanQuery) ||
          a.material.toLowerCase().includes(cleanQuery)
        );
      }

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-empty-prompt">
            <i class="fa-solid fa-ghost"></i>
            <p>No matching artifacts found for "${query}". Try adjusting keywords.</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = filtered.slice(0, 8).map(art => `
        <a href="artifact-viewer.html?id=${art.id}" class="search-result-item">
          <div class="result-badge"><i class="fa-solid fa-cube"></i></div>
          <div class="result-info">
            <div class="result-title">${art.name}</div>
            <div class="result-meta">${art.category} &bull; ${art.historicalPeriod} &bull; ${art.origin}</div>
          </div>
          <div class="result-cta">
            <span>Inspect 3D</span>
            <i class="fa-solid fa-chevron-right"></i>
          </div>
        </a>
      `).join('');
    };

    input.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        activeCategory = tag.getAttribute('data-cat');
        renderResults(input.value);
      });
    });

    // Close on click outside
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        this.closeSearchModal();
      }
    });
  }

  openSearchModal() {
    const modal = document.getElementById('global-search-modal');
    if (modal) {
      modal.classList.add('active');
      const input = modal.querySelector('#global-search-input');
      if (input) {
        input.value = '';
        input.focus();
        // Trigger initial results
        input.dispatchEvent(new Event('input'));
      }
      this.sound.playHover();
    }
  }

  closeSearchModal() {
    const modal = document.getElementById('global-search-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Open search on Ctrl+K or '/'
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        this.openSearchModal();
      }
      // Close search on ESC
      if (e.key === 'Escape') {
        this.closeSearchModal();
      }
    });
  }

  /* ----------------- NAVBAR & USER SESSION ----------------- */
  setupNavbarUser() {
    const userContainer = document.getElementById('nav-user-slot');
    if (!userContainer) return;

    const user = window.StorageManager ? window.StorageManager.getCurrentUser() : null;
    const isGuest = !user || user.role === 'guest';

    if (isGuest) {
      userContainer.innerHTML = `
        <div class="nav-auth-buttons">
          <a href="login.html" class="cyber-btn btn-ghost btn-sm">Sign In</a>
          <a href="register.html" class="cyber-btn btn-primary btn-sm">Register</a>
        </div>
      `;
    } else {
      userContainer.innerHTML = `
        <div class="nav-user-profile dropdown-parent">
          <button class="nav-user-badge" id="nav-user-dropdown-btn">
            <div class="user-avatar-mini">
              <i class="fa-solid fa-user-astronaut"></i>
            </div>
            <span class="user-display-name">${user.name.split(' ')[0]}</span>
            ${user.role === 'admin' ? '<span class="admin-pill">Curator</span>' : ''}
            <i class="fa-solid fa-angle-down"></i>
          </button>
          <div class="dropdown-menu user-dropdown">
            <div class="dropdown-header">
              <strong>${user.name}</strong>
              <small>${user.email}</small>
            </div>
            <a href="profile.html" class="dropdown-item"><i class="fa-solid fa-id-badge"></i> My Profile & Badges</a>
            <a href="favorites.html" class="dropdown-item"><i class="fa-solid fa-bookmark"></i> Saved Artifacts</a>
            ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item admin-link"><i class="fa-solid fa-solar-panel"></i> Admin Curator Hall</a>' : ''}
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout-btn" id="nav-logout-action"><i class="fa-solid fa-power-off"></i> Logout</button>
          </div>
        </div>
      `;

      const logoutBtn = document.getElementById('nav-logout-action');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (window.StorageManager) {
            window.StorageManager.logout();
            this.showToast('You have signed out into Guest Mode.', 'info');
            setTimeout(() => window.location.reload(), 600);
          }
        });
      }
    }

    // Audio toggle button in nav
    const audioBtn = document.getElementById('nav-audio-toggle');
    if (audioBtn) {
      const updateAudioIcon = () => {
        audioBtn.innerHTML = this.sound.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        audioBtn.title = this.sound.muted ? 'Unmute Audio Experience' : 'Mute Audio';
      };
      updateAudioIcon();
      audioBtn.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        updateAudioIcon();
        this.showToast(isMuted ? 'Cosmic Audio Muted' : 'Cosmic Audio Active', 'info');
      });
    }

    // Bind search trigger button in nav
    const navSearchBtn = document.getElementById('nav-search-btn');
    if (navSearchBtn) {
      navSearchBtn.addEventListener('click', () => this.openSearchModal());
    }
  }

  setupCustomCursor() {
    // Custom cursor aura on desktop pointer devices
    if (window.matchMedia('(pointer: fine)').matches) {
      const dot = document.createElement('div');
      dot.className = 'cyber-cursor-dot';
      const aura = document.createElement('div');
      aura.className = 'cyber-cursor-aura';
      document.body.appendChild(dot);
      document.body.appendChild(aura);

      window.addEventListener('mousemove', (e) => {
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        aura.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    }
  }
}

// Instantiate globally
window.VirtualVerseApp = new VirtualVerseApp();