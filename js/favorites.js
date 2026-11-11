/**
 * VirtualVerse – Cosmic Archive
 * js/favorites.js
 * Personal Favorites and Bookmarked Relics Management
 */

class FavoritesApp {
  constructor() {
    this.favIds = [];
    this.artifacts = [];
    this.filteredList = [];
    this.categoryFilter = 'all';

    this.init();
  }

  init() {
    this.loadFavoritesData();
    this.populateCategoryFilters();
    this.renderFavoritesGrid();
    this.bindExportAction();
  }

  loadFavoritesData() {
    this.favIds = window.StorageManager.getFavorites();
    const all = window.StorageManager.getArtifacts();
    this.artifacts = all.filter(a => this.favIds.includes(a.id));
  }

  populateCategoryFilters() {
    const filterContainer = document.getElementById('fav-category-filters');
    if (!filterContainer) return;

    const categories = ['all', ...new Set(this.artifacts.map(a => a.category))];

    filterContainer.innerHTML = categories.map(cat => `
      <button class="fav-cat-btn ${cat === this.categoryFilter ? 'active' : ''}" data-cat="${cat}">
        ${cat === 'all' ? 'All Relics' : cat}
      </button>
    `).join('');

    filterContainer.querySelectorAll('.fav-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.fav-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.categoryFilter = btn.getAttribute('data-cat');
        this.renderFavoritesGrid();
      });
    });
  }

  renderFavoritesGrid() {
    const grid = document.getElementById('favorites-grid');
    const countEl = document.getElementById('favorites-count-badge');
    if (!grid) return;

    this.loadFavoritesData();

    let displayList = this.artifacts;
    if (this.categoryFilter !== 'all') {
      displayList = displayList.filter(a => a.category === this.categoryFilter);
    }

    if (countEl) countEl.textContent = `${this.artifacts.length} Relics Saved`;

    if (this.artifacts.length === 0) {
      grid.innerHTML = `
        <div class="favorites-empty-card">
          <div class="empty-icon-wrap"><i class="fa-regular fa-bookmark"></i></div>
          <h3>Your personal cosmic archive is empty</h3>
          <p>As you explore the 3D museum chambers or inspect 360° models, click the bookmark icon to curate your personal museum collection.</p>
          <a href="museum.html" class="cyber-btn btn-primary">
            <i class="fa-solid fa-compass"></i> Begin 3D Exploration
          </a>
        </div>
      `;
      return;
    }

    if (displayList.length === 0) {
      grid.innerHTML = `
        <div class="favorites-empty-card">
          <p>No favorites found matching the selected category.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = displayList.map(art => `
      <div class="favorite-artifact-card" data-id="${art.id}">
        <div class="fav-card-top">
          <span class="fav-cat-pill">${art.category}</span>
          <button class="fav-remove-btn" data-id="${art.id}" title="Remove from Favorites">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <div class="fav-card-visual">
          <i class="fa-solid fa-cube visual-cube"></i>
        </div>

        <div class="fav-card-body">
          <h3>${art.name}</h3>
          <div class="fav-meta">
            <span><i class="fa-solid fa-clock"></i> ${art.historicalPeriod}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${art.origin}</span>
          </div>
          <p>${art.description.substring(0, 110)}...</p>
        </div>

        <div class="fav-card-actions">
          <a href="artifact-viewer.html?id=${art.id}" class="cyber-btn btn-primary btn-sm">
            <i class="fa-solid fa-cube"></i> 360° Studio
          </a>
          <a href="museum.html?room=${art.roomId}" class="cyber-btn btn-ghost btn-sm" title="View in Room">
            <i class="fa-solid fa-person-walking"></i>
          </a>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    grid.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const artId = btn.getAttribute('data-id');
        window.StorageManager.toggleFavorite(artId);
        window.VirtualVerseApp?.showToast('Relic removed from personal bookmarks.', 'info');
        this.renderFavoritesGrid();
        this.populateCategoryFilters();
      });
    });
  }

  bindExportAction() {
    const exportBtn = document.getElementById('fav-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (this.artifacts.length === 0) {
          window.VirtualVerseApp?.showToast('No saved relics to export.', 'error');
          return;
        }

        const exportObj = {
          title: 'VirtualVerse Curated Bookmarks',
          exportedAt: new Date().toISOString(),
          count: this.artifacts.length,
          artifacts: this.artifacts
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VirtualVerse-Bookmarks-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.VirtualVerseApp?.showToast('Bookmarks exported to JSON file.', 'success');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('favorites-grid')) {
    window.FavoritesApp = new FavoritesApp();
  }
});