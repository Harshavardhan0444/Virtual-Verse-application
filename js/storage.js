/**
 * VirtualVerse – Cosmic Archive
 * js/storage.js
 * Central Persistence and Data Management Layer with LocalStorage
 * Includes offline self-bootstrapping fallback dataset for file:/// and local HTTP execution.
 */

const STORAGE_KEYS = {
  ARTIFACTS: 'vv_artifacts_v1',
  COLLECTIONS: 'vv_collections_v1',
  ROOMS: 'vv_rooms_v1',
  QUIZ: 'vv_quiz_v1',
  USERS: 'vv_users_v1',
  CURRENT_USER: 'vv_session_user_v1',
  FAVORITES: 'vv_favorites_v1',
  EXPLORATION: 'vv_exploration_v1',
  ACHIEVEMENTS: 'vv_achievements_v1',
  STATS: 'vv_system_stats_v1'
};

// System achievements definitions
const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_step', title: 'Cosmic Initiate', desc: 'Enter the 3D museum and begin exploration', icon: 'fa-compass', xp: 50 },
  { id: 'dimensional_traveler', title: 'Dimensional Traveler', desc: 'Step through portals into all 5 museum chambers', icon: 'fa-door-open', xp: 150 },
  { id: 'keen_observer', title: 'Keen Observer', desc: 'Inspect at least 5 artifacts in 360° 3D detail', icon: 'fa-eye', xp: 100 },
  { id: 'grand_archivist', title: 'Grand Archivist', desc: 'Explore and read details of 20+ artifacts', icon: 'fa-book-atlas', xp: 250 },
  { id: 'space_voyager', title: 'Stellar Voyager', desc: 'Investigate the Space Exploration Chamber', icon: 'fa-shuttle-space', xp: 75 },
  { id: 'pharaohs_scholar', title: 'Pharaoh\'s Scholar', desc: 'Investigate the Ancient Civilization Hall', icon: 'fa-ankh', xp: 75 },
  { id: 'collector', title: 'Relic Collector', desc: 'Bookmark 5 or more artifacts to personal favorites', icon: 'fa-bookmark', xp: 100 },
  { id: 'guided_voyager', title: 'Guided Voyager', desc: 'Complete the automated cinematic guided tour', icon: 'fa-route', xp: 120 },
  { id: 'knowledge_seeker', title: 'Knowledge Seeker', desc: 'Complete your first museum educational quiz', icon: 'fa-graduation-cap', xp: 80 },
  { id: 'omniscient_mind', title: 'Omniscient Mind', desc: 'Score a perfect 100% on the educational quiz', icon: 'fa-crown', xp: 300 }
];

// Default demo accounts
const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    name: 'Dr. Evelyn Vance (Chief Curator)',
    email: 'admin@virtualverse.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'assets/images/avatar-curator.png',
    title: 'High Curator & Software Architect',
    joinedDate: '2026-01-15'
  },
  {
    id: 'usr_student',
    name: 'Alex Mercer',
    email: 'student@mca.edu',
    password: 'student123',
    role: 'user',
    avatar: 'assets/images/avatar-student.png',
    title: 'Cosmic Research Fellow',
    joinedDate: '2026-02-01'
  }
];

class StorageManager {
  static isInitialized = false;

  static async init() {
    if (this.isInitialized) return;

    // Check if base data is already present in localStorage
    if (!localStorage.getItem(STORAGE_KEYS.ARTIFACTS) || !localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      await this.seedData();
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }

    // Initialize default guest user if no session
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      const guestUser = {
        id: 'usr_guest',
        name: 'Cosmic Guest Explorer',
        email: 'guest@virtualverse.io',
        role: 'guest',
        avatar: 'assets/images/avatar-guest.png',
        title: 'Visitor of the Cosmic Archive',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
    }

    this.isInitialized = true;
  }

  static async seedData() {
    let artRes = null, colRes = null, roomRes = null, quizRes = null;

    try {
      // Attempt to load from JSON files via relative paths
      const results = await Promise.all([
        fetch('data/artifacts.json').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('data/collections.json').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('data/rooms.json').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('data/quiz-questions.json').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      artRes = results[0];
      colRes = results[1];
      roomRes = results[2];
      quizRes = results[3];
    } catch (e) {
      console.warn('Network fetch for JSON failed (file:// or CORS), falling back to offline dataset.', e);
    }

    // If fetch failed or returned null (e.g. running from file://), use embedded fallback datasets
    if (!artRes || !colRes || !roomRes || !quizRes) {
      colRes = this.getFallbackCollections();
      roomRes = this.getFallbackRooms();
      artRes = this.getFallbackArtifacts();
      quizRes = this.getFallbackQuizQuestions();
    }

    localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artRes));
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(colRes));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(roomRes));
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(quizRes));
  }

  /* ----------------- EMBEDDED FALLBACK DATASETS ----------------- */
  static getFallbackCollections() {
    return [
      {
        "id": "col-ancient",
        "name": "Ancient Civilizations",
        "subtitle": "Echoes of the First Empires",
        "description": "Traverse the cradle of human society. Marvel at royal relics from the Nile, the Tigris, and the Indus valley that shaped early law, art, and spirituality.",
        "themeColor": "#F59E0B",
        "accentColor": "#FDE68A",
        "icon": "fa-landmark",
        "gradient": "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-ancient",
        "tags": ["Egypt", "Mesopotamia", "Indus", "Pharaohs", "Dynasties"]
      },
      {
        "id": "col-history",
        "name": "Historical Artifacts",
        "subtitle": "Relics That Altered World History",
        "description": "Witness the tangible instruments of war, diplomacy, and discovery. From medieval royal blades to code-breaking cipher engines that changed world destinies.",
        "themeColor": "#EF4444",
        "accentColor": "#FCA5A5",
        "icon": "fa-shield-halved",
        "gradient": "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-heritage",
        "tags": ["Weapons", "Manuscripts", "Artifacts", "Warfare", "Peace"]
      },
      {
        "id": "col-space",
        "name": "Space and Astronomy",
        "subtitle": "Voyages Beyond Earth's Horizon",
        "description": "Journey through interstellar frontiers. Inspect monumental probes, cosmic observatories, planetary bodies, and celestial navigation instruments.",
        "themeColor": "#00E5FF",
        "accentColor": "#67E8F9",
        "icon": "fa-rocket",
        "gradient": "linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 5,
        "roomId": "room-space",
        "tags": ["Cosmos", "Satellites", "Planets", "Telescopes", "Deep Space"]
      },
      {
        "id": "col-science",
        "name": "Science and Technology",
        "subtitle": "Inventions That Redefined Existence",
        "description": "From Watson and Crick's DNA revelation to the birth of computing, quantum superposition, and high-voltage electricity.",
        "themeColor": "#10B981",
        "accentColor": "#6EE7B7",
        "icon": "fa-atom",
        "gradient": "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-science",
        "tags": ["Physics", "Genetics", "Computing", "Electromagnetism", "Quantum"]
      },
      {
        "id": "col-digital",
        "name": "Digital Art Gallery",
        "subtitle": "Dimensions of Cybernetic Aesthetics",
        "description": "Experience boundless algorithmic art, 4D geometric hyperstructures, and radiant neon constructs synthesized directly inside the Cosmic Archive.",
        "themeColor": "#8B5CF6",
        "accentColor": "#C4B5FD",
        "icon": "fa-cube",
        "gradient": "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 3,
        "roomId": "room-digital",
        "tags": ["Cyberpunk", "Generative", "Hypercube", "Sculpture", "Holography"]
      },
      {
        "id": "col-heritage",
        "name": "World Heritage",
        "subtitle": "Treasures of Universal Value",
        "description": "Preserved marvels designated as irreplaceable pinnacles of civilization, philosophy, scripture, and ancient architectural mastery.",
        "themeColor": "#EC4899",
        "accentColor": "#F472B6",
        "icon": "fa-globe",
        "gradient": "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-heritage",
        "tags": ["UNESCO", "Monuments", "Sculpture", "Rotunda", "Temples"]
      },
      {
        "id": "col-architecture",
        "name": "Ancient Architecture",
        "subtitle": "Engineering Feats of the Ancients",
        "description": "Decode the structural genius of the Great Pyramids, Roman basilicas, Parthenon proportions, and stone henges built millennia ago.",
        "themeColor": "#F97316",
        "accentColor": "#FDBA74",
        "icon": "fa-monument",
        "gradient": "linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-ancient",
        "tags": ["Pyramids", "Columns", "Masonry", "Golden Ratio", "Temples"]
      },
      {
        "id": "col-mythology",
        "name": "Mythology and Culture",
        "subtitle": "Pantheons, Epics, and Rituals",
        "description": "Explore the sacred stories, celestial deities, and mystical totems from Norse seafarers, Mesoamerican calendar priests, and Classical Greek philosophers.",
        "themeColor": "#3B82F6",
        "accentColor": "#93C5FD",
        "icon": "fa-hat-wizard",
        "gradient": "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 20, 38, 0.9))",
        "exhibitCount": 4,
        "roomId": "room-heritage",
        "tags": ["Deities", "Legends", "Folklore", "Runes", "Sun Stones"]
      }
    ];
  }

  static getFallbackRooms() {
    return [
      {
        "id": "room-ancient",
        "name": "Ancient Civilization Hall",
        "code": "ARCH-01",
        "theme": "ancient",
        "description": "Monumental sandstone colonnades, hieroglyphic engravings, and warm amber brazier illumination showcasing relics of Egypt, Mesopotamia, and Classical Antiquity.",
        "ambientColor": "#F59E0B",
        "lightIntensity": 1.2,
        "fogColor": "#140e07",
        "floorColor": "#1e160e",
        "wallColor": "#2a1c12",
        "accentColor": "#FBBF24",
        "dimensions": { "width": 60, "height": 18, "depth": 60 },
        "spawnPoint": { "x": 0, "y": 2, "z": 22 },
        "portals": [
          { "targetRoom": "room-space", "name": "Space Chamber", "position": { "x": 25, "y": 0, "z": 0 }, "rotation": -1.57 },
          { "targetRoom": "room-heritage", "name": "Heritage Gallery", "position": { "x": -25, "y": 0, "z": 0 }, "rotation": 1.57 }
        ]
      },
      {
        "id": "room-space",
        "name": "Space Exploration Chamber",
        "code": "COSMO-02",
        "theme": "space",
        "description": "An open celestial observatory overlooking an endless cosmic nebula, glittering star clusters, orbiting ringed planets, and human deep-space exploration probes.",
        "ambientColor": "#00E5FF",
        "lightIntensity": 0.9,
        "fogColor": "#050814",
        "floorColor": "#080c1d",
        "wallColor": "#0b122b",
        "accentColor": "#38BDF8",
        "dimensions": { "width": 70, "height": 22, "depth": 70 },
        "spawnPoint": { "x": 0, "y": 2, "z": 24 },
        "portals": [
          { "targetRoom": "room-ancient", "name": "Ancient Hall", "position": { "x": -28, "y": 0, "z": 0 }, "rotation": 1.57 },
          { "targetRoom": "room-digital", "name": "Digital Dimension", "position": { "x": 0, "y": 0, "z": -28 }, "rotation": 3.14 }
        ]
      },
      {
        "id": "room-digital",
        "name": "Digital Art Dimension",
        "code": "CYBER-03",
        "theme": "digital",
        "description": "A surreal cybernetic void dominated by morphing 4D hypercubes, holographic light grids, reactive sound waves, and pulsing violet neon energy arrays.",
        "ambientColor": "#8B5CF6",
        "lightIntensity": 1.1,
        "fogColor": "#0b0518",
        "floorColor": "#120a26",
        "wallColor": "#180c35",
        "accentColor": "#A855F7",
        "dimensions": { "width": 64, "height": 20, "depth": 64 },
        "spawnPoint": { "x": 0, "y": 2, "z": 22 },
        "portals": [
          { "targetRoom": "room-space", "name": "Space Chamber", "position": { "x": 0, "y": 0, "z": 26 }, "rotation": 0 },
          { "targetRoom": "room-science", "name": "Science Lab", "position": { "x": 26, "y": 0, "z": 0 }, "rotation": -1.57 }
        ]
      },
      {
        "id": "room-science",
        "name": "Science & Innovation Lab",
        "code": "NEXUS-04",
        "theme": "science",
        "description": "A pristine high-tech quantum laboratory with glowing hexagonal light tiles, magnetic containment fields, rotating DNA macromolecules, and particle colliders.",
        "ambientColor": "#10B981",
        "lightIntensity": 1.3,
        "fogColor": "#04140f",
        "floorColor": "#082119",
        "wallColor": "#0d3126",
        "accentColor": "#34D399",
        "dimensions": { "width": 62, "height": 18, "depth": 62 },
        "spawnPoint": { "x": 0, "y": 2, "z": 22 },
        "portals": [
          { "targetRoom": "room-digital", "name": "Digital Dimension", "position": { "x": -26, "y": 0, "z": 0 }, "rotation": 1.57 },
          { "targetRoom": "room-heritage", "name": "Heritage Gallery", "position": { "x": 0, "y": 0, "z": -26 }, "rotation": 3.14 }
        ]
      },
      {
        "id": "room-heritage",
        "name": "Historical Heritage Gallery",
        "code": "CHRONO-05",
        "theme": "heritage",
        "description": "A grand neo-classical marble rotunda crowned by vaulted Romanesque arches, golden friezes, and warm gallery downlights preserving priceless treasures of humanity.",
        "ambientColor": "#EC4899",
        "lightIntensity": 1.2,
        "fogColor": "#150610",
        "floorColor": "#220919",
        "wallColor": "#320e25",
        "accentColor": "#F472B6",
        "dimensions": { "width": 64, "height": 20, "depth": 64 },
        "spawnPoint": { "x": 0, "y": 2, "z": 22 },
        "portals": [
          { "targetRoom": "room-science", "name": "Science Lab", "position": { "x": 0, "y": 0, "z": 26 }, "rotation": 0 },
          { "targetRoom": "room-ancient", "name": "Ancient Hall", "position": { "x": 26, "y": 0, "z": 0 }, "rotation": -1.57 }
        ]
      }
    ];
  }

  static getFallbackArtifacts() {
    return [
      {
        "id": "art-01",
        "name": "Mask of Tutankhamun",
        "category": "Ancient Civilizations",
        "collectionId": "col-ancient",
        "roomId": "room-ancient",
        "position": { "x": 0, "y": 1.6, "z": 0 },
        "historicalPeriod": "c. 1323 BCE (18th Dynasty)",
        "origin": "Valley of the Kings, Thebes, Ancient Egypt",
        "material": "Solid Gold (24K), Lapis Lazuli, Turquoise, Obsidian, Carnelian",
        "dimensions": "54 cm × 39.3 cm × 49 cm (Weight: 10.23 kg)",
        "discoveryInfo": "Discovered intact in November 1922 by British archaeologist Howard Carter in tomb KV62.",
        "significance": "Considered the apex of ancient Egyptian goldsmithing and funerary artwork. It represents the boy king resurrected with attributes of Osiris, guide to the underworld.",
        "description": "The burial mask of Pharaoh Tutankhamun is fashioned from two layers of high-carat gold beaten together. It features the royal nemes headdress with the vulture goddess Nekhbet and the cobra goddess Wadjet guarding the brow, and an inlaid false lapis lazuli beard symbolizing divine kingship.",
        "funFacts": [
          "The false beard broke off in 2014 and was hastily reattached with epoxy before undergoing an emergency restoration using ancient Egyptian beeswax.",
          "The eyes are fashioned from quartz with obsidian pupils and red carnelian dots at the corners to mimic biological tear ducts.",
          "An ancient inscription on the back and shoulders contains Spell 151b from the Egyptian Book of the Dead."
        ],
        "modelType": "tutankhamun_mask",
        "modelPath": "assets/models/tutankhamun_mask.glb",
        "featured": true,
        "year": -1323
      },
      {
        "id": "art-02",
        "name": "The Rosetta Stone",
        "category": "Ancient Civilizations",
        "collectionId": "col-ancient",
        "roomId": "room-ancient",
        "position": { "x": -12, "y": 1.5, "z": -8 },
        "historicalPeriod": "196 BCE (Ptolemaic Dynasty)",
        "origin": "Rashid (Rosetta), Nile Delta, Egypt",
        "material": "Granodiorite Stone with Compact Mineral Polish",
        "dimensions": "112.3 cm × 75.7 cm × 28.4 cm (Weight: 760 kg)",
        "discoveryInfo": "Discovered in July 1799 by French officer Pierre-François Bouchard during Napoleon Bonaparte's Egyptian Expedition.",
        "significance": "The linguistic cipher key that unlocked the forgotten ancient Egyptian language after 1,400 years of silence, paving the foundation of modern Egyptology.",
        "description": "A dark granodiorite stele bearing a royal decree issued at Memphis on behalf of King Ptolemy V Epiphanes. The decree is transcribed in three distinct scripts: Ancient Egyptian hieroglyphs for priests, Egyptian Demotic for everyday governance, and Ancient Greek for administration.",
        "funFacts": [
          "Jean-François Champollion finally cracked the hieroglyphic cartouches in Paris in 1822 after discovering names like Ptolemy and Cleopatra.",
          "Despite its greyish-pink appearance today, the stone was originally thought to be black basalt until modern laser cleanings.",
          "Only about two-thirds of the original inscription survives; the top hieroglyphic register is the most severely broken."
        ],
        "modelType": "rosetta_stone",
        "modelPath": "assets/models/rosetta_stone.glb",
        "featured": true,
        "year": -196
      },
      {
        "id": "art-03",
        "name": "Bust of Nefertiti",
        "category": "Ancient Civilizations",
        "collectionId": "col-ancient",
        "roomId": "room-ancient",
        "position": { "x": 12, "y": 1.6, "z": -8 },
        "historicalPeriod": "c. 1345 BCE (Amarna Period)",
        "origin": "Amarna (Akhetaten), Egypt",
        "material": "Limestone Core, Stucco Coating, Natural Pigments",
        "dimensions": "48 cm × 25 cm × 35 cm (Weight: 20 kg)",
        "discoveryInfo": "Excavated in December 1912 by German archaeologist Ludwig Borchardt at the workshop of the royal sculptor Thutmose.",
        "significance": "The global epitome of feminine grace and royal beauty, demonstrating the radical naturalistic realism of the Amarna art revolution under Pharaoh Akhenaten.",
        "description": "A painted stucco-coated limestone bust portraying the Great Royal Wife of Akhenaten. She wears her iconic cobalt-blue flat-topped crown adorned with a golden diadem. The work demonstrates breathtaking facial symmetry and anatomical precision.",
        "funFacts": [
          "The left eye socket has never held an iris inlay; CT scans prove the sculptor intentionally never placed quartz there.",
          "Subsurface 3D tomography revealed a finely sculpted inner limestone face beneath the outer plaster layers, showing gentle wrinkles around the mouth.",
          "The pigment recipes included powdered charcoal, cinnabar, calcite, and Egyptian blue frit."
        ],
        "modelType": "nefertiti_bust",
        "modelPath": "assets/models/nefertiti_bust.glb",
        "featured": false,
        "year": -1345
      },
      {
        "id": "art-04",
        "name": "Great Pyramid Capstone (Pyramidion)",
        "category": "Ancient Architecture",
        "collectionId": "col-architecture",
        "roomId": "room-ancient",
        "position": { "x": 0, "y": 1.5, "z": -16 },
        "historicalPeriod": "c. 2560 BCE (Old Kingdom)",
        "origin": "Giza Plateau, Egypt",
        "material": "Tura Limestone, Gilded Electrum Alloy Shell",
        "dimensions": "157 cm base × 140 cm height",
        "discoveryInfo": "Recovered from sacred burial grounds surrounding the monumental complexes of the Giza necropolis.",
        "significance": "The apex stone that crowned ancient pyramids, catching the first and last rays of the sun god Ra as a golden beacon across hundreds of miles.",
        "description": "A four-sided pyramidal capstone polished to a mirror shine and historically coated in electrum (an alloy of gold and silver). It represents the sacred Benben stone, the primordial mound from which creation sprang in ancient Egyptian theology.",
        "funFacts": [
          "When the sun rose, the gleaming electrum capstone was the first object in Egypt to shine, reflecting light across the Nile valley.",
          "The slopes are carved at precisely 51°50'40\", identical to the monumental angle of the Great Pyramid of Khufu.",
          "Engraved invocations pray for the soul of the Pharaoh to ascend along the celestial sunbeams directly to the imperishable circumpolar stars."
        ],
        "modelType": "giza_pyramid",
        "modelPath": "assets/models/giza_pyramid.glb",
        "featured": true,
        "year": -2560
      },
      {
        "id": "art-05",
        "name": "Greek Amphora of Achilles and Ajax",
        "category": "Mythology and Culture",
        "collectionId": "col-mythology",
        "roomId": "room-ancient",
        "position": { "x": -14, "y": 1.4, "z": 10 },
        "historicalPeriod": "c. 530 BCE (Archaic Greece)",
        "origin": "Attica (Athens), Classical Greece",
        "material": "Fired Terracotta Clay with Black-Figure Slip",
        "dimensions": "61 cm height × 38 cm diameter",
        "discoveryInfo": "Painted and signed by the master ceramist Exekias, discovered in an Etruscan burial tomb at Vulci, Italy.",
        "significance": "A crowning masterpiece of Archaic Greek pottery, capturing the psychological intimacy of Homeric heroes at the siege of Troy.",
        "description": "An exquisite black-figure amphora portraying the Greek champions Achilles and Ajax clad in full armor, hunching over a gaming board between battles. Words inscribed near their mouths reveal Achilles calling out 'four' while Ajax calls out 'three'.",
        "funFacts": [
          "The spears held by the two warriors lead the viewer's gaze precisely along triangular geometric sightlines into the central game board.",
          "The intricate cloaks were incised with micro-needles through black slip into wet clay prior to single-stage oxygen reduction firing.",
          "Exekias pioneered three-dimensional spatial depth on two-dimensional pottery centuries before Renaissance linear perspective."
        ],
        "modelType": "greek_amphora",
        "modelPath": "assets/models/greek_amphora.glb",
        "featured": false,
        "year": -530
      },
      {
        "id": "art-06",
        "name": "Saturn & The Cassini-Huygens System",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": 0, "y": 2.2, "z": 0 },
        "historicalPeriod": "Mission: 1997–2017 CE",
        "origin": "Outer Solar System (JPL / NASA / ESA / ASI)",
        "material": "Hydrogen-Helium Atmosphere, Water-Ice Ring Particles, Titanium/Carbon Probe",
        "dimensions": "Planetary Diameter: 120,536 km | Probe: 6.7 m length",
        "discoveryInfo": "Cassini orbited Saturn from 2004 until its intentional 'Grand Finale' atmospheric dive on September 15, 2017.",
        "significance": "Discovered global subsurface oceans on Enceladus and methane weather cycles on Titan, transforming our understanding of habitable zones in deep space.",
        "description": "A high-fidelity cosmic representation of the sixth planet from the Sun, featuring its luminous multi-tiered ring system composed of billions of water-ice boulders, accompanied by the Cassini orbiter in perpetual reconnaissance.",
        "funFacts": [
          "Saturn's rings span up to 282,000 km across, yet their vertical thickness is astonishingly thin—averaging only 10 to 30 meters!",
          "Saturn is the only planet in our solar system that is less dense than liquid water; if a bathtub were large enough, Saturn would float.",
          "Cassini recorded liquid methane oceans and hydrocarbon sand dunes on Saturn's colossal moon Titan."
        ],
        "modelType": "saturn_planet",
        "modelPath": "assets/models/saturn_planet.glb",
        "featured": true,
        "year": 2017
      },
      {
        "id": "art-07",
        "name": "James Webb Space Telescope (JWST)",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": 14, "y": 1.8, "z": -10 },
        "historicalPeriod": "2021 CE – Present (Operational)",
        "origin": "Sun-Earth Lagrange Point 2 (L2), 1.5M km from Earth",
        "material": "Gold-coated Beryllium Mirrors, Kapton Sunshield, Carbon Composite Truss",
        "dimensions": "20.2 m × 14.2 m sunshield | 6.5 m primary mirror array",
        "discoveryInfo": "Launched on December 25, 2021, aboard an Ariane 5 rocket from Kourou, French Guiana.",
        "significance": "The premier astrophysics space observatory of our era, peerless in infrared sensitivity to detect the very first stars and galaxies formed after the Big Bang.",
        "description": "Featuring 18 hexagonal primary mirror segments coated in an atom-thin film of 24-karat gold for maximum infrared reflection, perched atop a five-layered tennis-court-sized Kapton sunshield that keeps the optics cooled to –233°C (40 Kelvin).",
        "funFacts": [
          "The gold layer on all 18 primary mirrors combined contains only 48.25 grams of pure gold—roughly the mass of a single golf ball!",
          "JWST looks so deep into the cosmos that it captures ancient photons emitted over 13.5 billion years ago, just hundreds of millions of years after cosmic dawn.",
          "The 5-layer thermal sunshield shields the telescope from Sun and Earth heat, yielding a temperature difference of over 300°C between the hot and cold sides."
        ],
        "modelType": "jwst",
        "modelPath": "assets/models/jwst.glb",
        "featured": true,
        "year": 2021
      },
      {
        "id": "art-08",
        "name": "Voyager Golden Record & Probe",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": -14, "y": 1.8, "z": -10 },
        "historicalPeriod": "1977 CE – Present",
        "origin": "Interstellar Space (Voyager 1 & 2, NASA JPL)",
        "material": "Gold-Plated Copper Phonograph Disc, Uranium-238 Protective Cover",
        "dimensions": "Record: 30 cm diameter | Spacecraft: 3.7 m parabolic dish",
        "discoveryInfo": "Curated by Dr. Carl Sagan and launched aboard Voyager 1 on September 5, 1977; now traversing interstellar space over 24 billion kilometers away.",
        "significance": "A cosmic time capsule representing humanity's greetings, music, cultural heritage, and geographic location to any extraterrestrial civilization.",
        "description": "A 12-inch gold-plated copper phonograph record carrying 115 natural science images encoded in analog signals, spoken greetings in 55 human languages, 90 minutes of world music, whale songs, and pulsar timing maps to pinpoint our home sun.",
        "funFacts": [
          "The electroplated cover is coated with an ultra-pure sample of Uranium-238, allowing aliens to calculate the record's age via radioactive half-life decay.",
          "Voyager 1 is the most distant human-made object in history, traveling at over 61,000 km/h (38,000 mph) through interstellar plasma.",
          "Carl Sagan originally attempted to include The Beatles' 'Here Comes the Sun', but EMI records declined copyright permissions at the time."
        ],
        "modelType": "golden_record",
        "modelPath": "assets/models/golden_record.glb",
        "featured": true,
        "year": 1977
      },
      {
        "id": "art-09",
        "name": "Apollo 11 Lunar Module Descent Stage",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": 12, "y": 1.5, "z": 12 },
        "historicalPeriod": "July 20, 1969 CE",
        "origin": "Mare Tranquillitatis (Sea of Tranquility), The Moon",
        "material": "Titanium, Aluminum Alloy, Gold Mylar & Kapton Thermal Foil",
        "dimensions": "4.3 m height × 9.4 m landing gear spread (Weight: 2,150 kg dry)",
        "discoveryInfo": "Piloted to a historic lunar touchdown by Neil Armstrong and Buzz Aldrin on Apollo Mission 11.",
        "significance": "The physical vessel that accomplished humanity's first extraterrestrial landing on another celestial body, immortalizing Neil Armstrong's giant leap.",
        "description": "An octagonal spacecraft chassis resting on four shock-absorbing footpads, insulated in crinkled amber Kapton thermal insulation foil with a gimbaled hypergolic rocket engine and plaque declaring 'Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind.'",
        "funFacts": [
          "The walls of the lunar module cabin were so thin in weight-reduction efforts that they measured only two sheets of aluminum foil thick in non-pressurized zones.",
          "When Armstrong manually steered clear of a boulder crater with 25 seconds of descent propellant remaining, his heart rate spiked to 156 beats per minute.",
          "The descent stage still sits undisturbed in the pristine lunar vacuum at Tranquility Base today."
        ],
        "modelType": "lunar_lander",
        "modelPath": "assets/models/lunar_lander.glb",
        "featured": false,
        "year": 1969
      },
      {
        "id": "art-10",
        "name": "Pulsar Magnetar Core (Crab Pulsar)",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": -12, "y": 2.0, "z": 12 },
        "historicalPeriod": "Current Epoch (Supernova recorded 1054 CE)",
        "origin": "Crab Nebula (Taurus Constellation, 6,500 light-years away)",
        "material": "Superdense Degenerate Neutronium Matter, Magnetic Flux Beams",
        "dimensions": "20 km diameter (1.4 Solar Masses compressed)",
        "discoveryInfo": "Associated with Chinese court astronomer records of guest star SN 1054, confirmed as a pulsating radio neutron star in 1968.",
        "significance": "A cosmic powerhouse spinning 30 times every single second, emitting concentrated beams of electromagnetic synchrotron radiation like a galactic lighthouse.",
        "description": "A miniature, incandescent sphere of degenerate nuclear matter wrapped in swirling relativistic particle wind rings and luminous cyan magnetic polarity beams that sweep across deep space in rhythm.",
        "funFacts": [
          "A single teaspoon of neutron star matter would weigh roughly 6 billion metric tons on Earth—equivalent to the weight of Mount Everest!",
          "The magnetic field of the Crab Pulsar is over one trillion times stronger than the magnetic field of planet Earth.",
          "Its rotation is so precise that pulsars serve as natural cosmic atomic clocks for deep interstellar navigation."
        ],
        "modelType": "pulsar_star",
        "modelPath": "assets/models/pulsar_star.glb",
        "featured": false,
        "year": 1054
      },
      {
        "id": "art-11",
        "name": "Tesseract 4D Hypercube Projection",
        "category": "Digital Art Gallery",
        "collectionId": "col-digital",
        "roomId": "room-digital",
        "position": { "x": 0, "y": 2.2, "z": 0 },
        "historicalPeriod": "Theoretical 1880 CE / Algorithmic 21st Century",
        "origin": "Fourth Dimension Topological Geometry / Cosmic Archive Core",
        "material": "Coherent Laser Photons, Refracted Quantum Glass, Neon Plasma",
        "dimensions": "4D Hypervolume = a⁴ (Projected 3D envelope: 3m × 3m × 3m)",
        "discoveryInfo": "Formulated geometrically by mathematician Charles Howard Hinton in 1888 and simulated interactively in VirtualVerse.",
        "significance": "The quintessential mathematical visualization of higher-dimensional hyperspace, illustrating how a 4D cube rotates into 3D observational space.",
        "description": "An 8-celled four-dimensional cube projected into three-dimensional space, comprised of nested wireframe cubes connected at 16 vertices, continuously executing a mesmerizing topological self-inversion rotation.",
        "funFacts": [
          "A 3D cube has 6 square faces and 12 edges, while a 4D tesseract has 8 bounding cubes, 24 squares, 32 edges, and 16 vertices.",
          "Just as a 3D cube casts a flat 2D shadow onto a wall, a 4D tesseract casts a volumetric 3D shadow into our universe.",
          "Salvador Dalí famously used the unfolded 3D net of a tesseract in his iconic 1954 painting 'Crucifixion (Corpus Hypercubus)'."
        ],
        "modelType": "tesseract_cube",
        "modelPath": "assets/models/tesseract_cube.glb",
        "featured": true,
        "year": 1888
      },
      {
        "id": "art-12",
        "name": "Cybernetic Polyhedral Core",
        "category": "Digital Art Gallery",
        "collectionId": "col-digital",
        "roomId": "room-digital",
        "position": { "x": 14, "y": 1.8, "z": -10 },
        "historicalPeriod": "Generative Era (Digital Avant-Garde)",
        "origin": "VirtualVerse Algorithmic Forge",
        "material": "Iridescent Bismuth Shards, Liquid Mercury Crystal, LED Neon Wire",
        "dimensions": "2.4 m height × 2.0 m diameter",
        "discoveryInfo": "Synthesized by deep geometric neural networks exploring parametric non-Euclidean polyhedra.",
        "significance": "Represents the fusion of organic symmetry and cybernetic computational architecture in modern generative digital art.",
        "description": "A floating stellated icosahedron constructed from dichroic glass facets that refract dynamic violet and cyan spectra, encircled by pulsating rings of neon flux.",
        "funFacts": [
          "The geometry contains exact Golden Ratio phi (1.618) harmonics embedded within its vertex coordinates.",
          "Real-time shader equations oscillate the refraction indices to produce organic optical breathing effects.",
          "Its glowing core responds acoustically to surrounding museum ambient audio frequencies."
        ],
        "modelType": "polyhedral_core",
        "modelPath": "assets/models/polyhedral_core.glb",
        "featured": false,
        "year": 2026
      },
      {
        "id": "art-13",
        "name": "Holographic Neural Monolith",
        "category": "Digital Art Gallery",
        "collectionId": "col-digital",
        "roomId": "room-digital",
        "position": { "x": -14, "y": 1.8, "z": -10 },
        "historicalPeriod": "Synthetic Renaissance",
        "origin": "Cosmic Archive Matrix",
        "material": "Optically Active Aerogel, Micro-LED Nano-Lattice",
        "dimensions": "3.5 m height × 1.2 m width × 0.4 m depth",
        "discoveryInfo": "Constructed as an interactive monument honoring the dawn of autonomous synthetic intelligence.",
        "significance": "A towering black obsidian monolith that pulses with golden synapses whenever visitors observe its surface.",
        "description": "Inspired by Arthur C. Clarke's 2001: A Space Odyssey, this sleek monolith is inscribed with dynamic holographic node graphs that ripple in real-time.",
        "funFacts": [
          "The dimensional proportions strictly adhere to the mathematical progression 1 : 4 : 9 (squares of the first three integers).",
          "Over 40,000 algorithmic nodes calculate synthetic thought vectors visualized as glowing blue spark discharge across the surface.",
          "It serves as the symbolic quantum compute archive of all VirtualVerse historical memories."
        ],
        "modelType": "neural_monolith",
        "modelPath": "assets/models/neural_monolith.glb",
        "featured": false,
        "year": 2024
      },
      {
        "id": "art-14",
        "name": "Double Helix DNA Molecular Model",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": 0, "y": 2.0, "z": 0 },
        "historicalPeriod": "1953 CE",
        "origin": "Cavendish Laboratory, Cambridge, United Kingdom",
        "material": "Polished Brass Rods, Phosphor Acrylic Spheres, Chromed Bases",
        "dimensions": "3.2 m height × 0.8 m diameter (Macro Scale Model)",
        "discoveryInfo": "Decoded by James Watson, Francis Crick, and Rosalind Franklin (Photo 51) in February 1953.",
        "significance": "Revealed the chemical secret of biological heredity: how genetic instructions are encoded, copied, and passed between all living organisms on Earth.",
        "description": "An illuminated, rotating macromolecular sculpture demonstrating the right-handed double helical spiral of deoxyribonucleic acid. Color-coded nitrogenous base pairs—Adenine, Thymine, Cytosine, and Guanine—glow with neon luminescence across the helical rung axis.",
        "funFacts": [
          "If you unwound and laid out the microscopic DNA in all cells of a single human body end-to-end, it would stretch twice the diameter of the Solar System!",
          "Rosalind Franklin's famous X-ray diffraction 'Photo 51' was the critical empirical proof showing the unmistakable cross-shaped diffraction pattern of a helix.",
          "The genetic code consists of just four letters (A, T, C, G), yet writes the intricate blueprint of every bacterium, redwood tree, and human being."
        ],
        "modelType": "dna_helix",
        "modelPath": "assets/models/dna_helix.glb",
        "featured": true,
        "year": 1953
      },
      {
        "id": "art-15",
        "name": "Galileo Galilei's Refractor Telescope",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": 12, "y": 1.5, "z": -10 },
        "historicalPeriod": "1609 CE",
        "origin": "Padua / Republic of Venice (Italy)",
        "material": "Hand-Turned Wood, Embossed Leather, Hand-Ground Glass Convex Lenses",
        "dimensions": "98 cm tube length × 5 cm aperture on 1.4 m walnut tripod",
        "discoveryInfo": "Engineered by Galileo Galilei in autumn 1609 to observe the heavens at 20× magnification.",
        "significance": "Shattered the geocentric Ptolemaic cosmos by revealing lunar craters, sunspots, the phases of Venus, and the four Galilean moons orbiting Jupiter.",
        "description": "An authentic recreation of the leather-wrapped timber spyglass that sparked the Scientific Revolution. Mounted upon an ornate brass-fitted tripod, Galileo's optical tube peered past dogmatic ancient astronomy into empirical physics.",
        "funFacts": [
          "When Galileo discovered Io, Europa, Ganymede, and Callisto orbiting Jupiter, he named them the 'Medicean Stars' to honor his patron Cosimo II de' Medici.",
          "His direct telescope observations of the Sun's rotating dark spots permanently damaged his retinas, contributing to his total blindness in old age.",
          "The original objective lens from this telescope cracked in 1634 and is framed as a sacred relic inside the Museo Galileo in Florence."
        ],
        "modelType": "galileo_telescope",
        "modelPath": "assets/models/galileo_telescope.glb",
        "featured": true,
        "year": 1609
      },
      {
        "id": "art-16",
        "name": "Quantum Superconducting Qubit Core",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": -12, "y": 1.7, "z": -10 },
        "historicalPeriod": "21st Century – Frontier Era",
        "origin": "Cryogenic Physics Laboratory",
        "material": "Gilded Copper Thermal Plates, Superconducting Niobium-Titanium Coaxial Lines",
        "dimensions": "1.2 m chandelier height × 0.6 m diameter",
        "discoveryInfo": "Developed for quantum supremacy calculations operating at 15 millikelvin (-273.135°C), colder than outer space.",
        "significance": "Harnesses quantum superposition and entanglement to execute computational calculations in minutes that would take classical supercomputers millennia.",
        "description": "A magnificent tiered dilution refrigerator 'golden chandelier' consisting of gold-plated thermal isolation stages that cascade down in temperature to house superconducting Josephson junction qubits at near absolute zero.",
        "funFacts": [
          "The base stage of the chandelier is cooled to 15 millikelvin—over 180 times colder than the deep vacuum of interstellar space!",
          "Unlike classical bits which are strictly 0 or 1, quantum qubits exist in a continuous mathematical superposition of both states simultaneously.",
          "The gold plating prevents surface oxidation while maximizing thermal conductivity across cryogenic vacuum seals."
        ],
        "modelType": "quantum_core",
        "modelPath": "assets/models/quantum_core.glb",
        "featured": false,
        "year": 2024
      },
      {
        "id": "art-17",
        "name": "Nikola Tesla's Magnifying Transmitter Coil",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": 12, "y": 1.6, "z": 12 },
        "historicalPeriod": "1899–1901 CE",
        "origin": "Colorado Springs & Wardenclyffe, Long Island, USA",
        "material": "Copper Primary Induction Ribbon, Secondary Resonant Coil, Toroidal Electrode",
        "dimensions": "2.2 m total height × 1.5 m toroid diameter",
        "discoveryInfo": "Invented by Serbian-American visionary electrical engineer Nikola Tesla to demonstrate wireless electric power transmission.",
        "significance": "Pioneered resonant transformer technology, radio broadcast theory, and high-frequency alternating current electrical grids.",
        "description": "A formidable resonant transformer crowned by a giant toroidal copper discharge electrode that emits crackling blue electric arcs into the surrounding air, demonstrating resonant electrical harmonic tuning.",
        "funFacts": [
          "In his Colorado Springs experiments, Tesla produced artificial lightning discharges over 41 meters (135 feet) long that boomed for 15 miles around.",
          "Tesla proved wireless lighting by walking barefoot into a meadow 1.6 kilometers away holding disconnected fluorescent gas tubes that glowed brightly.",
          "The Wardenclyffe Tower was intended to transmit transatlantic voice, news, stock tickers, and electrical power without wires across the globe."
        ],
        "modelType": "tesla_coil",
        "modelPath": "assets/models/tesla_coil.glb",
        "featured": false,
        "year": 1901
      },
      {
        "id": "art-18",
        "name": "Excalibur – Sovereign Ceremonial Longsword",
        "category": "Historical Artifacts",
        "collectionId": "col-history",
        "roomId": "room-heritage",
        "position": { "x": 0, "y": 1.6, "z": 0 },
        "historicalPeriod": "c. 12th Century CE (Medieval High Chivalry)",
        "origin": "Glastonbury / Avalon, British Isles",
        "material": "Pattern-Welded Damascus Steel, Gold Wire Inlay, Ruby Pommel",
        "dimensions": "Blade Length: 96 cm | Total Length: 124 cm | Weight: 1.45 kg",
        "discoveryInfo": "Legendary sword of Arthurian lore, forged with ancient metallurgy and preserved in ceremonial regalia.",
        "significance": "The paramount symbol of sovereign justice, chivalric honour, and righteous kingship in medieval Western literature.",
        "description": "A legendary two-handed cruciform arming sword with a Damascus folded blade rippling with fluid steel patterns. The golden crossguard is chased with Latin inscriptions, and the pommel holds a radiant cabochon ruby.",
        "funFacts": [
          "In early Celtic romances, the sword was known as Caledfwlch ('hard cleft') before Geoffrey of Monmouth Latinized it to Caliburnus.",
          "Medieval metallurgical analyses show true Damascus blades contained microscopic carbon nanotubes formed during wootz crucible melting.",
          "The scabbard was deemed more precious than the blade itself in Arthurian mythology, granting its bearer invulnerability from bleeding."
        ],
        "modelType": "medieval_sword",
        "modelPath": "assets/models/medieval_sword.glb",
        "featured": true,
        "year": 1150
      },
      {
        "id": "art-19",
        "name": "Roman Centurion Galea Helmet",
        "category": "Historical Artifacts",
        "collectionId": "col-history",
        "roomId": "room-heritage",
        "position": { "x": 12, "y": 1.5, "z": -10 },
        "historicalPeriod": "c. 1st Century CE (Flavian Dynasty)",
        "origin": "Legio X Fretensis, Roman Empire",
        "material": "Hammered Sheet Bronze, Iron Brow Reinforcement, Dyed Red Horsehair Crest",
        "dimensions": "32 cm height × 24 cm width × 34 cm depth (Weight: 2.1 kg)",
        "discoveryInfo": "Excavated from legionary barracks ruins along the Roman frontier Limes Germanicus.",
        "significance": "The defining protective helmet of Roman centurions, whose transverse crests allowed legionary cohorts to identify their commander in the dust of battle.",
        "description": "An Imperial Gallic type galea featuring broad neck guard flanges, embossed brass eyebrow ridges, hinged cheek pieces (bucculae), and a crimson transverse horsehair crista standing proudly across the crown.",
        "funFacts": [
          "A Centurion wore his crest transversely (side-to-side) so his soldiers could spot him through smoke and clash from behind.",
          "The embossed eyebrow ridges on the skull cap were not merely decorative; they reinforced the metal against downward barbarian sword blows.",
          "The cut-out ear protectors were left open without plate coverage to ensure the centurion could clearly hear trumpet cornu battlefield signals."
        ],
        "modelType": "roman_helmet",
        "modelPath": "assets/models/roman_helmet.glb",
        "featured": true,
        "year": 70
      },
      {
        "id": "art-20",
        "name": "The Antikythera Mechanism",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": -12, "y": 1.5, "z": 12 },
        "historicalPeriod": "c. 150–100 BCE (Hellenistic Greece)",
        "origin": "Rhodes or Corinth, Ancient Greece",
        "material": "Cast Bronze Plates, 37 Precision Gear Trains, Inscribed Wooden Casing",
        "dimensions": "34 cm × 18 cm × 9 cm",
        "discoveryInfo": "Recovered in 1901 by Greek sponge divers from a Roman shipwreck off the coast of Antikythera Island.",
        "significance": "The world's earliest known analog mechanical computer, calculating planetary orbits, solar/lunar eclipses, and Olympic Games cycles over a millennium before clockwork reappeared.",
        "description": "An intricate bronze geared device composed of dozens of interlocking differential gears with triangular teeth. Turning a hand crank drove pointers across dials to forecast moon phases, eclipse Saros cycles, and planetary stations.",
        "funFacts": [
          "The device incorporates an epicyclic (pin-and-slot) gear mechanism that accurately accounted for the variable speed of the Moon due to its elliptical orbit!",
          "It contained over 30 precision bronze gears; mechanical clockwork of comparable complexity was not reinvented until 14th-century Europe.",
          "Micro-focus X-ray tomography revealed over 3,000 Greek letters of instructional user manual text hidden inside the corroded fragments."
        ],
        "modelType": "antikythera",
        "modelPath": "assets/models/antikythera.glb",
        "featured": true,
        "year": -150
      },
      {
        "id": "art-21",
        "name": "Enigma M4 Naval Cipher Machine",
        "category": "Historical Artifacts",
        "collectionId": "col-history",
        "roomId": "room-heritage",
        "position": { "x": -12, "y": 1.5, "z": -10 },
        "historicalPeriod": "1942–1945 CE (World War II)",
        "origin": "Berlin, Germany (Used by Kriegsmarine U-boats)",
        "material": "Bakelite Steckerbrett Plugboard, Brass Rotors, Steel Chassis, Oak Case",
        "dimensions": "28 cm × 34 cm × 15 cm (Weight: 12 kg)",
        "discoveryInfo": "Captured from German submarine U-559 in October 1942 by the crew of HMS Petard.",
        "significance": "The electro-mechanical rotor cipher machine whose cryptographic cracking at Bletchley Park by Alan Turing helped shorten World War II by an estimated two years.",
        "description": "A naval 4-rotor cryptographic device featuring an QWERTZ alphabet lampboard, plugboard stecker cords, and four interchangeable rotatable alphabetic wheels that produced over 158 million million million possible encryption keys.",
        "funFacts": [
          "The total number of possible key configurations on an Enigma machine with plugboard connections was 158,962,555,217,826,360,000!",
          "Alan Turing and Gordon Welchman built the electromechanical 'Bombe' machines at Bletchley Park to search through thousands of rotor permutations per minute.",
          "Because an Enigma letter could never encrypt to itself, codebreakers could rule out entire words (cribs) when decrypting intercepts."
        ],
        "modelType": "enigma_machine",
        "modelPath": "assets/models/enigma_machine.glb",
        "featured": false,
        "year": 1942
      },
      {
        "id": "art-22",
        "name": "Tyrannosaurus Rex Fossil Skull",
        "category": "Historical Artifacts",
        "collectionId": "col-history",
        "roomId": "room-heritage",
        "position": { "x": 0, "y": 1.8, "z": 12 },
        "historicalPeriod": "Late Cretaceous (66 Million BCE)",
        "origin": "Hell Creek Formation, Montana / South Dakota, USA",
        "material": "Petrified Mineralized Bone, Apatite, Calcite Enamel",
        "dimensions": "1.52 m skull length × 1.2 m height (Weight: 270 kg fossilized)",
        "discoveryInfo": "Excavated from Late Cretaceous sedimentary sandstone deposits; representative of specimen FMNH PR2081 ('Sue').",
        "significance": "One of the most devastating predatory skull architectures in vertebrate evolutionary history, capable of bone-pulverizing bite forces exceeding 35,000 Newtons.",
        "description": "A massive, menacing fossilized cranial structure featuring robust fused nasal bones, large stereoscopic forward-facing eye orbits, wide jaw muscles attachments, and serrated 30-centimeter serrated teeth nicknamed 'lethal bananas'.",
        "funFacts": [
          "T-Rex possessed binocular stereoscopic vision superior to modern hawks, allowing it to accurately gauge depth and distance while hunting.",
          "The bite force was so immense that tooth marks have been found crushed straight through solid Triceratops pelvic and vertebrae bones.",
          "Its serrated teeth continuously fell out and were replaced throughout its entire lifespan, like modern sharks."
        ],
        "modelType": "dino_skull",
        "modelPath": "assets/models/dino_skull.glb",
        "featured": true,
        "year": -66000000
      },
      {
        "id": "art-23",
        "name": "Leonardo Da Vinci Aerial Screw (Ornithopter)",
        "category": "Science and Technology",
        "collectionId": "col-science",
        "roomId": "room-science",
        "position": { "x": 0, "y": 2.2, "z": -12 },
        "historicalPeriod": "c. 1488–1490 CE (Renaissance)",
        "origin": "Milan / Florence, Renaissance Italy",
        "material": "Oak Framework, Reed Supports, Starched Starch Linen, Iron Wire Gears",
        "dimensions": "Diameter: 4.8 m helix | 2.5 m central platform",
        "discoveryInfo": "Preserved in Leonardo da Vinci's Manuscript B (Folio 83v) in the Institut de France, Paris.",
        "significance": "The visionary conceptual ancestor of the modern helicopter rotor blade, conceived over four centuries prior to powered flight.",
        "description": "A spiraling conical helix constructed from starched linen mounted upon a circular wooden turntable platform, designed to compress atmospheric air like an Archimedean water screw to elevate a human pilot into the sky.",
        "funFacts": [
          "Leonardo noted: 'If this instrument made with a screw be well made of linen cloth starch-filled, and be turned swiftly, it will produce an upward screw in the air.'",
          "While human muscular power could never lift the 15th-century wood-and-linen weight, the aerodynamic helical principle was fundamentally sound.",
          "Modern aerospace engineers tested Leonardo's blade geometry in wind tunnels and verified it creates real aerodynamic lift when spun at high RPM."
        ],
        "modelType": "davinci_flyer",
        "modelPath": "assets/models/davinci_flyer.glb",
        "featured": true,
        "year": 1489
      },
      {
        "id": "art-24",
        "name": "Aztec Sun Stone (Piedra del Sol)",
        "category": "Mythology and Culture",
        "collectionId": "col-mythology",
        "roomId": "room-heritage",
        "position": { "x": -14, "y": 1.6, "z": 10 },
        "historicalPeriod": "c. 1502–1520 CE (Reign of Moctezuma II)",
        "origin": "Tenochtitlan (Modern Mexico City), Aztec Empire",
        "material": "Carved Olivine Basalt Monolith",
        "dimensions": "3.58 m diameter × 98 cm thickness (Weight: 24.5 metric tons)",
        "discoveryInfo": "Unearthed in December 1790 during repaving of Mexico City's main plaza (El Zócalo).",
        "significance": "A monumental cosmological basalt calendar depicting the myth of the Five Suns (creation eras), solar deities, and ritual cycles of the Mexica universe.",
        "description": "A colossal disc carved with concentric symbolic rings. At the center is the face of the solar deity Tonatiuh emerging from the earth holding human hearts. Surrounding glyphs record the destruction of the four previous mythological world ages.",
        "funFacts": [
          "After being rediscovered in 1790, it was mounted on the exterior wall of the Mexico City Metropolitan Cathedral until 1885.",
          "The outer ring is formed by two colossal Xiuhcoatl (fire serpents) that carry the Sun across the vault of heaven.",
          "Contrary to popular belief, it was not merely an astronomical calendar, but a sacrificial gladiatorial platform and cosmological proclamation."
        ],
        "modelType": "aztec_sunstone",
        "modelPath": "assets/models/aztec_sunstone.glb",
        "featured": false,
        "year": 1502
      },
      {
        "id": "art-25",
        "name": "Viking Oseberg Carved Runestone",
        "category": "Mythology and Culture",
        "collectionId": "col-mythology",
        "roomId": "room-heritage",
        "position": { "x": 14, "y": 1.5, "z": 10 },
        "historicalPeriod": "c. 834 CE (Viking Age)",
        "origin": "Vestfold, Norway (Oseberg burial mound)",
        "material": "Carved Scandinavian Granite, Red Mineral Pigment Infill",
        "dimensions": "2.1 m height × 1.1 m width × 0.4 m thickness",
        "discoveryInfo": "Excavated from the royal Oseberg ship burial mound in 1904 by Gabriel Gustafson.",
        "significance": "Exemplifies Norse mythological skaldic runic inscriptions and interlaced gripping-beast artwork honoring fallen seafarers and the god Odin.",
        "description": "An imposing granite slab deeply incised with Younger Futhark runes winding inside serpentine dragon ribbons. The central motif depicts Yggdrasil, the sacred World Tree that unites the nine realms of Norse mythology.",
        "funFacts": [
          "Runic letters were carved with angular straight lines specifically because curving strokes were almost impossible to chisel into hard Scandinavian granite.",
          "The inscriptions were originally painted with vivid pigments made from cinnabar, hematite red ochre, and animal tallow binder.",
          "Runestones served simultaneously as grave memorials, land boundary deeds, and monuments honoring perilous raids into Byzantium."
        ],
        "modelType": "viking_runestone",
        "modelPath": "assets/models/viking_runestone.glb",
        "featured": false,
        "year": 834
      },
      {
        "id": "art-26",
        "name": "Terracotta Army Vanguard General",
        "category": "World Heritage",
        "collectionId": "col-heritage",
        "roomId": "room-ancient",
        "position": { "x": 14, "y": 1.6, "z": 10 },
        "historicalPeriod": "c. 210 BCE (Qin Dynasty)",
        "origin": "Mausoleum of First Emperor Qin Shi Huang, Xi'an, Shaanxi, China",
        "material": "Kiln-Fired Terracotta Clay, Chinese Purple and Cinnabar Pigments",
        "dimensions": "1.96 m height (Weight: 200 kg)",
        "discoveryInfo": "Discovered in March 1974 by local farmers digging a water well near Mount Li in Xi'an.",
        "significance": "A high-ranking general from the imperial underground necropolis of 8,000 individualized life-sized soldiers created to protect China's first emperor in eternity.",
        "description": "An imposing general standing with hands resting on his ceremonial sword. He wears double-layered armored plate tunic, pheasant-feather headdress ribbons, and square-toed military boots. Every facial feature is distinct and life-like.",
        "funFacts": [
          "Out of over 8,000 unearthed warriors, fewer than ten have been identified as high generals, marked by their distinctive crossed ribbon chest armor.",
          "Every single terracotta soldier had unique facial bone structures, mustaches, and ear shapes modeled after actual living soldiers of the Qin army.",
          "When freshly excavated, the statues were brilliantly painted with vibrant lacquer colors, which curled and oxidized within minutes of exposure to dry air."
        ],
        "modelType": "terracotta_warrior",
        "modelPath": "assets/models/terracotta_warrior.glb",
        "featured": false,
        "year": -210
      },
      {
        "id": "art-27",
        "name": "Islamic Celestial Astrolabe",
        "category": "Ancient Architecture",
        "collectionId": "col-architecture",
        "roomId": "room-ancient",
        "position": { "x": -14, "y": 1.5, "z": -16 },
        "historicalPeriod": "c. 1200 CE (Islamic Golden Age)",
        "origin": "Isfahan / Baghdad, Abbasid Caliphate",
        "material": "Engraved Cast Brass, Silver Inlays, Steel Pin Axis",
        "dimensions": "22 cm diameter × 1.8 cm thickness (Weight: 1.8 kg)",
        "discoveryInfo": "Crafted by master astronomers and navigational instrument makers of the House of Wisdom.",
        "significance": "The mathematical Swiss Army knife of medieval astronomers, capable of telling local time, determining prayer directions to Mecca, and predicting star positions.",
        "description": "A polished brass mater holding multiple interchangeable tympan plates engraved with stereographic projections of the heavens for specific latitudes, topped by a delicate openwork rete pointer showing the brightest zodiac constellations.",
        "funFacts": [
          "The astrolabe enabled navigators to calculate their precise latitude at sea simply by sighting the elevation of Polaris above the horizon.",
          "The pierced rete was called 'the spider' because its curving flame pointers resemble delicate spider legs touching star coordinates.",
          "Islamic astronomers added specialized azimuth curves to indicate the exact Qibla direction towards the Kaaba in Mecca."
        ],
        "modelType": "astrolabe",
        "modelPath": "assets/models/astrolabe.glb",
        "featured": false,
        "year": 1200
      },
      {
        "id": "art-28",
        "name": "Parthenon Golden Ratio Metope",
        "category": "Ancient Architecture",
        "collectionId": "col-architecture",
        "roomId": "room-ancient",
        "position": { "x": 14, "y": 1.5, "z": -16 },
        "historicalPeriod": "c. 447–438 BCE (Golden Age of Pericles)",
        "origin": "Acropolis of Athens, Greece",
        "material": "Pentelic Marble with Traces of Egyptian Blue",
        "dimensions": "1.34 m height × 1.37 m width × 25 cm relief depth",
        "discoveryInfo": "Sculpted under the artistic direction of Phidias for the monumental Doric temple dedicated to Athena Parthenos.",
        "significance": "The quintessential embodiment of classical Greek High Classical architectural proportions, optical refinements, and golden ratio harmony.",
        "description": "A high-relief marble slab depicting the Centauromachy (the mythical struggle between Lapiths and Centaurs), symbolizing the philosophical triumph of reason, civic democracy, and order over barbarism and chaos.",
        "funFacts": [
          "The Parthenon has no straight lines; every column swells gently (entasis) and leans inward by 6 cm to counteract optical illusions of sagging.",
          "The marble blocks were quarried 16 kilometers away on Mount Pentelicus and transported with counterweighted wooden sledges.",
          "The relief was originally painted in vibrant primary colors with gold gilding that dazzled against the blue Aegean sky."
        ],
        "modelType": "parthenon_metope",
        "modelPath": "assets/models/parthenon_metope.glb",
        "featured": false,
        "year": -438
      },
      {
        "id": "art-29",
        "name": "Samurai Armor & Masamune Katana",
        "category": "World Heritage",
        "collectionId": "col-heritage",
        "roomId": "room-heritage",
        "position": { "x": -14, "y": 1.6, "z": -16 },
        "historicalPeriod": "c. 1600 CE (Edo Period)",
        "origin": "Kyoto / Kamakura, Feudal Japan",
        "material": "Tamahagane Carbon Steel, Lacquered Iron Scales, Silk Cordage, Gold Leaf",
        "dimensions": "Katana: 72 cm blade | Armor Suit: 175 cm height on wooden stand",
        "discoveryInfo": "Maintained by a samurai clan daimyo lineage as an unbroken family heirloom.",
        "significance": "The pinnacle of Japanese arms and armor craftsmanship, uniting protective flexibility, philosophical Zen focus, and unmatched cutting sharpness.",
        "description": "A complete Gusoku suit of samurai armor with a horned Kabuto helmet and fierce Menpo face mask, accompanied by a genuine Tamahagane folded Katana with hamon temper wave line and ray-skin wrapped hilt.",
        "funFacts": [
          "Tamahagane steel was folded and hammered up to 16 times, producing over 32,000 microscopic layers of alternating high and low carbon steel.",
          "The clay-tempering process cooled the spine slowly while flash-quenching the cutting edge, creating the distinctive hamon wave line.",
          "The terrifying facial mask (menpo) was deliberately designed to frighten adversaries and anchor the helmet securely during cavalry charges."
        ],
        "modelType": "samurai_armor",
        "modelPath": "assets/models/samurai_armor.glb",
        "featured": false,
        "year": 1600
      },
      {
        "id": "art-30",
        "name": "Dead Sea Scrolls Storage Jar",
        "category": "World Heritage",
        "collectionId": "col-heritage",
        "roomId": "room-heritage",
        "position": { "x": 14, "y": 1.4, "z": -16 },
        "historicalPeriod": "c. 3rd Century BCE – 1st Century CE",
        "origin": "Qumran Caves, Judean Desert, West Bank",
        "material": "Coarse Wheel-Thrown Terracotta Ceramic, Fitted Dome Lid",
        "dimensions": "65 cm height × 28 cm diameter",
        "discoveryInfo": "Discovered in 1947 by a Bedouin shepherd boy who threw a stone into a limestone cliff cave and heard pottery shatter.",
        "significance": "Preserved the oldest surviving manuscripts of the Hebrew Bible and biblical commentaries, shielded from decay for over two thousand years.",
        "description": "A tall cylindrical terracotta jar sealed with a hemispherical ceramic bowl lid. Inside these arid desert jars lay wrapped in linen scrolls written in ancient Hebrew, Aramaic, and Greek on parchment and papyrus.",
        "funFacts": [
          "The arid microclimate of the Dead Sea caves, along with the tight ceramic seals, preserved organic parchment for over 2,100 years.",
          "Among the hundreds of scrolls found in eleven caves was the Great Isaiah Scroll, virtually identical to modern biblical texts.",
          "One unique scroll, the Copper Scroll, was incised directly onto sheets of pure beaten copper and lists 64 hidden treasure caches."
        ],
        "modelType": "dead_sea_jar",
        "modelPath": "assets/models/dead_sea_jar.glb",
        "featured": false,
        "year": -100
      },
      {
        "id": "art-31",
        "name": "Sputnik 1 First Artificial Satellite",
        "category": "Space and Astronomy",
        "collectionId": "col-space",
        "roomId": "room-space",
        "position": { "x": 0, "y": 2.2, "z": 16 },
        "historicalPeriod": "October 4, 1957 CE",
        "origin": "Baikonur Cosmodrome, USSR",
        "material": "Polished Aluminum-Titanium Sphere, Radio Transmitters, Four Whip Antennas",
        "dimensions": "58 cm sphere diameter | Antennas: 2.4 m to 2.9 m length (Weight: 83.6 kg)",
        "discoveryInfo": "Launched atop an R-7 Semyorka rocket into low Earth orbit, igniting the Space Race.",
        "significance": "The very first human-made object to orbit planet Earth, initiating the modern space exploration age and satellite telecommunications.",
        "description": "A gleaming, mirror-polished aluminum sphere equipped with four trailing whip antennas. It broadcast regular 'beep... beep...' radio pulses at 20.005 and 40.002 MHz that were monitored by radio operators worldwide.",
        "funFacts": [
          "The exterior shell was hand-polished to an optical mirror finish so it could reflect sunlight and remain visible to optical observers through telescopes on Earth.",
          "Its radio transmitters broadcast for 21 days until their chemical silver-zinc batteries were exhausted.",
          "Sputnik completed 1,440 orbits around planet Earth, traveling 70 million kilometers before burning up in the atmosphere on January 4, 1958."
        ],
        "modelType": "sputnik_satellite",
        "modelPath": "assets/models/sputnik_satellite.glb",
        "featured": false,
        "year": 1957
      },
      {
        "id": "art-32",
        "name": "Venus of Willendorf Neolithic Figurine",
        "category": "World Heritage",
        "collectionId": "col-heritage",
        "roomId": "room-heritage",
        "position": { "x": 0, "y": 1.4, "z": -16 },
        "historicalPeriod": "c. 25,000–30,000 BCE (Upper Paleolithic)",
        "origin": "Willendorf in der Wachau, Lower Austria",
        "material": "Oolitic Limestone with Red Ochre Pigment",
        "dimensions": "11.1 cm height × 5.7 cm width × 4.5 cm depth (Weight: 140 grams)",
        "discoveryInfo": "Discovered in August 1908 by archaeologist Josef Szombathy during railway excavations.",
        "significance": "One of humanity's earliest expressions of sculptural art, symbolizing Paleolithic fertility, feminine survival, and early spiritual totems.",
        "description": "A compact handheld figurine carved from limestone non-local to the Danube valley. It portrays a stylized woman with exaggerated fertility attributes, braided hairstyle or woven basket headdress, and remnants of sacred red ochre pigment.",
        "funFacts": [
          "The oolitic limestone from which the figurine is carved came from Lake Garda in northern Italy, over 730 kilometers away across the Alps!",
          "The figure has no facial features whatsoever, indicating it was intended as a universal archetype of fertility rather than a specific individual.",
          "Paleolithic hunter-gatherers likely carried this portable sacred amulet across ice age Europe wrapped in soft leather pouches."
        ],
        "modelType": "venus_figurine",
        "modelPath": "assets/models/venus_figurine.glb",
        "featured": false,
        "year": -25000
      }
    ];
  }

  static getFallbackQuizQuestions() {
    return [
      {
        "id": "q-01",
        "category": "Ancient Civilizations",
        "question": "Which script on the Rosetta Stone was the key that unlocked the translation of Egyptian hieroglyphs?",
        "options": ["Latin", "Ancient Greek", "Aramaic", "Cuneiform"],
        "answer": 1,
        "explanation": "Because Ancient Greek was already understood by 19th-century scholars, Jean-François Champollion and Thomas Young compared Greek names like Ptolemy with hieroglyphic cartouches to crack the code.",
        "difficulty": "Easy"
      },
      {
        "id": "q-02",
        "category": "Ancient Civilizations",
        "question": "What sacred protective creatures appear on the brow of Tutankhamun's gold burial mask?",
        "options": ["Lion and Falcon", "Vulture and Cobra", "Scorpion and Jackal", "Bull and Ibis"],
        "answer": 1,
        "explanation": "The vulture goddess Nekhbet (Upper Egypt) and the cobra goddess Wadjet (Lower Egypt) guarded the Pharaoh's forehead, symbolizing a unified Egypt.",
        "difficulty": "Medium"
      },
      {
        "id": "q-03",
        "category": "Space and Astronomy",
        "question": "Why are the primary hexagonal mirrors of the James Webb Space Telescope coated in gold?",
        "options": ["To resist solar radiation damage", "To optimize reflection of infrared wavelengths", "To prevent physical scratches from space dust", "Purely for ceremonial prestige"],
        "answer": 1,
        "explanation": "Gold has an extraordinarily high reflectivity (over 98%) in the infrared spectrum, which is essential because JWST observes distant redshifted light from cosmic dawn.",
        "difficulty": "Medium"
      },
      {
        "id": "q-04",
        "category": "Space and Astronomy",
        "question": "What unique feature characterizes the material density of the ringed planet Saturn?",
        "options": ["It is denser than lead", "It is less dense than water", "It is composed entirely of solid diamond", "Its core is colder than absolute zero"],
        "answer": 1,
        "explanation": "Saturn has an average density of roughly 0.687 g/cm³, meaning that if there were a cosmic bathtub large enough, Saturn would float in water!",
        "difficulty": "Easy"
      },
      {
        "id": "q-05",
        "category": "Science and Technology",
        "question": "What ancient device discovered off a Greek island is recognized as the world's first analog computer?",
        "options": ["The Alexandria Chronometer", "The Archimedes Sphere", "The Antikythera Mechanism", "The Rhodes Astrolabe"],
        "answer": 2,
        "explanation": "Dating back to c. 150–100 BCE, the Antikythera Mechanism contained over 30 intricate bronze differential gears used to calculate celestial cycles and eclipses.",
        "difficulty": "Easy"
      },
      {
        "id": "q-06",
        "category": "Science and Technology",
        "question": "In 1953, which famous photograph captured by Rosalind Franklin provided crucial evidence for DNA's double helix structure?",
        "options": ["Photo 12", "Photo 42", "Photo 51", "Photo 99"],
        "answer": 2,
        "explanation": "Rosalind Franklin and Raymond Gosling captured 'Photo 51' using X-ray crystallography, clearly demonstrating the distinctive cross pattern characteristic of a helical polymer.",
        "difficulty": "Medium"
      },
      {
        "id": "q-07",
        "category": "Digital Art Gallery",
        "question": "How many cubic bounding cells compose a 4-dimensional tesseract hypercube?",
        "options": ["4", "6", "8", "16"],
        "answer": 2,
        "explanation": "Just as a 3D cube is bounded by 6 square 2D faces, a 4D hypercube (tesseract) is bounded by 8 cubic 3D cells and has 16 vertices.",
        "difficulty": "Hard"
      },
      {
        "id": "q-08",
        "category": "Historical Artifacts",
        "question": "How did Roman legionaries identify their Centurion in the dust and chaos of battle?",
        "options": ["A transverse side-to-side helmet crest", "A solid gold breastplate", "A glowing purple cloak", "Two swords instead of one"],
        "answer": 0,
        "explanation": "Unlike standard legionaries whose helmet crests ran from front to back, Centurions wore a transverse crest (crista transversa) running from ear to ear so their men could spot them from behind.",
        "difficulty": "Medium"
      },
      {
        "id": "q-09",
        "category": "Historical Artifacts",
        "question": "Who led the British cryptography team at Bletchley Park that broke the naval Enigma cipher?",
        "options": ["Charles Babbage", "Alan Turing", "Ada Lovelace", "John von Neumann"],
        "answer": 1,
        "explanation": "Alan Turing designed the electromechanical 'Bombe' decryption machines at Bletchley Park, cracking Enigma communications and shortening the war by years.",
        "difficulty": "Easy"
      },
      {
        "id": "q-10",
        "category": "Mythology and Culture",
        "question": "In the center of the Aztec Sun Stone (Piedra del Sol), which deity's face is depicted holding human hearts?",
        "options": ["Quetzalcoatl", "Tonatiuh", "Huitzilopochtli", "Tlaloc"],
        "answer": 1,
        "explanation": "The central face is Tonatiuh, the solar deity of the Fifth Sun era, portrayed emerging with claws clutching hearts, demanding sustenance to keep the cosmos alive.",
        "difficulty": "Hard"
      },
      {
        "id": "q-11",
        "category": "Ancient Architecture",
        "question": "What is the architectural term for the subtle convex curvature built into Greek columns to prevent them looking concave?",
        "options": ["Volute", "Entasis", "Frieze", "Pediment"],
        "answer": 1,
        "explanation": "Entasis is the intentional slight swelling along the shaft of Classical columns. To the human eye, perfectly straight tall columns appear to pinch inwards, so Greeks bowed them outward.",
        "difficulty": "Hard"
      },
      {
        "id": "q-12",
        "category": "Space and Astronomy",
        "question": "What object carried aboard the Voyager 1 and 2 probes contains sounds, images, and music from Earth?",
        "options": ["The Platinum Crystal", "The Silicon Microchip", "The Golden Record", "The Sapphire Cylinder"],
        "answer": 2,
        "explanation": "The Voyager Golden Record is a gold-plated copper phonograph disc curated by Carl Sagan, intended as a cosmic greeting to any intelligent extraterrestrial civilization.",
        "difficulty": "Easy"
      },
      {
        "id": "q-13",
        "category": "World Heritage",
        "question": "Why did Qin Shi Huang, the First Emperor of China, commission the massive Terracotta Army?",
        "options": ["To celebrate a naval victory", "To train real recruits in military tactics", "To protect him in the afterlife", "To decorate his imperial summer palace"],
        "answer": 2,
        "explanation": "Emperor Qin Shi Huang believed he would continue reigning in the afterlife, so over 8,000 unique terracotta warriors, chariots, and horses were buried to guard his tomb.",
        "difficulty": "Easy"
      },
      {
        "id": "q-14",
        "category": "Science and Technology",
        "question": "What celestial discovery by Galileo in 1610 dealt a devastating blow to the Earth-centered Ptolemaic model?",
        "options": ["The rings of Uranus", "Four moons orbiting Jupiter", "The spiral arms of Andromeda", "The Oort cloud"],
        "answer": 1,
        "explanation": "Observing four moons (Io, Europa, Ganymede, Callisto) orbiting Jupiter directly proved that not all celestial bodies revolve around the Earth.",
        "difficulty": "Medium"
      },
      {
        "id": "q-15",
        "category": "Historical Artifacts",
        "question": "What distinctive structural feature allowed the Damascus steel blades of medieval swords to be remarkably flexible yet razor sharp?",
        "options": ["High titanium alloys", "Crucible wootz steel folded with carbon nanotubes", "Cold mercury immersion", "Electroplating with nickel"],
        "answer": 1,
        "explanation": "Ancient Damascus blades were forged from Indian wootz crucible steel, producing alternating hard cementite bands and ductile iron layers with microscopic carbon nanotube structures.",
        "difficulty": "Hard"
      },
      {
        "id": "q-16",
        "category": "Space and Astronomy",
        "question": "Which historic spacecraft was the first human-made satellite to orbit Earth in October 1957?",
        "options": ["Explorer 1", "Sputnik 1", "Vostok 1", "Vanguard 1"],
        "answer": 1,
        "explanation": "The Soviet Union launched Sputnik 1 on October 4, 1957. The 58-cm polished aluminum sphere circled Earth broadcasting radio beeps, launching the Space Age.",
        "difficulty": "Easy"
      },
      {
        "id": "q-17",
        "category": "Ancient Architecture",
        "question": "What sacred primordial stone did the gilded pyramidion capstones of Egyptian pyramids represent?",
        "options": ["The Benben Stone", "The Kaaba Stone", "The Omphalos", "The Lapis Pillar"],
        "answer": 0,
        "explanation": "In Heliopolitan creation theology, the Benben was the primordial mound that first emerged from the chaotic waters of Nun, on which the sun god Ra created life.",
        "difficulty": "Hard"
      },
      {
        "id": "q-18",
        "category": "Science and Technology",
        "question": "What temperature must superconducting quantum processors typically be cooled to in order to preserve quantum coherence?",
        "options": ["Around 0°C (Freezing point of water)", "Around -78°C (Dry ice)", "Around 15 millikelvin (near Absolute Zero)", "Room temperature"],
        "answer": 2,
        "explanation": "Superconducting qubits require temperatures around 10 to 15 millikelvin (-273.14°C) to prevent thermal noise from collapsing the delicate superposition quantum states.",
        "difficulty": "Medium"
      },
      {
        "id": "q-19",
        "category": "Mythology and Culture",
        "question": "What was the primary writing system used on Scandinavian Viking runestones like the Oseberg stone?",
        "options": ["Cyrillic", "Elder Futhark / Younger Futhark", "Ogham Script", "Gothic Alphabet"],
        "answer": 1,
        "explanation": "Viking Age runestones were inscribed in the Younger Futhark runic alphabet, using straight chiseled strokes suitable for hard Scandinavian granite.",
        "difficulty": "Medium"
      },
      {
        "id": "q-20",
        "category": "World Heritage",
        "question": "Where were the ancient Dead Sea Scrolls accidentally rediscovered in 1947?",
        "options": ["In a sunken Roman galley off Alexandria", "In sealed ceramic jars in limestone caves at Qumran", "Under the floorboards of St. Catherine's Monastery", "Buried in the catacombs of Rome"],
        "answer": 1,
        "explanation": "A young Bedouin shepherd threw a pebble into an opening on the limestone cliffs of Qumran near the Dead Sea and heard pottery break, discovering manuscripts preserved for 2,000 years.",
        "difficulty": "Easy"
      },
      {
        "id": "q-21",
        "category": "Science and Technology",
        "question": "Leonardo da Vinci's design for an 'aerial screw' in the 1480s is widely considered the conceptual forerunner to which modern machine?",
        "options": ["Jet airliner", "Helicopter", "Submarine", "Hovercraft"],
        "answer": 1,
        "explanation": "Leonardo's aerial screw featured a rotating starched linen helix designed to compress air upwards as it spun, embodying the fundamental rotor physics of the modern helicopter.",
        "difficulty": "Easy"
      },
      {
        "id": "q-22",
        "category": "World Heritage",
        "question": "Approximately how old is the Paleolithic limestone carving known as the Venus of Willendorf?",
        "options": ["c. 2,000 years old", "c. 5,000 years old", "c. 10,000 years old", "c. 25,000 to 30,000 years old"],
        "answer": 3,
        "explanation": "Dating to between 25,000 and 30,000 BCE, the Venus of Willendorf is one of humanity's earliest surviving works of figurative sculpture, celebrating survival and fertility.",
        "difficulty": "Medium"
      }
    ];
  }

  /* ----------------- ARTIFACTS CRUD ----------------- */
  static getArtifacts() {
    const raw = localStorage.getItem(STORAGE_KEYS.ARTIFACTS);
    return raw ? JSON.parse(raw) : this.getFallbackArtifacts();
  }

  static getArtifactById(id) {
    const artifacts = this.getArtifacts();
    return artifacts.find(a => a.id === id) || null;
  }

  static saveArtifact(artifact) {
    const artifacts = this.getArtifacts();
    const idx = artifacts.findIndex(a => a.id === artifact.id);
    if (idx >= 0) {
      artifacts[idx] = { ...artifacts[idx], ...artifact };
    } else {
      artifacts.unshift(artifact);
    }
    localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artifacts));
    return artifact;
  }

  static deleteArtifact(id) {
    let artifacts = this.getArtifacts();
    artifacts = artifacts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artifacts));
    return true;
  }

  /* ----------------- COLLECTIONS CRUD ----------------- */
  static getCollections() {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return raw ? JSON.parse(raw) : this.getFallbackCollections();
  }

  static getCollectionById(id) {
    const collections = this.getCollections();
    return collections.find(c => c.id === id) || null;
  }

  static saveCollection(collection) {
    const collections = this.getCollections();
    const idx = collections.findIndex(c => c.id === collection.id);
    if (idx >= 0) {
      collections[idx] = { ...collections[idx], ...collection };
    } else {
      collections.push(collection);
    }
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    return collection;
  }

  static deleteCollection(id) {
    let collections = this.getCollections();
    collections = collections.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    return true;
  }

  /* ----------------- ROOMS ----------------- */
  static getRooms() {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return raw ? JSON.parse(raw) : this.getFallbackRooms();
  }

  static getRoomById(id) {
    const rooms = this.getRooms();
    return rooms.find(r => r.id === id) || null;
  }

  /* ----------------- QUIZ QUESTIONS CRUD ----------------- */
  static getQuizQuestions() {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ);
    return raw ? JSON.parse(raw) : this.getFallbackQuizQuestions();
  }

  static saveQuizQuestion(q) {
    const questions = this.getQuizQuestions();
    const idx = questions.findIndex(item => item.id === q.id);
    if (idx >= 0) {
      questions[idx] = { ...questions[idx], ...q };
    } else {
      questions.push(q);
    }
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(questions));
    return q;
  }

  static deleteQuizQuestion(id) {
    let questions = this.getQuizQuestions();
    questions = questions.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(questions));
    return true;
  }

  /* ----------------- AUTH & SESSIONS ----------------- */
  static getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  static setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getUsers() {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEFAULT_USERS;
  }

  static saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  static logout() {
    const guestUser = {
      id: 'usr_guest',
      name: 'Cosmic Guest Explorer',
      email: 'guest@virtualverse.io',
      role: 'guest',
      avatar: 'assets/images/avatar-guest.png',
      title: 'Visitor of the Cosmic Archive',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
  }

  /* ----------------- FAVORITES ----------------- */
  static getFavorites(userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    const store = raw ? JSON.parse(raw) : {};
    return store[uid] || [];
  }

  static toggleFavorite(artifactId, userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[uid]) store[uid] = [];

    const idx = store[uid].indexOf(artifactId);
    let added = false;
    if (idx >= 0) {
      store[uid].splice(idx, 1);
    } else {
      store[uid].push(artifactId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(store));

    if (store[uid].length >= 5) {
      this.unlockAchievement('collector', uid);
    }

    return { added, count: store[uid].length };
  }

  static isFavorite(artifactId, userId = null) {
    const list = this.getFavorites(userId);
    return list.includes(artifactId);
  }

  /* ----------------- USER EXPLORATION & ACHIEVEMENTS ----------------- */
  static getExplorationData(userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const raw = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[uid]) {
      store[uid] = {
        viewedArtifacts: [],
        visitedRooms: [],
        tourCompleted: false,
        quizScores: [],
        activityLog: []
      };
      localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(store));
    }
    return store[uid];
  }

  static recordArtifactView(artifactId, userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const data = this.getExplorationData(uid);
    if (!data.viewedArtifacts.includes(artifactId)) {
      data.viewedArtifacts.push(artifactId);
      data.activityLog.unshift({
        type: 'artifact_view',
        targetId: artifactId,
        timestamp: new Date().toISOString()
      });
      if (data.activityLog.length > 50) data.activityLog.pop();

      const raw = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
      const store = raw ? JSON.parse(raw) : {};
      store[uid] = data;
      localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(store));

      this.unlockAchievement('first_step', uid);
      if (data.viewedArtifacts.length >= 5) this.unlockAchievement('keen_observer', uid);
      if (data.viewedArtifacts.length >= 20) this.unlockAchievement('grand_archivist', uid);
    }
  }

  static recordRoomVisit(roomId, userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const data = this.getExplorationData(uid);
    if (!data.visitedRooms.includes(roomId)) {
      data.visitedRooms.push(roomId);
      data.activityLog.unshift({
        type: 'room_visit',
        targetId: roomId,
        timestamp: new Date().toISOString()
      });

      const raw = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
      const store = raw ? JSON.parse(raw) : {};
      store[uid] = data;
      localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(store));

      if (roomId === 'room-space') this.unlockAchievement('space_voyager', uid);
      if (roomId === 'room-ancient') this.unlockAchievement('pharaohs_scholar', uid);
      if (data.visitedRooms.length >= 5) this.unlockAchievement('dimensional_traveler', uid);
    }
  }

  static recordTourCompleted(userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const data = this.getExplorationData(uid);
    data.tourCompleted = true;
    data.activityLog.unshift({
      type: 'tour_completed',
      timestamp: new Date().toISOString()
    });

    const raw = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
    const store = raw ? JSON.parse(raw) : {};
    store[uid] = data;
    localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(store));

    this.unlockAchievement('guided_voyager', uid);
  }

  static recordQuizAttempt(quizResult, userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const data = this.getExplorationData(uid);
    data.quizScores.unshift({
      ...quizResult,
      date: new Date().toISOString()
    });

    data.activityLog.unshift({
      type: 'quiz_attempt',
      score: quizResult.score,
      total: quizResult.total,
      percentage: quizResult.percentage,
      timestamp: new Date().toISOString()
    });

    const raw = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
    const store = raw ? JSON.parse(raw) : {};
    store[uid] = data;
    localStorage.setItem(STORAGE_KEYS.EXPLORATION, JSON.stringify(store));

    this.unlockAchievement('knowledge_seeker', uid);
    if (quizResult.percentage === 100) {
      this.unlockAchievement('omniscient_mind', uid);
    }
  }

  static getAchievements(userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    const store = raw ? JSON.parse(raw) : {};
    const unlocked = store[uid] || {};

    return DEFAULT_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: !!unlocked[ach.id],
      unlockedAt: unlocked[ach.id] || null
    }));
  }

  static unlockAchievement(achId, userId = null) {
    const uid = userId || this.getCurrentUser()?.id || 'usr_guest';
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[uid]) store[uid] = {};

    if (!store[uid][achId]) {
      store[uid][achId] = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(store));

      const ach = DEFAULT_ACHIEVEMENTS.find(a => a.id === achId);
      if (ach && window.VirtualVerseApp?.showToast) {
        window.VirtualVerseApp.showToast(`Achievement Unlocked: ${ach.title}!`, 'achievement');
      }
      return true;
    }
    return false;
  }

  /* ----------------- ADMIN & GLOBAL STATS ----------------- */
  static getSystemStats() {
    const artifacts = this.getArtifacts();
    const collections = this.getCollections();
    const rooms = this.getRooms();
    const users = this.getUsers();
    const questions = this.getQuizQuestions();

    const rawExp = localStorage.getItem(STORAGE_KEYS.EXPLORATION);
    const expStore = rawExp ? JSON.parse(rawExp) : {};
    let totalQuizAttempts = 0;
    let totalArtifactViews = 0;
    let totalRoomVisits = 0;

    Object.values(expStore).forEach(userData => {
      totalQuizAttempts += (userData.quizScores?.length || 0);
      totalArtifactViews += (userData.viewedArtifacts?.length || 0);
      totalRoomVisits += (userData.visitedRooms?.length || 0);
    });

    return {
      totalArtifacts: artifacts.length,
      totalCollections: collections.length,
      totalRooms: rooms.length,
      totalUsers: users.length,
      totalQuestions: questions.length,
      totalQuizAttempts: Math.max(totalQuizAttempts, 14),
      totalArtifactViews: Math.max(totalArtifactViews, 86),
      totalRoomVisits: Math.max(totalRoomVisits, 42)
    };
  }

  static resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.ARTIFACTS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.EXPLORATION);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    return this.init();
  }
}

// Auto-initialize when script loads
StorageManager.init();

// Export globally for browser scripts
window.StorageManager = StorageManager;