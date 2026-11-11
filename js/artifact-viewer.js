/**
 * VirtualVerse – Cosmic Archive
 * js/artifact-viewer.js
 * Dedicated 360° 3D Interactive Artifact Studio & Audio Guide
 */

class ArtifactViewerStudio {
  constructor() {
    this.container = document.getElementById('viewer-3d-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;

    this.currentArtifact = null;
    this.modelGroup = null;

    // View Options
    this.autoRotate = true;
    this.wireframeMode = false;
    this.activeLighting = 'studio';

    // Lights
    this.dirLight = null;
    this.ambientLight = null;
    this.accentLight = null;

    // Audio narration
    this.isNarrating = false;
    this.speechUtterance = null;

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupLighting();

    // Parse artifact ID from URL query ?id=art-01
    const params = new URLSearchParams(window.location.search);
    const artId = params.get('id') || 'art-01';

    this.loadArtifact(artId);
    this.bindStudioUI();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070914);
    this.scene.fog = new THREE.FogExp2(0x070914, 0.035);

    // Subtle cosmic backdrop particles
    const partCount = 400;
    const partGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 40;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.12, color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    this.scene.add(new THREE.Points(partGeo, partMat));
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 1.2, 4.2);
  }

  setupControls() {
    if (window.THREE && THREE.OrbitControls) {
      this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.05;
      this.orbitControls.autoRotate = this.autoRotate;
      this.orbitControls.autoRotateSpeed = 2.0;
      this.orbitControls.minDistance = 1.5;
      this.orbitControls.maxDistance = 12;
      this.orbitControls.target.set(0, 0, 0);
    }
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.dirLight.position.set(5, 8, 6);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    this.accentLight = new THREE.PointLight(0x00e5ff, 1.2, 20);
    this.accentLight.position.set(-4, -2, -3);
    this.scene.add(this.accentLight);
  }

  setLightingPreset(preset) {
    this.activeLighting = preset;
    if (preset === 'studio') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.8;
      this.dirLight.color.setHex(0xffffff);
      this.accentLight.color.setHex(0x00e5ff);
      this.scene.background.setHex(0x070914);
    } else if (preset === 'neon') {
      this.ambientLight.color.setHex(0x8b5cf6);
      this.ambientLight.intensity = 0.5;
      this.dirLight.color.setHex(0x00e5ff);
      this.accentLight.color.setHex(0xec4899);
      this.scene.background.setHex(0x090514);
    } else if (preset === 'amber') {
      this.ambientLight.color.setHex(0xf59e0b);
      this.ambientLight.intensity = 0.6;
      this.dirLight.color.setHex(0xffedd5);
      this.accentLight.color.setHex(0xd97706);
      this.scene.background.setHex(0x140e07);
    }
    window.VirtualVerseApp?.showToast(`Lighting calibrated to ${preset.toUpperCase()} spectrum.`, 'info');
  }

  loadArtifact(id) {
    const art = window.StorageManager.getArtifactById(id);
    if (!art) {
      window.VirtualVerseApp?.showToast('Artifact not found in Cosmic Registry.', 'error');
      return;
    }

    this.currentArtifact = art;
    window.StorageManager.recordArtifactView(art.id);

    // Remove existing model
    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
    }

    // Build fresh model using procedural factory
    this.modelGroup = window.ProceduralModelFactory.createModel(art.modelType);
    this.modelGroup.position.set(0, 0, 0);
    this.modelGroup.scale.set(1.4, 1.4, 1.4);
    this.scene.add(this.modelGroup);

    // Reset controls target
    if (this.orbitControls) {
      this.orbitControls.target.set(0, 0, 0);
      this.camera.position.set(0, 0.8, 3.8);
    }

    this.renderArtifactDossier(art);
    this.renderRelatedExhibits(art);
  }

  renderArtifactDossier(art) {
    document.title = `${art.name} – VirtualVerse 3D Studio`;

    const titleEl = document.getElementById('viewer-artifact-title');
    const badgeEl = document.getElementById('viewer-category-badge');
    const periodEl = document.getElementById('viewer-period');
    const originEl = document.getElementById('viewer-origin');
    const descEl = document.getElementById('viewer-description');
    const matEl = document.getElementById('viewer-material');
    const dimEl = document.getElementById('viewer-dimensions');
    const sigEl = document.getElementById('viewer-significance');
    const discEl = document.getElementById('viewer-discovery');
    const factsList = document.getElementById('viewer-facts-list');
    const favBtn = document.getElementById('viewer-favorite-btn');

    if (titleEl) titleEl.textContent = art.name;
    if (badgeEl) badgeEl.textContent = art.category;
    if (periodEl) periodEl.textContent = art.historicalPeriod;
    if (originEl) originEl.textContent = art.origin;
    if (descEl) descEl.textContent = art.description;
    if (matEl) matEl.textContent = art.material;
    if (dimEl) dimEl.textContent = art.dimensions;
    if (sigEl) sigEl.textContent = art.significance;
    if (discEl) discEl.textContent = art.discoveryInfo;

    if (factsList && art.funFacts) {
      factsList.innerHTML = art.funFacts.map(f => `<li><i class="fa-solid fa-atom"></i> ${f}</li>`).join('');
    }

    if (favBtn) {
      const isFav = window.StorageManager.isFavorite(art.id);
      favBtn.className = `cyber-btn ${isFav ? 'btn-primary' : 'btn-ghost'}`;
      favBtn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i> ${isFav ? 'Bookmarked' : 'Add to Favorites'}`;
    }
  }

  renderRelatedExhibits(currentArt) {
    const container = document.getElementById('related-exhibits-row');
    if (!container) return;

    const all = window.StorageManager.getArtifacts();
    // Prefer same category or collection
    const related = all
      .filter(a => a.id !== currentArt.id && (a.category === currentArt.category || a.roomId === currentArt.roomId))
      .slice(0, 4);

    container.innerHTML = related.map(rel => `
      <a href="artifact-viewer.html?id=${rel.id}" class="related-card">
        <div class="related-icon"><i class="fa-solid fa-cube"></i></div>
        <div class="related-info">
          <h4>${rel.name}</h4>
          <small>${rel.historicalPeriod}</small>
        </div>
      </a>
    `).join('');
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    if (this.modelGroup) {
      this.modelGroup.traverse(child => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.wireframe = this.wireframeMode);
          } else {
            child.material.wireframe = this.wireframeMode;
          }
        }
      });
    }
    window.VirtualVerseApp?.showToast(this.wireframeMode ? 'Wireframe Hologram Engaged' : 'Surface Solid Shader Engaged', 'info');
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    if (this.orbitControls) {
      this.orbitControls.autoRotate = this.autoRotate;
    }
    const btn = document.getElementById('btn-toggle-rotate');
    if (btn) {
      btn.classList.toggle('active', this.autoRotate);
    }
  }

  resetCamera() {
    if (this.orbitControls) {
      this.orbitControls.reset();
      this.camera.position.set(0, 0.8, 3.8);
      this.orbitControls.target.set(0, 0, 0);
      window.VirtualVerseApp?.showToast('Camera focus reset to neutral horizon.', 'info');
    }
  }

  toggleAudioNarration() {
    const btn = document.getElementById('btn-audio-narrate');
    if (!('speechSynthesis' in window)) {
      window.VirtualVerseApp?.showToast('Audio narration speech engine unavailable on this browser.', 'error');
      return;
    }

    if (this.isNarrating) {
      window.speechSynthesis.cancel();
      this.isNarrating = false;
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-headphones"></i> Listen to Audio Guide';
        btn.classList.remove('active');
      }
      window.VirtualVerseApp?.showToast('Audio narration halted.', 'info');
    } else {
      if (!this.currentArtifact) return;

      const speechText = `${this.currentArtifact.name}. Origin: ${this.currentArtifact.origin}. Period: ${this.currentArtifact.historicalPeriod}. ${this.currentArtifact.description} Cultural significance: ${this.currentArtifact.significance}`;

      this.speechUtterance = new SpeechSynthesisUtterance(speechText);
      this.speechUtterance.rate = 0.95;
      this.speechUtterance.pitch = 1.0;

      this.speechUtterance.onend = () => {
        this.isNarrating = false;
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-headphones"></i> Listen to Audio Guide';
          btn.classList.remove('active');
        }
      };

      window.speechSynthesis.speak(this.speechUtterance);
      this.isNarrating = true;
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Audio Guide';
        btn.classList.add('active');
      }
      window.VirtualVerseApp?.showToast('Playing synthesized audio guide...', 'info');
    }
  }

  bindStudioUI() {
    // Auto-rotate button
    document.getElementById('btn-toggle-rotate')?.addEventListener('click', () => this.toggleAutoRotate());

    // Wireframe button
    document.getElementById('btn-toggle-wireframe')?.addEventListener('click', () => this.toggleWireframe());

    // Reset Camera button
    document.getElementById('btn-reset-cam')?.addEventListener('click', () => this.resetCamera());

    // Audio Guide button
    document.getElementById('btn-audio-narrate')?.addEventListener('click', () => this.toggleAudioNarration());

    // Lighting preset buttons
    document.querySelectorAll('.light-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.light-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setLightingPreset(btn.getAttribute('data-preset'));
      });
    });

    // Favorite Button
    document.getElementById('viewer-favorite-btn')?.addEventListener('click', (e) => {
      if (!this.currentArtifact) return;
      const res = window.StorageManager.toggleFavorite(this.currentArtifact.id);
      const btn = e.currentTarget;
      btn.className = `cyber-btn ${res.added ? 'btn-primary' : 'btn-ghost'}`;
      btn.innerHTML = `<i class="fa-${res.added ? 'solid' : 'regular'} fa-bookmark"></i> ${res.added ? 'Bookmarked' : 'Add to Favorites'}`;
      window.VirtualVerseApp?.showToast(res.added ? 'Added to Favorites!' : 'Removed from Favorites', 'info');
    });

    // Full-screen Studio button
    document.getElementById('btn-viewer-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    if (this.orbitControls) {
      this.orbitControls.update();
    }

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
  if (document.getElementById('viewer-3d-canvas-container')) {
    window.ArtifactViewerApp = new ArtifactViewerStudio();
  }
});