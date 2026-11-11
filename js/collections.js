/**
 * VirtualVerse – Cosmic Archive
 * js/collections.js
 * Exhibition Collections Gallery with 3D Holographic Previews and Filtering
 */

class CollectionsApp {
  constructor() {
    this.collections = [];
    this.artifacts = [];
    this.activeFilter = 'all';

    this.init();
  }

  init() {
    this.collections = window.StorageManager.getCollections();
    this.artifacts = window.StorageManager.getArtifacts();

    this.renderCollectionsGrid();
    this.bindSearchAndFilters();
  }

  renderCollectionsGrid() {
    const grid = document.getElementById('collections-grid');
    if (!grid) return;

    let displayList = this.collections;
    if (this.activeFilter !== 'all') {
      displayList = displayList.filter(c => c.id === this.activeFilter);
    }

    grid.innerHTML = displayList.map(col => {
      const colArtifacts = this.artifacts.filter(a => a.collectionId === col.id);
      const exhibitCount = colArtifacts.length;

      return `
        <div class="collection-floating-card" data-col="${col.id}" style="--col-accent: ${col.themeColor}">
          <div class="col-glow-border"></div>
          <div class="col-card-header">
            <div class="col-icon-box" style="background: ${col.gradient}">
              <i class="fa-solid ${col.icon}"></i>
            </div>
            <span class="col-exhibit-badge">${exhibitCount} Exhibits</span>
          </div>

          <div class="col-card-body">
            <h3 class="col-title">${col.name}</h3>
            <div class="col-subtitle">${col.subtitle}</div>
            <p class="col-description">${col.description}</p>

            <div class="col-tags-row">
              ${col.tags ? col.tags.map(t => `<span class="col-tag">#${t}</span>`).join('') : ''}
            </div>

            <!-- Mini Artifacts Preview Reel -->
            <div class="col-relics-preview">
              ${colArtifacts.slice(0, 4).map(art => `
                <a href="artifact-viewer.html?id=${art.id}" class="mini-relic-chip" title="${art.name}">
                  <i class="fa-solid fa-cube"></i>
                  <span>${art.name.length > 18 ? art.name.substring(0, 18) + '...' : art.name}</span>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="col-card-footer">
            <a href="museum.html?room=${col.roomId}" class="cyber-btn btn-ghost btn-sm">
              <i class="fa-solid fa-person-walking"></i> Enter Hall
            </a>
            <button class="cyber-btn btn-primary btn-sm view-collection-btn" data-col-id="${col.id}">
              <i class="fa-solid fa-folder-open"></i> View All Relics &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind collection modal opener
    grid.querySelectorAll('.view-collection-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const colId = btn.getAttribute('data-col-id');
        this.openCollectionModal(colId);
      });
    });
  }

  openCollectionModal(colId) {
    const col = this.collections.find(c => c.id === colId);
    if (!col) return;

    const modal = document.getElementById('collection-detail-modal');
    if (!modal) return;

    const colArtifacts = this.artifacts.filter(a => a.collectionId === col.id);

    modal.innerHTML = `
      <div class="cyber-modal collection-modal-content">
        <button class="modal-close-x" id="col-modal-close">&times;</button>
        <div class="col-modal-header" style="background: ${col.gradient}">
          <div class="col-modal-badge">${col.name}</div>
          <h2>${col.subtitle}</h2>
          <p>${col.description}</p>
        </div>

        <div class="col-modal-artifacts-grid">
          ${colArtifacts.map(art => `
            <div class="artifact-subcard">
              <div class="subcard-icon"><i class="fa-solid fa-cube"></i></div>
              <div class="subcard-info">
                <h4>${art.name}</h4>
                <div class="subcard-meta">${art.historicalPeriod} &bull; ${art.origin}</div>
                <p>${art.description.substring(0, 110)}...</p>
                <div class="subcard-actions">
                  <a href="artifact-viewer.html?id=${art.id}" class="cyber-btn btn-primary btn-sm">
                    <i class="fa-solid fa-cube"></i> 360° Studio
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.add('active');
    window.VirtualVerseApp?.sound.playHover();

    document.getElementById('col-modal-close')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  bindSearchAndFilters() {
    const searchInput = document.getElementById('collections-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.collection-floating-card');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? 'flex' : 'none';
        });
      });
    }

    const filterPills = document.querySelectorAll('.collection-filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeFilter = pill.getAttribute('data-filter');
        this.renderCollectionsGrid();
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('collections-grid')) {
    window.CollectionsApp = new CollectionsApp();
  }
});