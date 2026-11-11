/**
 * VirtualVerse – Cosmic Archive
 * js/search.js
 * Universal Search & Multi-Filter Discovery Engine
 */

class SearchDiscoveryApp {
  constructor() {
    this.artifacts = [];
    this.collections = [];

    this.categoryFilter = 'all';
    this.periodFilter = 'all';
    this.query = '';

    this.init();
  }

  init() {
    this.artifacts = window.StorageManager.getArtifacts();
    this.collections = window.StorageManager.getCollections();

    this.bindSearchControls();
    this.populateFilterDropdowns();
    this.executeSearch();
  }

  populateFilterDropdowns() {
    const catSelect = document.getElementById('search-category-select');
    const periodSelect = document.getElementById('search-period-select');

    if (catSelect) {
      const categories = [...new Set(this.artifacts.map(a => a.category))];
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
    }

    if (periodSelect) {
      const periods = ['BCE', 'CE', 'Medieval', 'Renaissance', '20th Century', '21st Century'];
      periods.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        periodSelect.appendChild(opt);
      });
    }
  }

  bindSearchControls() {
    const input = document.getElementById('page-search-input');
    const catSelect = document.getElementById('search-category-select');
    const periodSelect = document.getElementById('search-period-select');
    const clearBtn = document.getElementById('search-clear-btn');

    if (input) {
      input.addEventListener('input', (e) => {
        this.query = e.target.value.trim().toLowerCase();
        this.executeSearch();
      });
    }

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.executeSearch();
      });
    }

    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.periodFilter = e.target.value;
        this.executeSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        if (catSelect) catSelect.value = 'all';
        if (periodSelect) periodSelect.value = 'all';
        this.query = '';
        this.categoryFilter = 'all';
        this.periodFilter = 'all';
        this.executeSearch();
      });
    }
  }

  executeSearch() {
    const resultsGrid = document.getElementById('search-results-grid');
    const countEl = document.getElementById('search-results-count');
    if (!resultsGrid) return;

    let filtered = this.artifacts;

    // Category Filter
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === this.categoryFilter);
    }

    // Historical Period Filter
    if (this.periodFilter !== 'all') {
      filtered = filtered.filter(a => a.historicalPeriod.toLowerCase().includes(this.periodFilter.toLowerCase()));
    }

    // Text Query Search
    if (this.query) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(this.query) ||
        a.description.toLowerCase().includes(this.query) ||
        a.origin.toLowerCase().includes(this.query) ||
        a.material.toLowerCase().includes(this.query) ||
        a.significance.toLowerCase().includes(this.query) ||
        a.historicalPeriod.toLowerCase().includes(this.query)
      );
    }

    if (countEl) countEl.textContent = `${filtered.length} Relics Found`;

    if (filtered.length === 0) {
      resultsGrid.innerHTML = `
        <div class="search-empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>No cosmic relics matched your parameters</h3>
          <p>Try broadening your search query or resetting filters.</p>
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = filtered.map(art => {
      const isFav = window.StorageManager.isFavorite(art.id);
      return `
        <div class="search-artifact-card">
          <div class="card-glow-edge"></div>
          <div class="card-top">
            <span class="card-cat-badge">${art.category}</span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${art.id}" title="Toggle Favorite">
              <i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
          </div>

          <div class="card-3d-visual">
            <div class="visual-holo-circle"></div>
            <i class="fa-solid fa-cube visual-icon"></i>
          </div>

          <div class="card-content">
            <h3 class="card-name">${art.name}</h3>
            <div class="card-meta">
              <span><i class="fa-solid fa-clock"></i> ${art.historicalPeriod}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${art.origin}</span>
            </div>
            <p class="card-desc">${art.description.substring(0, 115)}...</p>
          </div>

          <div class="card-bottom-actions">
            <a href="artifact-viewer.html?id=${art.id}" class="cyber-btn btn-primary btn-sm">
              <i class="fa-solid fa-cube"></i> Inspect in 3D
            </a>
            <a href="museum.html?room=${art.roomId}" class="cyber-btn btn-ghost btn-sm" title="View in Room">
              <i class="fa-solid fa-person-walking"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Bind Favorite toggles in results
    resultsGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const artId = btn.getAttribute('data-id');
        const res = window.StorageManager.toggleFavorite(artId);
        btn.classList.toggle('active', res.added);
        btn.innerHTML = `<i class="fa-${res.added ? 'solid' : 'regular'} fa-bookmark"></i>`;
        window.VirtualVerseApp?.showToast(res.added ? 'Bookmarked to personal archive' : 'Removed from bookmarks', 'info');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('search-results-grid')) {
    window.SearchDiscoveryApp = new SearchDiscoveryApp();
  }
});