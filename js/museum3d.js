/**
 * VirtualVerse – Cosmic Archive
 * js/museum3d.js
 * Core Three.js 3D Virtual Museum Engine
 * Features: Multi-room procedural architecture, holographic podiums, particle systems,
 * First-person / Orbit / Auto-tour modes, Raycasting selection, HUD mini-map.
 */

class Museum3DEngine {
  constructor() {
    this.container = document.getElementById('museum-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;

    // Navigation & camera modes: 'fps', 'orbit', 'tour'
    this.mode = 'fps';

    // Room state
    this.currentRoomId = 'room-ancient';
    this.currentRoomData = null;
    this.roomMeshes = new THREE.Group();
    this.podiumsGroup = new THREE.Group();
    this.portalsGroup = new THREE.Group();
    this.particles = null;

    // Interactive objects array for Raycaster
    this.interactiveObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;

    // FPS Movement Controls
    this.keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    this.moveSpeed = 0.28;
    this.playerVelocity = new THREE.Vector3();
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraPitch = 0;
    this.cameraYaw = 0;

    // Tour state
    this.tourExhibits = [];
    this.tourIndex = 0;
    this.tourProgress = 0;
    this.isTourRunning = false;
    this.tourTargetPos = new THREE.Vector3();
    this.tourTargetLook = new THREE.Vector3();

    // Minimap
    this.minimapCanvas = document.getElementById('hud-minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupEventListeners();

    // Check room from URL query param e.g. ?room=room-space
    const urlParams = new URLSearchParams(window.location.search);
    const requestedRoom = urlParams.get('room');
    const startRoom = requestedRoom || 'room-ancient';

    this.navigateToRoom(startRoom, false);
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070914);
    this.scene.fog = new THREE.FogExp2(0x070914, 0.022);

    this.scene.add(this.roomMeshes);
    this.scene.add(this.podiumsGroup);
    this.scene.add(this.portalsGroup);

    this.createParticleSystem();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 200);
    this.camera.position.set(0, 2, 20);
  }

  setupControls() {
    if (window.THREE && THREE.OrbitControls) {
      this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.05;
      this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.orbitControls.minDistance = 2;
      this.orbitControls.maxDistance = 50;
      this.orbitControls.enabled = (this.mode === 'orbit');
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Keyboard movement
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k) || e.key.startsWith('Arrow')) {
        this.keys[e.key] = true;
        this.keys[k] = true;
      }
      if (k === 'f') this.toggleFullScreen();
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(k) || e.key.startsWith('Arrow')) {
        this.keys[e.key] = false;
        this.keys[k] = false;
      }
    });

    // Mouse drag-look for FPS mode
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', (e) => {
      if (this.mode === 'fps') {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.mode === 'fps' && this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.cameraYaw -= deltaX * 0.0035;
        this.cameraPitch -= deltaY * 0.0035;
        this.cameraPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraPitch));

        this.updateCameraRotation();

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      this.checkRaycastHover();
    });

    // Click on artifact or portal
    canvas.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });

    // Touch controls for mobile / tablet
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.isDragging = true;
        this.previousMousePosition = { x: touchStartX, y: touchStartY };
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.cameraYaw -= deltaX * 0.004;
        this.cameraPitch -= deltaY * 0.004;
        this.cameraPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraPitch));
        this.updateCameraRotation();

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Mode Switcher Buttons in HUD
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const selectedMode = btn.getAttribute('data-mode');
        this.setMode(selectedMode);
      });
    });

    // Fullscreen toggle button
    const fsBtn = document.getElementById('hud-fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullScreen());
    }

    // Return to Spawn / Center button
    const resetCamBtn = document.getElementById('hud-reset-cam-btn');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        if (this.currentRoomData) {
          const sp = this.currentRoomData.spawnPoint;
          this.camera.position.set(sp.x, sp.y, sp.z);
          this.cameraYaw = 0;
          this.cameraPitch = 0;
          this.updateCameraRotation();
          if (this.orbitControls) this.orbitControls.target.set(0, 1.5, 0);
          window.VirtualVerseApp?.showToast('Camera repositioned to room threshold.', 'info');
        }
      });
    }

    // Audio ambient drone starter
    const droneBtn = document.getElementById('hud-ambient-drone-btn');
    if (droneBtn) {
      droneBtn.addEventListener('click', () => {
        window.VirtualVerseApp?.sound.startAmbientDrone();
        window.VirtualVerseApp?.showToast('Cosmic ambient resonance harmonized.', 'info');
      });
    }
  }

  updateCameraRotation() {
    const euler = new THREE.Euler(this.cameraPitch, this.cameraYaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode === 'orbit') {
      if (this.orbitControls) {
        this.orbitControls.enabled = true;
        this.orbitControls.target.set(0, 1.5, 0);
      }
      this.camera.position.set(0, 14, 26);
      this.camera.lookAt(0, 1.5, 0);
      window.VirtualVerseApp?.showToast('Orbit Inspection Mode: Drag to rotate overhead view.', 'info');
    } else if (newMode === 'fps') {
      if (this.orbitControls) this.orbitControls.enabled = false;
      const sp = this.currentRoomData ? this.currentRoomData.spawnPoint : { x: 0, y: 2, z: 20 };
      this.camera.position.set(sp.x, sp.y, sp.z);
      this.cameraYaw = 0;
      this.cameraPitch = 0;
      this.updateCameraRotation();
      window.VirtualVerseApp?.showToast('First Person Mode: Use WASD/Arrows to walk, drag to look around.', 'info');
    } else if (newMode === 'tour') {
      if (this.orbitControls) this.orbitControls.enabled = false;
      this.startGuidedTour();
    }
  }

  /* ---------------- ROOM CREATION & NAVIGATION ---------------- */
  navigateToRoom(roomId, playEffect = true) {
    const roomData = window.StorageManager.getRoomById(roomId);
    if (!roomData) return;

    if (playEffect) {
      window.VirtualVerseApp?.sound.playTeleport();
      // Flash screen overlay
      const flash = document.getElementById('teleport-flash');
      if (flash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 500);
      }
    }

    this.currentRoomId = roomId;
    this.currentRoomData = roomData;

    // Record visit in storage & achievements
    window.StorageManager.recordRoomVisit(roomId);

    // Update HUD
    const titleEl = document.getElementById('hud-room-title');
    const codeEl = document.getElementById('hud-room-code');
    if (titleEl) titleEl.textContent = roomData.name;
    if (codeEl) codeEl.textContent = roomData.code;

    // Build 3D Architecture
    this.createMuseumRoom(roomData);

    // Reset player position to spawn point
    const sp = roomData.spawnPoint;
    this.camera.position.set(sp.x, sp.y, sp.z);
    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.updateCameraRotation();

    if (this.orbitControls && this.mode === 'orbit') {
      this.camera.position.set(0, 16, 26);
      this.orbitControls.target.set(0, 1.5, 0);
    }

    window.VirtualVerseApp?.showToast(`Sector Entered: ${roomData.name}`, 'info');
  }

  createMuseumRoom(room) {
    // Clear previous room meshes
    while (this.roomMeshes.children.length > 0) {
      const obj = this.roomMeshes.children[0];
      this.roomMeshes.remove(obj);
    }
    while (this.podiumsGroup.children.length > 0) {
      const obj = this.podiumsGroup.children[0];
      this.podiumsGroup.remove(obj);
    }
    while (this.portalsGroup.children.length > 0) {
      const obj = this.portalsGroup.children[0];
      this.portalsGroup.remove(obj);
    }
    this.interactiveObjects = [];

    // Lighting
    this.createLighting(room);

    // Floor
    const dim = room.dimensions;
    const floorGeo = new THREE.PlaneGeometry(dim.width, dim.depth, 16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: parseInt(room.floorColor.replace('#', '0x')),
      metalness: 0.6,
      roughness: 0.35
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomMeshes.add(floor);

    // Decorative Floor Grid Lines
    const gridHelper = new THREE.GridHelper(dim.width, 24, parseInt(room.accentColor.replace('#', '0x')), 0x1f293d);
    gridHelper.position.y = 0.02;
    this.roomMeshes.add(gridHelper);

    // Ceiling with luminous hexagonal skylight or starry vault
    const ceilGeo = new THREE.PlaneGeometry(dim.width, dim.depth);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x080b18,
      roughness: 0.8
    });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.position.y = dim.height;
    ceil.rotation.x = Math.PI / 2;
    this.roomMeshes.add(ceil);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: parseInt(room.wallColor.replace('#', '0x')),
      roughness: 0.7,
      metalness: 0.3
    });

    const wallThickness = 1.0;
    // North & South Walls
    const wallNSGeo = new THREE.BoxGeometry(dim.width, dim.height, wallThickness);
    const wallN = new THREE.Mesh(wallNSGeo, wallMat);
    wallN.position.set(0, dim.height / 2, -dim.depth / 2);
    this.roomMeshes.add(wallN);

    const wallS = new THREE.Mesh(wallNSGeo, wallMat);
    wallS.position.set(0, dim.height / 2, dim.depth / 2);
    this.roomMeshes.add(wallS);

    // East & West Walls
    const wallEWGeo = new THREE.BoxGeometry(wallThickness, dim.height, dim.depth);
    const wallE = new THREE.Mesh(wallEWGeo, wallMat);
    wallE.position.set(dim.width / 2, dim.height / 2, 0);
    this.roomMeshes.add(wallE);

    const wallW = new THREE.Mesh(wallEWGeo, wallMat);
    wallW.position.set(-dim.width / 2, dim.height / 2, 0);
    this.roomMeshes.add(wallW);

    // Room-specific architectural features
    this.createArchitecturalTheme(room);

    // Portals
    if (room.portals) {
      room.portals.forEach(p => this.createPortal(p));
    }

    // Artifacts for this room
    const allArtifacts = window.StorageManager.getArtifacts();
    const roomArtifacts = allArtifacts.filter(a => a.roomId === room.id);

    roomArtifacts.forEach(art => {
      this.createArtifact(art);
    });
  }

  createLighting(room) {
    // Remove old lights
    const toRemove = [];
    this.scene.traverse(child => {
      if (child.isLight) toRemove.push(child);
    });
    toRemove.forEach(l => this.scene.remove(l));

    // Ambient Light
    const ambientColor = parseInt(room.ambientColor.replace('#', '0x'));
    const ambientLight = new THREE.AmbientLight(ambientColor, 0.45 * room.lightIntensity);
    this.scene.add(ambientLight);

    // Central Dome Spotlight
    const mainSpot = new THREE.SpotLight(0xffffff, 1.4 * room.lightIntensity, 80, Math.PI / 3, 0.5, 1.2);
    mainSpot.position.set(0, room.dimensions.height - 1, 0);
    mainSpot.target.position.set(0, 0, 0);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    this.scene.add(mainSpot);
    this.scene.add(mainSpot.target);

    // Room Accent Pointlights at corners
    const accentCol = parseInt(room.accentColor.replace('#', '0x'));
    const corners = [
      [-room.dimensions.width * 0.4, 4, -room.dimensions.depth * 0.4],
      [room.dimensions.width * 0.4, 4, -room.dimensions.depth * 0.4],
      [-room.dimensions.width * 0.4, 4, room.dimensions.depth * 0.4],
      [room.dimensions.width * 0.4, 4, room.dimensions.depth * 0.4]
    ];
    corners.forEach(([x, y, z]) => {
      const pLight = new THREE.PointLight(accentCol, 0.8, 25);
      pLight.position.set(x, y, z);
      this.scene.add(pLight);
    });
  }

  createArchitecturalTheme(room) {
    const accentCol = parseInt(room.accentColor.replace('#', '0x'));

    if (room.theme === 'ancient') {
      // Sandstone columns along the colonnade
      const colMat = new THREE.MeshStandardMaterial({ color: 0x3d2c1e, roughness: 0.85 });
      const positions = [-18, -6, 6, 18];
      positions.forEach(x => {
        [-18, 18].forEach(z => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, room.dimensions.height, 16), colMat);
          col.position.set(x, room.dimensions.height / 2, z);
          this.roomMeshes.add(col);

          // Capital & Base
          const cap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 2.2), colMat);
          cap.position.set(x, room.dimensions.height - 0.3, z);
          this.roomMeshes.add(cap);
        });
      });
    } else if (room.theme === 'space') {
      // Cosmic celestial ring overhead
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(18, 0.15, 12, 48),
        new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.8 })
      );
      ring.position.set(0, room.dimensions.height - 2, 0);
      ring.rotation.x = Math.PI / 2;
      this.roomMeshes.add(ring);
    } else if (room.theme === 'digital') {
      // Glowing neon floor grid tiles
      for (let i = -2; i <= 2; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(room.dimensions.width, 0.05, 0.1),
          new THREE.MeshBasicMaterial({ color: 0x8b5cf6 })
        );
        line.position.set(0, 0.03, i * 10);
        this.roomMeshes.add(line);
      }
    } else if (room.theme === 'science') {
      // Central quantum core pillar
      const corePillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, room.dimensions.height, 6),
        new THREE.MeshStandardMaterial({ color: 0x093322, metalness: 0.8, roughness: 0.2 })
      );
      corePillar.position.set(0, room.dimensions.height / 2, -22);
      this.roomMeshes.add(corePillar);
    } else if (room.theme === 'heritage') {
      // Classical rotunda arches
      const archMat = new THREE.MeshStandardMaterial({ color: 0x4a1835, roughness: 0.6 });
      for (let i = 0; i < 8; i++) {
        const theta = (i * Math.PI * 2) / 8;
        const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, room.dimensions.height, 12), archMat);
        arch.position.set(Math.cos(theta) * 22, room.dimensions.height / 2, Math.sin(theta) * 22);
        this.roomMeshes.add(arch);
      }
    }
  }

  createPortal(portalData) {
    const portalGroup = new THREE.Group();
    portalGroup.position.set(portalData.position.x, portalData.position.y, portalData.position.z);
    portalGroup.rotation.y = portalData.rotation;

    // Glowing Outer Portal Ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.9,
      metalness: 0.3,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.2, 16, 32), ringMat);
    ring.position.y = 3.2;
    portalGroup.add(ring);

    // Swirling Portal Event Horizon Disc
    const discGeo = new THREE.CircleGeometry(3.0, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x1a0f3d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 3.2;
    disc.name = 'portal_event_horizon';
    portalGroup.add(disc);

    // Label Canvas texture above portal
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101426';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.fillStyle = '#00E5FF';
    ctx.textAlign = 'center';
    ctx.fillText(`PORTAL: ${portalData.name.toUpperCase()}`, 256, 75);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 1.25),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    labelMesh.position.y = 7.0;
    portalGroup.add(labelMesh);

    // Metadata for interaction
    portalGroup.userData = {
      isPortal: true,
      targetRoom: portalData.targetRoom,
      name: portalData.name
    };

    this.portalsGroup.add(portalGroup);
    this.interactiveObjects.push(disc);
    disc.userData = portalGroup.userData;
  }

  createArtifact(art) {
    const podiumGroup = new THREE.Group();
    const pos = art.position;
    podiumGroup.position.set(pos.x, 0, pos.z);

    // Cylindrical Glassmorphic Holographic Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.4, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x101426,
      metalness: 0.8,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    podiumGroup.add(base);

    // Glowing Neon Ring around podium
    const neonRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.04, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.0 })
    );
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.42;
    podiumGroup.add(neonRing);

    // Floating Holographic 3D Model of the Artifact!
    const modelGroup = window.ProceduralModelFactory.createModel(art.modelType);
    modelGroup.position.y = pos.y;
    modelGroup.scale.set(0.9, 0.9, 0.9);
    podiumGroup.add(modelGroup);

    // Interaction Bounding Hit Sphere (invisible or translucent)
    const hitGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.position.y = pos.y;
    hitBox.userData = {
      isArtifact: true,
      artifactData: art,
      modelGroup: modelGroup,
      neonRing: neonRing
    };
    podiumGroup.add(hitBox);

    this.interactiveObjects.push(hitBox);
    this.podiumsGroup.add(podiumGroup);
  }

  createParticleSystem() {
    const count = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0x00e5ff);
    const c2 = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      const mixed = Math.random() > 0.5 ? c1 : c2;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  /* ---------------- RAYCASTING & INTERACTION ---------------- */
  checkRaycastHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredObject !== hit) {
        this.hoveredObject = hit;
        document.body.style.cursor = 'pointer';

        if (hit.userData.isArtifact) {
          const data = hit.userData.artifactData;
          this.showCrosshairPrompt(`Inspect: ${data.name}`);
        } else if (hit.userData.isPortal) {
          this.showCrosshairPrompt(`Step to: ${hit.userData.name}`);
        }
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
        this.hideCrosshairPrompt();
      }
    }
  }

  handleCanvasClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      if (hit.userData.isArtifact) {
        this.showArtifactInformation(hit.userData.artifactData);
      } else if (hit.userData.isPortal) {
        this.navigateToRoom(hit.userData.targetRoom, true);
      }
    }
  }

  showCrosshairPrompt(text) {
    const prompt = document.getElementById('hud-crosshair-prompt');
    if (prompt) {
      prompt.textContent = text;
      prompt.style.display = 'block';
    }
  }

  hideCrosshairPrompt() {
    const prompt = document.getElementById('hud-crosshair-prompt');
    if (prompt) prompt.style.display = 'none';
  }

  /* ---------------- HOLOGRAPHIC INFORMATION PANEL ---------------- */
  showArtifactInformation(art) {
    window.StorageManager.recordArtifactView(art.id);
    window.VirtualVerseApp?.sound.playClick();

    const panel = document.getElementById('holographic-info-panel');
    if (!panel) return;

    const isFav = window.StorageManager.isFavorite(art.id);

    panel.innerHTML = `
      <div class="holo-panel-card">
        <div class="holo-panel-header">
          <div class="holo-badge">${art.category}</div>
          <button class="holo-close-btn" id="holo-close-btn">&times;</button>
        </div>
        <div class="holo-panel-body">
          <h2 class="holo-title">${art.name}</h2>
          <div class="holo-meta-row">
            <span><i class="fa-solid fa-clock"></i> ${art.historicalPeriod}</span>
            <span><i class="fa-solid fa-earth-americas"></i> ${art.origin}</span>
          </div>

          <p class="holo-desc">${art.description}</p>

          <div class="holo-spec-box">
            <div><strong>Material:</strong> ${art.material}</div>
            <div><strong>Significance:</strong> ${art.significance}</div>
            <div><strong>Discovery:</strong> ${art.discoveryInfo}</div>
          </div>

          ${art.funFacts ? `
            <div class="holo-facts">
              <h4><i class="fa-solid fa-lightbulb"></i> Did You Know?</h4>
              <ul>
                ${art.funFacts.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="holo-actions">
            <button class="cyber-btn btn-ghost btn-sm" id="holo-fav-toggle">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i> ${isFav ? 'Bookmarked' : 'Add to Favorites'}
            </button>
            <a href="artifact-viewer.html?id=${art.id}" class="cyber-btn btn-primary btn-sm">
              <i class="fa-solid fa-cube"></i> Open 360° 3D Studio
            </a>
          </div>
        </div>
      </div>
    `;

    panel.classList.add('panel-active');

    // Bind Close
    document.getElementById('holo-close-btn')?.addEventListener('click', () => {
      panel.classList.remove('panel-active');
    });

    // Bind Favorite Toggle
    document.getElementById('holo-fav-toggle')?.addEventListener('click', (e) => {
      const res = window.StorageManager.toggleFavorite(art.id);
      const btn = e.currentTarget;
      btn.innerHTML = `<i class="fa-${res.added ? 'solid' : 'regular'} fa-bookmark"></i> ${res.added ? 'Bookmarked' : 'Add to Favorites'}`;
      window.VirtualVerseApp?.showToast(res.added ? 'Saved to Favorites' : 'Removed from Favorites', 'info');
    });
  }

  /* ---------------- GUIDED TOUR IN MUSEUM ---------------- */
  startGuidedTour() {
    const allArtifacts = window.StorageManager.getArtifacts();
    // Choose 5 flagship exhibits
    this.tourExhibits = allArtifacts.slice(0, 5);
    this.tourIndex = 0;
    this.isTourRunning = true;

    window.VirtualVerseApp?.showToast('Automated Museum Tour activated. Gliding to Exhibit 1...', 'info');

    this.advanceTourExhibit();
  }

  advanceTourExhibit() {
    if (this.tourIndex >= this.tourExhibits.length) {
      this.isTourRunning = false;
      window.StorageManager.recordTourCompleted();
      window.VirtualVerseApp?.showToast('Guided Tour completed! Achievement awarded.', 'achievement');
      this.setMode('fps');
      return;
    }

    const targetArt = this.tourExhibits[this.tourIndex];
    if (targetArt.roomId !== this.currentRoomId) {
      this.navigateToRoom(targetArt.roomId, true);
    }

    const pos = targetArt.position;
    this.tourTargetPos.set(pos.x, 2.0, pos.z + 3.8);
    this.tourTargetLook.set(pos.x, pos.y, pos.z);

    // Show tour overlay prompt
    const hudTour = document.getElementById('hud-tour-narration');
    if (hudTour) {
      hudTour.style.display = 'block';
      hudTour.innerHTML = `
        <div class="tour-hud-box">
          <span class="tour-step">Exhibit ${this.tourIndex + 1} of ${this.tourExhibits.length}</span>
          <h3>${targetArt.name}</h3>
          <p>${targetArt.description}</p>
          <div class="tour-btn-row">
            <button class="cyber-btn btn-sm" id="tour-next-btn">Next Exhibit &rarr;</button>
            <button class="cyber-btn btn-ghost btn-sm" id="tour-exit-btn">Stop Tour</button>
          </div>
        </div>
      `;

      document.getElementById('tour-next-btn')?.addEventListener('click', () => {
        this.tourIndex++;
        this.advanceTourExhibit();
      });

      document.getElementById('tour-exit-btn')?.addEventListener('click', () => {
        this.isTourRunning = false;
        hudTour.style.display = 'none';
        this.setMode('fps');
      });
    }
  }

  /* ---------------- ANIMATION & RENDER LOOP ---------------- */
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Rotate floating artifact models gently
    this.podiumsGroup.children.forEach(podium => {
      const hitBox = podium.children.find(c => c.userData && c.userData.isArtifact);
      if (hitBox && hitBox.userData.modelGroup) {
        hitBox.userData.modelGroup.rotation.y += 0.008;
      }
    });

    // Animate portals event horizon
    this.portalsGroup.children.forEach(portal => {
      const disc = portal.getObjectByName('portal_event_horizon');
      if (disc) {
        disc.rotation.z += 0.015;
      }
    });

    // Drift cosmic particles
    if (this.particles) {
      this.particles.rotation.y = time * 0.02;
    }

    // Handle Movement
    if (this.mode === 'fps') {
      this.updateFPSMovement();
    } else if (this.mode === 'orbit' && this.orbitControls) {
      this.orbitControls.update();
    } else if (this.mode === 'tour' && this.isTourRunning) {
      // Smooth camera interpolation towards tour target
      this.camera.position.lerp(this.tourTargetPos, 0.04);
      this.camera.lookAt(this.tourTargetLook);
    }

    // Render Mini-Map
    this.renderMinimap();

    this.renderer.render(this.scene, this.camera);
  }

  updateFPSMovement() {
    const moveDir = new THREE.Vector3();
    if (this.keys.w || this.keys.ArrowUp) moveDir.z -= 1;
    if (this.keys.s || this.keys.ArrowDown) moveDir.z += 1;
    if (this.keys.a || this.keys.ArrowLeft) moveDir.x -= 1;
    if (this.keys.d || this.keys.ArrowRight) moveDir.x += 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      // Rotate movement direction by camera yaw
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      this.camera.position.x += moveDir.x * this.moveSpeed;
      this.camera.position.z += moveDir.z * this.moveSpeed;

      // Keep camera inside room boundaries
      if (this.currentRoomData) {
        const bounds = this.currentRoomData.dimensions;
        const halfW = bounds.width / 2 - 1.5;
        const halfD = bounds.depth / 2 - 1.5;
        this.camera.position.x = Math.max(-halfW, Math.min(halfW, this.camera.position.x));
        this.camera.position.z = Math.max(-halfD, Math.min(halfD, this.camera.position.z));
      }

      // Check proximity to portals for auto-teleport
      if (this.currentRoomData && this.currentRoomData.portals) {
        this.currentRoomData.portals.forEach(p => {
          const dist = this.camera.position.distanceTo(new THREE.Vector3(p.position.x, this.camera.position.y, p.position.z));
          if (dist < 2.5) {
            this.navigateToRoom(p.targetRoom, true);
          }
        });
      }
    }
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.currentRoomData) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#101426';
    ctx.fillRect(0, 0, w, h);

    // Room boundary
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    const roomW = this.currentRoomData.dimensions.width;
    const roomD = this.currentRoomData.dimensions.depth;

    // Draw artifact markers
    ctx.fillStyle = '#8B5CF6';
    const allArtifacts = window.StorageManager.getArtifacts();
    allArtifacts.filter(a => a.roomId === this.currentRoomId).forEach(art => {
      const mapX = ((art.position.x + roomW / 2) / roomW) * (w - 20) + 10;
      const mapY = ((art.position.z + roomD / 2) / roomD) * (h - 20) + 10;
      ctx.beginPath();
      ctx.arc(mapX, mapY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player dot
    const playerMapX = ((this.camera.position.x + roomW / 2) / roomW) * (w - 20) + 10;
    const playerMapY = ((this.camera.position.z + roomD / 2) / roomD) * (h - 20) + 10;

    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Direction line
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playerMapX, playerMapY);
    ctx.lineTo(
      playerMapX - Math.sin(this.cameraYaw) * 10,
      playerMapY - Math.cos(this.cameraYaw) * 10
    );
    ctx.stroke();
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }
}

// Instantiate upon DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('museum-canvas-container')) {
    window.MuseumApp = new Museum3DEngine();
  }
});