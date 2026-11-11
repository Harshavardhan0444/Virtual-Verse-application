/**
 * VirtualVerse – Cosmic Archive
 * js/procedural-models.js
 * Advanced Procedural 3D Geometry Generators for Three.js
 * Generates 30+ distinctive historical, scientific, and cosmic artifacts using pure Three.js geometries and PBR materials.
 */

class ProceduralModelFactory {
  // Shared materials cache to optimize WebGL memory
  static getGoldMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.25,
      envMapIntensity: 1.5
    });
  }

  static getBronzeMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.8,
      roughness: 0.35
    });
  }

  static getSteelMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.9,
      roughness: 0.15
    });
  }

  static getStoneMaterial(color = 0x8c8275) {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.05,
      roughness: 0.9
    });
  }

  static getGlowMaterial(color = 0x00e5ff) {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.1
    });
  }

  static createModel(modelType, options = {}) {
    const group = new THREE.Group();
    group.name = `model_${modelType}`;

    switch (modelType) {
      case 'tutankhamun_mask':
        this.buildTutankhamunMask(group);
        break;
      case 'rosetta_stone':
        this.buildRosettaStone(group);
        break;
      case 'nefertiti_bust':
        this.buildNefertitiBust(group);
        break;
      case 'giza_pyramid':
        this.buildGizaPyramid(group);
        break;
      case 'greek_amphora':
        this.buildGreekAmphora(group);
        break;
      case 'saturn_planet':
        this.buildSaturnPlanet(group);
        break;
      case 'jwst':
        this.buildJWST(group);
        break;
      case 'golden_record':
        this.buildGoldenRecord(group);
        break;
      case 'lunar_lander':
        this.buildLunarLander(group);
        break;
      case 'pulsar_star':
        this.buildPulsarStar(group);
        break;
      case 'tesseract_cube':
        this.buildTesseract(group);
        break;
      case 'polyhedral_core':
        this.buildPolyhedralCore(group);
        break;
      case 'neural_monolith':
        this.buildNeuralMonolith(group);
        break;
      case 'dna_helix':
        this.buildDNAHelix(group);
        break;
      case 'galileo_telescope':
        this.buildGalileoTelescope(group);
        break;
      case 'quantum_core':
        this.buildQuantumCore(group);
        break;
      case 'tesla_coil':
        this.buildTeslaCoil(group);
        break;
      case 'medieval_sword':
        this.buildMedievalSword(group);
        break;
      case 'roman_helmet':
        this.buildRomanHelmet(group);
        break;
      case 'antikythera':
        this.buildAntikythera(group);
        break;
      case 'enigma_machine':
        this.buildEnigmaMachine(group);
        break;
      case 'dino_skull':
        this.buildDinoSkull(group);
        break;
      case 'davinci_flyer':
        this.buildDaVinciFlyer(group);
        break;
      case 'aztec_sunstone':
        this.buildAztecSunstone(group);
        break;
      case 'viking_runestone':
        this.buildVikingRunestone(group);
        break;
      case 'terracotta_warrior':
        this.buildTerracottaWarrior(group);
        break;
      case 'astrolabe':
        this.buildAstrolabe(group);
        break;
      case 'parthenon_metope':
        this.buildParthenonMetope(group);
        break;
      case 'samurai_armor':
        this.buildSamuraiArmor(group);
        break;
      case 'dead_sea_jar':
        this.buildDeadSeaJar(group);
        break;
      case 'sputnik_satellite':
        this.buildSputnik(group);
        break;
      case 'venus_figurine':
        this.buildVenusFigurine(group);
        break;
      default:
        this.buildGenericArtifact(group);
    }

    return group;
  }

  /* ---------------- INDIVIDUAL 3D MODEL BUILDERS ---------------- */

  // 1. Mask of Tutankhamun
  static buildTutankhamunMask(group) {
    const goldMat = this.getGoldMaterial();
    const lapisMat = new THREE.MeshStandardMaterial({ color: 0x1a3d7c, roughness: 0.3, metalness: 0.4 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Head / Face
    const faceGeo = new THREE.SphereGeometry(0.7, 32, 24);
    faceGeo.scale(0.8, 1.1, 0.9);
    const face = new THREE.Mesh(faceGeo, goldMat);
    face.position.y = 0.2;
    group.add(face);

    // Royal Nemes headdress back & wings
    const headdressGeo = new THREE.CylinderGeometry(0.9, 0.4, 1.6, 24, 1, true);
    headdressGeo.scale(1.2, 1, 0.9);
    const headdress = new THREE.Mesh(headdressGeo, goldMat);
    headdress.position.y = 0.1;
    group.add(headdress);

    // Headdress Lapis stripes
    for (let i = -4; i <= 4; i++) {
      const stripeGeo = new THREE.TorusGeometry(0.82 + Math.abs(i) * 0.02, 0.03, 8, 24, Math.PI);
      const stripe = new THREE.Mesh(stripeGeo, lapisMat);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = 0.6 + i * 0.12;
      group.add(stripe);
    }

    // False Royal Beard
    const beardGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.8, 12);
    const beard = new THREE.Mesh(beardGeo, lapisMat);
    beard.position.set(0, -0.65, 0.45);
    beard.rotation.x = 0.2;
    group.add(beard);

    // Cobra (Wadjet) & Vulture (Nekhbet) on forehead
    const uraeus = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 8), goldMat);
    uraeus.position.set(0, 0.9, 0.65);
    uraeus.rotation.x = -0.4;
    group.add(uraeus);

    // Eyes
    [-0.22, 0.22].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.04), eyeMat);
      eye.position.set(x, 0.25, 0.72);
      group.add(eye);
    });
  }

  // 2. The Rosetta Stone
  static buildRosettaStone(group) {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x2e3033,
      roughness: 0.85,
      metalness: 0.1
    });

    const slabGeo = new THREE.BoxGeometry(1.2, 1.6, 0.22);
    const slab = new THREE.Mesh(slabGeo, stoneMat);
    group.add(slab);

    // Engraved register grooves
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x6e7278 });
    for (let i = 0; i < 18; i++) {
      const lineGeo = new THREE.BoxGeometry(1.05, 0.015, 0.23);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.y = 0.65 - i * 0.075;
      group.add(line);
    }

    // Broken top corner simulation
    const chipGeo = new THREE.BoxGeometry(0.35, 0.35, 0.25);
    const chip = new THREE.Mesh(chipGeo, stoneMat);
    chip.position.set(0.55, 0.75, 0);
    chip.rotation.z = 0.7;
    group.add(chip);
  }

  // 3. Bust of Nefertiti
  static buildNefertitiBust(group) {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd6ad85, roughness: 0.5 });
    const blueCrownMat = new THREE.MeshStandardMaterial({ color: 0x153b82, roughness: 0.4 });
    const goldMat = this.getGoldMaterial();

    // Slender neck and chest
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.7, 16), skinMat);
    chest.position.y = -0.4;
    group.add(chest);

    // Symmetrical Face
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), skinMat);
    face.scale.set(0.85, 1.15, 0.95);
    face.position.set(0, 0.2, 0.1);
    group.add(face);

    // Iconic Tall Flat-Topped Blue Crown
    const crownGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.9, 24);
    const crown = new THREE.Mesh(crownGeo, blueCrownMat);
    crown.position.set(0, 0.8, -0.05);
    crown.rotation.x = -0.15;
    group.add(crown);

    // Golden Diadem band
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.04, 12, 24), goldMat);
    band.position.set(0, 0.5, 0.05);
    band.rotation.x = Math.PI / 2 - 0.15;
    group.add(band);
  }

  // 4. Great Pyramid Capstone
  static buildGizaPyramid(group) {
    const stoneMat = this.getStoneMaterial(0xd4af7a);
    const electrumMat = this.getGoldMaterial();

    // Base Pyramid
    const baseGeo = new THREE.ConeGeometry(1.4, 1.3, 4);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.rotation.y = Math.PI / 4;
    group.add(base);

    // Gleaming Electrum Capstone
    const capGeo = new THREE.ConeGeometry(0.55, 0.55, 4);
    const cap = new THREE.Mesh(capGeo, electrumMat);
    cap.position.y = 0.48;
    cap.rotation.y = Math.PI / 4;
    group.add(cap);

    // Apex beacon glow
    const glowGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const glow = new THREE.Mesh(glowGeo, this.getGlowMaterial(0xffe066));
    glow.position.y = 0.8;
    group.add(glow);
  }

  // 5. Greek Amphora
  static buildGreekAmphora(group) {
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xbf4b26, roughness: 0.6 });
    const blackSlipMat = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.3 });

    // Belly
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), clayMat);
    belly.scale.set(1, 1.3, 1);
    group.add(belly);

    // Neck & Lip
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.6, 24), blackSlipMat);
    neck.position.y = 0.9;
    group.add(neck);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 12, 24), clayMat);
    lip.position.y = 1.2;
    lip.rotation.x = Math.PI / 2;
    group.add(lip);

    // Pedestal Foot
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.25, 24), blackSlipMat);
    foot.position.y = -0.85;
    group.add(foot);

    // Handles
    [-1, 1].forEach(side => {
      const handleGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24, Math.PI * 0.85);
      const handle = new THREE.Mesh(handleGeo, blackSlipMat);
      handle.position.set(side * 0.52, 0.6, 0);
      handle.rotation.z = side * (Math.PI / 2 - 0.2);
      group.add(handle);
    });
  }

  // 6. Saturn Planet & Rings
  static buildSaturnPlanet(group) {
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0xdfbf85,
      roughness: 0.7,
      metalness: 0.1
    });

    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), planetMat);
    group.add(planet);

    // Multi-tiered Rings
    const ringGeo = new THREE.RingGeometry(1.15, 2.3, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd2b57e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.8
    });
    const rings = new THREE.Mesh(ringGeo, ringMat);
    rings.rotation.x = Math.PI / 2.3;
    group.add(rings);

    // Cassini Orbiter miniature
    const probe = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), this.getSteelMaterial());
    probe.position.set(1.9, 0.4, 0.6);
    group.add(probe);
  }

  // 7. James Webb Space Telescope (JWST)
  static buildJWST(group) {
    const goldMat = this.getGoldMaterial();
    const kaptonMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.8, roughness: 0.2 });

    // 5-Layer Sunshield base (diamond shape)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, -1.3);
    shieldShape.lineTo(0.9, 0);
    shieldShape.lineTo(0, 1.3);
    shieldShape.lineTo(-0.9, 0);
    shieldShape.closePath();

    const shieldGeo = new THREE.ShapeGeometry(shieldShape);
    const sunshield = new THREE.Mesh(shieldGeo, kaptonMat);
    sunshield.rotation.x = Math.PI / 2;
    sunshield.position.y = -0.3;
    group.add(sunshield);

    // Hexagonal primary mirror cluster (18 hexagons)
    const hexRadius = 0.16;
    const hexGeo = new THREE.CircleGeometry(hexRadius, 6);

    const positions = [
      [0, 0], [0, 0.3], [0, -0.3],
      [0.26, 0.15], [0.26, -0.15], [-0.26, 0.15], [-0.26, -0.15],
      [0, 0.6], [0, -0.6],
      [0.26, 0.45], [0.26, -0.45], [-0.26, 0.45], [-0.26, -0.45],
      [0.52, 0.3], [0.52, 0], [0.52, -0.3],
      [-0.52, 0.3], [-0.52, 0], [-0.52, -0.3]
    ];

    positions.forEach(([x, y]) => {
      const hex = new THREE.Mesh(hexGeo, goldMat);
      hex.position.set(x, y + 0.3, 0);
      group.add(hex);
    });

    // Secondary mirror tripod
    const secondaryMirror = new THREE.Mesh(new THREE.CircleGeometry(0.1, 6), goldMat);
    secondaryMirror.position.set(0, 0.3, 0.7);
    group.add(secondaryMirror);

    [-0.35, 0.35].forEach(x => {
      const strutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8);
      const strut = new THREE.Mesh(strutGeo, this.getSteelMaterial());
      strut.position.set(x * 0.7, 0.1, 0.35);
      strut.rotation.x = -0.6;
      group.add(strut);
    });
  }

  // 8. Voyager Golden Record
  static buildGoldenRecord(group) {
    const goldMat = this.getGoldMaterial();
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Gold Phonograph Record
    const recordGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.04, 36);
    const record = new THREE.Mesh(recordGeo, goldMat);
    record.rotation.x = Math.PI / 2;
    group.add(record);

    // Center Spindle hole
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), darkMat);
    center.rotation.x = Math.PI / 2;
    group.add(center);

    // Grooves concentric rings
    for (let i = 1; i <= 6; i++) {
      const groove = new THREE.Mesh(
        new THREE.RingGeometry(0.25 + i * 0.1, 0.27 + i * 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0xbfa128, metalness: 0.9, roughness: 0.4 })
      );
      groove.position.z = 0.025;
      group.add(groove);
    }

    // High-gain satellite dish antenna
    const dishGeo = new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const dish = new THREE.Mesh(dishGeo, this.getSteelMaterial());
    dish.position.set(0.9, 0.6, -0.4);
    dish.rotation.x = -Math.PI / 2;
    group.add(dish);
  }

  // 9. Apollo 11 Lunar Module
  static buildLunarLander(group) {
    const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xcc9933, metalness: 0.8, roughness: 0.4 });
    const steelMat = this.getSteelMaterial();

    // Octagonal Descent Stage Chassis
    const octGeo = new THREE.CylinderGeometry(0.8, 0.85, 0.5, 8);
    const chassis = new THREE.Mesh(octGeo, goldFoilMat);
    group.add(chassis);

    // Descent engine bell nozzle
    const bellGeo = new THREE.ConeGeometry(0.3, 0.45, 16, 1, true);
    const bell = new THREE.Mesh(bellGeo, steelMat);
    bell.position.y = -0.4;
    group.add(bell);

    // Ascent Cabin Stage
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), steelMat);
    cabin.position.y = 0.55;
    group.add(cabin);

    // 4 Landing Struts with footpads
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), steelMat);
      leg.position.set(Math.cos(angle) * 0.9, -0.35, Math.sin(angle) * 0.9);
      leg.rotation.z = Math.cos(angle) * 0.6;
      leg.rotation.x = -Math.sin(angle) * 0.6;
      group.add(leg);

      const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), goldFoilMat);
      footpad.position.set(Math.cos(angle) * 1.25, -0.75, Math.sin(angle) * 1.25);
      group.add(footpad);
    }
  }

  // 10. Pulsar Star Core
  static buildPulsarStar(group) {
    const coreMat = this.getGlowMaterial(0x00e5ff);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 });

    // Superdense core
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), coreMat);
    group.add(core);

    // Relativistic Polar Beams (Top and Bottom)
    [-1, 1].forEach(dir => {
      const beamGeo = new THREE.ConeGeometry(0.4, 2.2, 16, 1, true);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = dir * 1.2;
      beam.rotation.x = dir === 1 ? 0 : Math.PI;
      group.add(beam);
    });

    // Orbiting particle rings
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.03, 8, 36), this.getGlowMaterial(0x00e5ff));
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);
  }

  // 11. Tesseract 4D Hypercube
  static buildTesseract(group) {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    const innerLineMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    // Outer Wireframe Box
    const outerGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const outerWire = new THREE.LineSegments(new THREE.EdgesGeometry(outerGeo), lineMat);
    group.add(outerWire);

    // Inner Suspended Box
    const innerGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const innerWire = new THREE.LineSegments(new THREE.EdgesGeometry(innerGeo), innerLineMat);
    group.add(innerWire);

    // Connecting 8 4D Hyper-edges
    const outerVerts = [
      [-0.7, -0.7, -0.7], [0.7, -0.7, -0.7], [0.7, 0.7, -0.7], [-0.7, 0.7, -0.7],
      [-0.7, -0.7, 0.7], [0.7, -0.7, 0.7], [0.7, 0.7, 0.7], [-0.7, 0.7, 0.7]
    ];
    const innerVerts = outerVerts.map(v => v.map(c => c * 0.5));

    for (let i = 0; i < 8; i++) {
      const pts = [new THREE.Vector3(...outerVerts[i]), new THREE.Vector3(...innerVerts[i])];
      const edgeGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const edge = new THREE.Line(edgeGeo, lineMat);
      group.add(edge);
    }
  }

  // 12. Cybernetic Polyhedral Core
  static buildPolyhedralCore(group) {
    const geo = new THREE.IcosahedronGeometry(0.85, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false
    });
    const poly = new THREE.Mesh(geo, mat);
    group.add(poly);

    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    group.add(wire);

    // Orbiting Neon Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.04, 12, 36), this.getGlowMaterial(0x00e5ff));
    ring.rotation.x = Math.PI / 3;
    group.add(ring);
  }

  // 13. Holographic Neural Monolith
  static buildNeuralMonolith(group) {
    const monolithMat = new THREE.MeshStandardMaterial({ color: 0x0a0c14, roughness: 0.1, metalness: 0.9 });
    const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.3), monolithMat);
    group.add(monolith);

    // Circuit lines
    const lineMat = this.getGlowMaterial(0x8b5cf6);
    for (let i = -3; i <= 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.31), lineMat);
      line.position.y = i * 0.28;
      group.add(line);
    }
  }

  // 14. DNA Double Helix
  static buildDNAHelix(group) {
    const strandMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.5, roughness: 0.3 });
    const pairColors = [0xef4444, 0x10b981, 0x00e5ff, 0xf59e0b];

    const turns = 2.5;
    const height = 2.4;
    const radius = 0.55;
    const steps = 30;

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2 * turns;
      const y = (i / steps) * height - height / 2;

      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      // Backbone spheres
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), strandMat);
      s1.position.set(x1, y, z1);
      group.add(s1);

      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), strandMat);
      s2.position.set(x2, y, z2);
      group.add(s2);

      // Connecting rung
      const rungMat = new THREE.MeshStandardMaterial({
        color: pairColors[i % pairColors.length],
        emissive: pairColors[i % pairColors.length],
        emissiveIntensity: 0.4
      });
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, radius * 2, 8), rungMat);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -t;
      group.add(rung);
    }
  }

  // 15. Galileo's Telescope
  static buildGalileoTelescope(group) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.7 });
    const brassMat = this.getGoldMaterial();

    // Main Tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.8, 16), woodMat);
    tube.rotation.x = Math.PI / 2.8;
    tube.position.y = 0.5;
    group.add(tube);

    // Brass rings & Eyepiece
    [-0.8, -0.3, 0.3, 0.8].forEach(pos => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 16), brassMat);
      ring.position.set(0, 0.5 - pos * 0.4, pos * 0.7);
      ring.rotation.x = Math.PI / 2.8;
      group.add(ring);
    });

    // Tripod Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 1.4, 8), woodMat);
      leg.position.set(Math.cos(angle) * 0.45, -0.4, Math.sin(angle) * 0.45);
      leg.rotation.z = -Math.cos(angle) * 0.35;
      leg.rotation.x = Math.sin(angle) * 0.35;
      group.add(leg);
    }
  }

  // 16. Quantum Superconducting Qubit Core
  static buildQuantumCore(group) {
    const goldMat = this.getGoldMaterial();
    const cyanGlow = this.getGlowMaterial(0x00e5ff);

    // Dilution Refrigerator Chandelier Stages
    [0.7, 0.55, 0.4, 0.28].forEach((r, idx) => {
      const stage = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 24), goldMat);
      stage.position.y = 0.8 - idx * 0.5;
      group.add(stage);

      // Coaxial rods
      for (let k = 0; k < 6; k++) {
        const theta = (k * Math.PI) / 3;
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), this.getSteelMaterial());
        rod.position.set(Math.cos(theta) * (r * 0.8), 0.55 - idx * 0.5, Math.sin(theta) * (r * 0.8));
        group.add(rod);
      }
    });

    // Superconducting Qubit Chip at base
    const qubit = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.25), cyanGlow);
    qubit.position.y = -0.9;
    group.add(qubit);
  }

  // 17. Nikola Tesla Magnifying Coil
  static buildTeslaCoil(group) {
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.3 });
    const steelMat = this.getSteelMaterial();

    // Primary base coil
    const baseCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.4, 24), copperMat);
    baseCoil.position.y = -0.6;
    group.add(baseCoil);

    // Secondary vertical cylindrical coil
    const secCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 24), copperMat);
    secCoil.position.y = 0.2;
    group.add(secCoil);

    // Toroidal discharge electrode at apex
    const toroid = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.16, 16, 32), steelMat);
    toroid.position.y = 1.05;
    toroid.rotation.x = Math.PI / 2;
    group.add(toroid);
  }

  // 18. Excalibur Sovereign Longsword
  static buildMedievalSword(group) {
    const bladeMat = this.getSteelMaterial();
    const goldMat = this.getGoldMaterial();
    const rubyMat = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.2, metalness: 0.6 });

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.12, 1.8, 0.03);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.3;
    group.add(blade);

    // Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.07, 0.08), goldMat);
    guard.position.y = -0.6;
    group.add(guard);

    // Hilt / Grip
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0x221105 }));
    hilt.position.y = -0.85;
    group.add(hilt);

    // Pommel with Ruby
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), rubyMat);
    pommel.position.y = -1.1;
    group.add(pommel);
  }

  // 19. Roman Centurion Helmet
  static buildRomanHelmet(group) {
    const bronzeMat = this.getBronzeMaterial();
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.9 });

    // Bowl
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), bronzeMat);
    bowl.scale.set(0.9, 1.1, 1.05);
    group.add(bowl);

    // Neck Guard flange
    const neckGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.15, 16, 1, false, Math.PI * 0.6, Math.PI * 0.8), bronzeMat);
    neckGuard.position.set(0, -0.15, -0.2);
    group.add(neckGuard);

    // Transverse Red Horsehair Crest
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.3, 16), crestMat);
    crest.position.set(0, 0.72, 0);
    crest.rotation.z = Math.PI / 2;
    group.add(crest);
  }

  // 20. Antikythera Mechanism
  static buildAntikythera(group) {
    const bronzeMat = this.getBronzeMaterial();

    // Wooden / Bronze Casing frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.35), new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 }));
    group.add(frame);

    // Interlocking gear train wheels
    [
      { r: 0.38, x: 0, y: 0.1, z: 0.1 },
      { r: 0.22, x: 0.25, y: -0.25, z: 0.12 },
      { r: 0.18, x: -0.25, y: -0.2, z: 0.12 },
      { r: 0.14, x: -0.15, y: 0.35, z: 0.14 }
    ].forEach(gear => {
      const gMesh = new THREE.Mesh(new THREE.CylinderGeometry(gear.r, gear.r, 0.04, 24), bronzeMat);
      gMesh.rotation.x = Math.PI / 2;
      gMesh.position.set(gear.x, gear.y, gear.z);
      group.add(gMesh);
    });
  }

  // 21. Enigma Machine
  static buildEnigmaMachine(group) {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.8, roughness: 0.4 });
    const brassMat = this.getGoldMaterial();

    // Wooden Chassis
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.1), boxMat);
    group.add(box);

    // Keyboard plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.5), metalMat);
    plate.position.set(0, 0.23, 0.2);
    group.add(plate);

    // 4 Rotors
    for (let i = 0; i < 4; i++) {
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), brassMat);
      rotor.rotation.z = Math.PI / 2;
      rotor.position.set(-0.25 + i * 0.16, 0.28, -0.25);
      group.add(rotor);
    }
  }

  // 22. Tyrannosaurus Rex Skull
  static buildDinoSkull(group) {
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xc4b79b, roughness: 0.8 });

    // Cranium
    const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.4), boneMat);
    cranium.position.set(0, 0.25, -0.2);
    group.add(cranium);

    // Lower Jaw
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 1.3), boneMat);
    jaw.position.set(0, -0.25, -0.15);
    group.add(jaw);

    // Eye Orbits (hollow boxes)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    [-0.32, 0.32].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.22), eyeMat);
      eye.position.set(x, 0.35, -0.1);
      group.add(eye);
    });

    // Serrated Teeth
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xede4d1, roughness: 0.3 });
    for (let i = 0; i < 6; i++) {
      [-0.28, 0.28].forEach(x => {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), toothMat);
        tooth.position.set(x, 0.05, 0.4 - i * 0.18);
        tooth.rotation.x = Math.PI;
        group.add(tooth);
      });
    }
  }

  // 23. Da Vinci Aerial Screw
  static buildDaVinciFlyer(group) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.8 });
    const linenMat = new THREE.MeshStandardMaterial({ color: 0xd6cbb8, side: THREE.DoubleSide });

    // Circular base platform
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 24), woodMat);
    base.position.y = -0.7;
    group.add(base);

    // Central mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 12), woodMat);
    mast.position.y = 0.2;
    group.add(mast);

    // Spiral Linen Helix
    const helixGeo = new THREE.TorusGeometry(0.65, 0.2, 12, 32, Math.PI * 3.5);
    const helix = new THREE.Mesh(helixGeo, linenMat);
    helix.rotation.x = Math.PI / 2.3;
    helix.position.y = 0.3;
    group.add(helix);
  }

  // 24. Aztec Sunstone
  static buildAztecSunstone(group) {
    const basaltMat = new THREE.MeshStandardMaterial({ color: 0x3d3835, roughness: 0.85 });

    // Colossal Disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 36), basaltMat);
    disc.rotation.x = Math.PI / 2;
    group.add(disc);

    // Central Tonatiuh face relief
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), this.getGoldMaterial());
    face.position.z = 0.12;
    group.add(face);

    // Concentric glyph rings
    for (let r = 0.45; r <= 1.05; r += 0.2) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 32), basaltMat);
      ring.position.z = 0.1;
      group.add(ring);
    }
  }

  // 25. Viking Runestone
  static buildVikingRunestone(group) {
    const graniteMat = new THREE.MeshStandardMaterial({ color: 0x5a5552, roughness: 0.9 });
    const redRuneMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });

    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.3), graniteMat);
    group.add(stone);

    // Younger Futhark Runic band
    const runeBand = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.45, 0.32), redRuneMat);
    runeBand.scale.set(0.9, 0.9, 1);
    group.add(runeBand);
  }

  // 26. Terracotta Warrior
  static buildTerracottaWarrior(group) {
    const clayMat = new THREE.MeshStandardMaterial({ color: 0x8a5a44, roughness: 0.85 });

    // Armor Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), clayMat);
    group.add(torso);

    // Head with topknot
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), clayMat);
    head.position.y = 0.72;
    group.add(head);

    const topknot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), clayMat);
    topknot.position.set(0.12, 1.05, 0);
    group.add(topknot);

    // Legs
    [-0.18, 0.18].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8, 12), clayMat);
      leg.position.set(x, -0.85, 0);
      group.add(leg);
    });
  }

  // 27. Islamic Astrolabe
  static buildAstrolabe(group) {
    const brassMat = this.getGoldMaterial();

    // Mater Disc with throne ring
    const mater = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 32), brassMat);
    mater.rotation.x = Math.PI / 2;
    group.add(mater);

    // Throne suspension ring at top
    const throne = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), brassMat);
    throne.position.set(0, 0.95, 0);
    group.add(throne);

    // Openwork Rete
    const rete = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.75, 24), new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide }));
    rete.position.z = 0.04;
    group.add(rete);
  }

  // 28. Parthenon Metope
  static buildParthenonMetope(group) {
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.8 });

    // Marble Tablet
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.25), marbleMat);
    group.add(tablet);

    // Sculptural figures relief
    const fig1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), marbleMat);
    fig1.position.set(-0.28, 0.2, 0.2);
    group.add(fig1);

    const fig2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.7, 12), marbleMat);
    fig2.position.set(0.3, -0.1, 0.18);
    fig2.rotation.z = -0.4;
    group.add(fig2);
  }

  // 29. Samurai Armor & Katana
  static buildSamuraiArmor(group) {
    const lacquerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.5 });
    const goldMat = this.getGoldMaterial();

    // Kabuto Helmet bowl
    const kabuto = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), lacquerMat);
    kabuto.position.y = 0.4;
    group.add(kabuto);

    // Golden Crescent Crest (Maedate)
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24, Math.PI), goldMat);
    crescent.position.set(0, 0.9, 0.4);
    group.add(crescent);

    // Katana blade resting on stand
    const katana = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.02), this.getSteelMaterial());
    katana.position.set(0, -0.4, 0.3);
    katana.rotation.z = -0.15;
    group.add(katana);
  }

  // 30. Dead Sea Scrolls Jar
  static buildDeadSeaJar(group) {
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xba9270, roughness: 0.85 });

    // Tall Cylindrical Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.4, 24), clayMat);
    group.add(body);

    // Hemispherical Bowl Lid
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), clayMat);
    lid.position.y = 0.7;
    group.add(lid);
  }

  // 31. Sputnik 1 Satellite
  static buildSputnik(group) {
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.95,
      roughness: 0.1
    });

    // Polished aluminum sphere
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), chromeMat);
    group.add(sphere);

    // 4 Long trailing whip antennas
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, 2.2, 8), chromeMat);
      antenna.position.set(Math.cos(angle) * 0.6, -0.8, Math.sin(angle) * 0.6);
      antenna.rotation.z = Math.cos(angle) * 0.55;
      antenna.rotation.x = -Math.sin(angle) * 0.55;
      group.add(antenna);
    }
  }

  // 32. Venus of Willendorf Figurine
  static buildVenusFigurine(group) {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8715a, roughness: 0.9 });

    // Stylized Paleolithic Contours
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), stoneMat);
    torso.scale.set(1.1, 1.2, 1.15);
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), stoneMat);
    head.position.y = 0.7;
    group.add(head);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.5, 16), stoneMat);
    base.position.y = -0.65;
    group.add(base);
  }

  static buildGenericArtifact(group) {
    const geo = new THREE.DodecahedronGeometry(0.7, 0);
    const mat = this.getGoldMaterial();
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
  }
}

window.ProceduralModelFactory = ProceduralModelFactory;