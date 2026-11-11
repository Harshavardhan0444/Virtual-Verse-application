/**
 * VirtualVerse – Cosmic Archive
 * js/admin.js
 * Chief Curator Administrative Control Center & CRUD Engine
 */

class AdminDashboardApp {
  constructor() {
    this.artifacts = [];
    this.collections = [];
    this.rooms = [];
    this.quizQuestions = [];
    this.users = [];

    this.activeTab = 'artifacts';
    this.artifactSearchQuery = '';

    this.init();
  }

  init() {
    // Check security / role guard
    if (window.AuthGuard && !window.AuthGuard.requireAdmin()) {
      return;
    }

    this.loadAllData();
    this.renderKPIStats();
    this.bindTabNavigation();
    this.renderArtifactsTable();
    this.renderCollectionsTable();
    this.renderQuizTable();
    this.renderActivityLogsTable();
    this.bindArtifactFormModal();
    this.bindCollectionFormModal();
    this.bindQuizFormModal();
    this.bindResetDemoData();
  }

  loadAllData() {
    this.artifacts = window.StorageManager.getArtifacts();
    this.collections = window.StorageManager.getCollections();
    this.rooms = window.StorageManager.getRooms();
    this.quizQuestions = window.StorageManager.getQuizQuestions();
    this.users = window.StorageManager.getUsers();
  }

  renderKPIStats() {
    const stats = window.StorageManager.getSystemStats();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('admin-stat-artifacts', stats.totalArtifacts);
    setVal('admin-stat-collections', stats.totalCollections);
    setVal('admin-stat-rooms', stats.totalRooms);
    setVal('admin-stat-users', stats.totalUsers);
    setVal('admin-stat-quizzes', stats.totalQuizAttempts);
    setVal('admin-stat-views', stats.totalArtifactViews);
  }

  bindTabNavigation() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');

        document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.add('hidden'));
        const activePane = document.getElementById(`tab-pane-${this.activeTab}`);
        if (activePane) activePane.classList.remove('hidden');

        window.VirtualVerseApp?.sound.playHover();
      });
    });
  }

  /* ---------------- ARTIFACTS CRUD TABLE ---------------- */
  renderArtifactsTable() {
    const tbody = document.getElementById('admin-artifacts-tbody');
    const countEl = document.getElementById('admin-artifacts-count');
    if (!tbody) return;

    let list = this.artifacts;
    if (this.artifactSearchQuery) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(this.artifactSearchQuery) ||
        a.category.toLowerCase().includes(this.artifactSearchQuery) ||
        a.origin.toLowerCase().includes(this.artifactSearchQuery)
      );
    }

    if (countEl) countEl.textContent = `${list.length} Relics`;

    tbody.innerHTML = list.map(art => `
      <tr>
        <td><code>${art.id}</code></td>
        <td>
          <strong>${art.name}</strong>
          <small class="table-sub">${art.historicalPeriod}</small>
        </td>
        <td><span class="table-badge">${art.category}</span></td>
        <td>${art.origin}</td>
        <td>${art.material.substring(0, 30)}...</td>
        <td class="table-actions">
          <a href="artifact-viewer.html?id=${art.id}" class="tbl-btn" title="View 3D"><i class="fa-solid fa-eye"></i></a>
          <button class="tbl-btn edit-art-btn" data-id="${art.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="tbl-btn delete-art-btn danger" data-id="${art.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `).join('');

    // Bind Edit
    tbody.querySelectorAll('.edit-art-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openArtifactModal(id);
      });
    });

    // Bind Delete
    tbody.querySelectorAll('.delete-art-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const art = this.artifacts.find(a => a.id === id);
        window.VirtualVerseApp?.showConfirm(
          'Decommission Relic',
          `Are you sure you wish to delete "${art?.name || id}" from the Cosmic Archive?`,
          () => {
            window.StorageManager.deleteArtifact(id);
            this.loadAllData();
            this.renderKPIStats();
            this.renderArtifactsTable();
            window.VirtualVerseApp?.showToast('Artifact deleted from database.', 'info');
          }
        );
      });
    });

    // Search input
    const searchInput = document.getElementById('admin-artifact-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.artifactSearchQuery = e.target.value.toLowerCase().trim();
        this.renderArtifactsTable();
      };
    }
  }

  openArtifactModal(artId = null) {
    const modal = document.getElementById('artifact-form-modal');
    const form = document.getElementById('artifact-crud-form');
    const titleEl = document.getElementById('artifact-modal-title');
    if (!modal || !form) return;

    form.reset();

    // Populate collections dropdown
    const colSelect = document.getElementById('art-form-collection');
    if (colSelect) {
      colSelect.innerHTML = this.collections.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    if (artId) {
      const art = this.artifacts.find(a => a.id === artId);
      if (art) {
        if (titleEl) titleEl.textContent = 'Edit Museum Artifact';
        document.getElementById('art-form-id').value = art.id;
        document.getElementById('art-form-id').readOnly = true;
        document.getElementById('art-form-name').value = art.name;
        document.getElementById('art-form-category').value = art.category;
        document.getElementById('art-form-collection').value = art.collectionId;
        document.getElementById('art-form-period').value = art.historicalPeriod;
        document.getElementById('art-form-origin').value = art.origin;
        document.getElementById('art-form-material').value = art.material;
        document.getElementById('art-form-dimensions').value = art.dimensions || '';
        document.getElementById('art-form-significance').value = art.significance;
        document.getElementById('art-form-desc').value = art.description;
        document.getElementById('art-form-discovery').value = art.discoveryInfo;
        document.getElementById('art-form-model').value = art.modelType || 'tutankhamun_mask';
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add New Cosmic Relic';
      document.getElementById('art-form-id').value = 'art-' + (this.artifacts.length + 1).toString().padStart(2, '0');
      document.getElementById('art-form-id').readOnly = false;
    }

    modal.classList.add('active');
  }

  bindArtifactFormModal() {
    const modal = document.getElementById('artifact-form-modal');
    const form = document.getElementById('artifact-crud-form');
    const openBtn = document.getElementById('admin-add-artifact-btn');
    const closeBtn = document.getElementById('artifact-modal-close');

    if (openBtn) openBtn.onclick = () => this.openArtifactModal(null);
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('art-form-id').value.trim();
        const name = document.getElementById('art-form-name').value.trim();
        const category = document.getElementById('art-form-category').value;
        const colId = document.getElementById('art-form-collection').value;
        const period = document.getElementById('art-form-period').value.trim();
        const origin = document.getElementById('art-form-origin').value.trim();
        const material = document.getElementById('art-form-material').value.trim();
        const dimensions = document.getElementById('art-form-dimensions').value.trim();
        const significance = document.getElementById('art-form-significance').value.trim();
        const description = document.getElementById('art-form-desc').value.trim();
        const discovery = document.getElementById('art-form-discovery').value.trim();
        const modelType = document.getElementById('art-form-model').value;

        // Map collection to room
        const col = this.collections.find(c => c.id === colId);
        const roomId = col?.roomId || 'room-ancient';

        const artifactPayload = {
          id: id,
          name: name,
          category: category,
          collectionId: colId,
          roomId: roomId,
          position: { x: (Math.random() - 0.5) * 20, y: 1.5, z: (Math.random() - 0.5) * 20 },
          historicalPeriod: period,
          origin: origin,
          material: material,
          dimensions: dimensions,
          significance: significance,
          description: description,
          discoveryInfo: discovery,
          modelType: modelType,
          modelPath: `assets/models/${modelType}.glb`,
          funFacts: [
            `Curated under the ${category} archive collection.`,
            `Documented originating from ${origin}.`
          ]
        };

        window.StorageManager.saveArtifact(artifactPayload);
        modal.classList.remove('active');
        this.loadAllData();
        this.renderKPIStats();
        this.renderArtifactsTable();
        window.VirtualVerseApp?.showToast(`Relic "${name}" saved to Cosmic Archive.`, 'success');
      };
    }
  }

  /* ---------------- COLLECTIONS CRUD TABLE ---------------- */
  renderCollectionsTable() {
    const tbody = document.getElementById('admin-collections-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.collections.map(col => {
      const count = this.artifacts.filter(a => a.collectionId === col.id).length;
      return `
        <tr>
          <td><code>${col.id}</code></td>
          <td>
            <strong>${col.name}</strong>
            <small class="table-sub">${col.subtitle}</small>
          </td>
          <td><span class="table-badge" style="border-color:${col.themeColor}">${col.roomId}</span></td>
          <td>${count} Exhibits</td>
          <td class="table-actions">
            <button class="tbl-btn edit-col-btn" data-id="${col.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="tbl-btn delete-col-btn danger" data-id="${col.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-col-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openCollectionModal(id);
      });
    });

    tbody.querySelectorAll('.delete-col-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.VirtualVerseApp?.showConfirm(
          'Delete Collection',
          `Are you sure you want to remove collection "${id}"?`,
          () => {
            window.StorageManager.deleteCollection(id);
            this.loadAllData();
            this.renderKPIStats();
            this.renderCollectionsTable();
            window.VirtualVerseApp?.showToast('Collection purged.', 'info');
          }
        );
      });
    });
  }

  openCollectionModal(colId = null) {
    const modal = document.getElementById('collection-form-modal');
    const form = document.getElementById('collection-crud-form');
    if (!modal || !form) return;

    form.reset();
    if (colId) {
      const col = this.collections.find(c => c.id === colId);
      if (col) {
        document.getElementById('col-form-id').value = col.id;
        document.getElementById('col-form-id').readOnly = true;
        document.getElementById('col-form-name').value = col.name;
        document.getElementById('col-form-subtitle').value = col.subtitle;
        document.getElementById('col-form-desc').value = col.description;
        document.getElementById('col-form-room').value = col.roomId;
      }
    } else {
      document.getElementById('col-form-id').value = 'col-' + Date.now().toString().slice(-4);
      document.getElementById('col-form-id').readOnly = false;
    }
    modal.classList.add('active');
  }

  bindCollectionFormModal() {
    const modal = document.getElementById('collection-form-modal');
    const form = document.getElementById('collection-crud-form');
    const openBtn = document.getElementById('admin-add-col-btn');
    const closeBtn = document.getElementById('col-modal-close');

    if (openBtn) openBtn.onclick = () => this.openCollectionModal(null);
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('col-form-id').value.trim();
        const name = document.getElementById('col-form-name').value.trim();
        const subtitle = document.getElementById('col-form-subtitle').value.trim();
        const desc = document.getElementById('col-form-desc').value.trim();
        const roomId = document.getElementById('col-form-room').value;

        const payload = {
          id: id,
          name: name,
          subtitle: subtitle,
          description: desc,
          themeColor: '#00E5FF',
          icon: 'fa-landmark',
          gradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(16, 20, 38, 0.9))',
          roomId: roomId,
          tags: ['Exhibition', 'Cosmic']
        };

        window.StorageManager.saveCollection(payload);
        modal.classList.remove('active');
        this.loadAllData();
        this.renderKPIStats();
        this.renderCollectionsTable();
        window.VirtualVerseApp?.showToast(`Collection "${name}" saved.`, 'success');
      };
    }
  }

  /* ---------------- QUIZ QUESTIONS CRUD TABLE ---------------- */
  renderQuizTable() {
    const tbody = document.getElementById('admin-quiz-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.quizQuestions.map(q => `
      <tr>
        <td><code>${q.id}</code></td>
        <td><span class="table-badge">${q.category}</span></td>
        <td><strong>${q.question}</strong></td>
        <td><code>Option ${String.fromCharCode(65 + q.answer)}</code></td>
        <td class="table-actions">
          <button class="tbl-btn edit-quiz-btn" data-id="${q.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="tbl-btn delete-quiz-btn danger" data-id="${q.id}" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openQuizModal(btn.getAttribute('data-id'));
      });
    });

    tbody.querySelectorAll('.delete-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.VirtualVerseApp?.showConfirm(
          'Delete Question',
          `Delete question ${id}?`,
          () => {
            window.StorageManager.deleteQuizQuestion(id);
            this.loadAllData();
            this.renderKPIStats();
            this.renderQuizTable();
            window.VirtualVerseApp?.showToast('Question deleted.', 'info');
          }
        );
      });
    });
  }

  openQuizModal(qId = null) {
    const modal = document.getElementById('quiz-form-modal');
    const form = document.getElementById('quiz-crud-form');
    if (!modal || !form) return;

    form.reset();
    if (qId) {
      const q = this.quizQuestions.find(item => item.id === qId);
      if (q) {
        document.getElementById('q-form-id').value = q.id;
        document.getElementById('q-form-cat').value = q.category;
        document.getElementById('q-form-text').value = q.question;
        document.getElementById('q-form-opt0').value = q.options[0] || '';
        document.getElementById('q-form-opt1').value = q.options[1] || '';
        document.getElementById('q-form-opt2').value = q.options[2] || '';
        document.getElementById('q-form-opt3').value = q.options[3] || '';
        document.getElementById('q-form-ans').value = q.answer;
        document.getElementById('q-form-explanation').value = q.explanation || '';
      }
    } else {
      document.getElementById('q-form-id').value = 'q-' + (this.quizQuestions.length + 1).toString().padStart(2, '0');
    }

    modal.classList.add('active');
  }

  bindQuizFormModal() {
    const modal = document.getElementById('quiz-form-modal');
    const form = document.getElementById('quiz-crud-form');
    const openBtn = document.getElementById('admin-add-quiz-btn');
    const closeBtn = document.getElementById('quiz-modal-close');

    if (openBtn) openBtn.onclick = () => this.openQuizModal(null);
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const payload = {
          id: document.getElementById('q-form-id').value.trim(),
          category: document.getElementById('q-form-cat').value,
          question: document.getElementById('q-form-text').value.trim(),
          options: [
            document.getElementById('q-form-opt0').value.trim(),
            document.getElementById('q-form-opt1').value.trim(),
            document.getElementById('q-form-opt2').value.trim(),
            document.getElementById('q-form-opt3').value.trim()
          ],
          answer: parseInt(document.getElementById('q-form-ans').value),
          explanation: document.getElementById('q-form-explanation').value.trim(),
          difficulty: 'Medium'
        };

        window.StorageManager.saveQuizQuestion(payload);
        modal.classList.remove('active');
        this.loadAllData();
        this.renderKPIStats();
        this.renderQuizTable();
        window.VirtualVerseApp?.showToast('Quiz question saved successfully.', 'success');
      };
    }
  }

  /* ---------------- ACTIVITY & EXPLORATION LOGS ---------------- */
  renderActivityLogsTable() {
    const tbody = document.getElementById('admin-logs-tbody');
    if (!tbody) return;

    const expData = window.StorageManager.getExplorationData();
    const logs = expData.activityLog || [];

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center">No system events logged yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.slice(0, 15).map(log => `
      <tr>
        <td><code>${log.type}</code></td>
        <td>${log.targetId || log.score !== undefined ? `${log.score}/${log.total} (${log.percentage}%)` : 'System Event'}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td><span class="table-badge status-ok">Verified</span></td>
      </tr>
    `).join('');
  }

  bindResetDemoData() {
    const resetBtn = document.getElementById('admin-reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.VirtualVerseApp?.showConfirm(
          'Re-Seed Demonstration Data',
          'This will purge all custom modifications and restore original default artifacts, collections, questions, and accounts. Continue?',
          () => {
            window.StorageManager.resetToDefaults();
            window.VirtualVerseApp?.showToast('Cosmic Archive re-seeded to initial MCA project defaults.', 'info');
            setTimeout(() => window.location.reload(), 600);
          }
        );
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-artifacts-tbody')) {
    window.AdminApp = new AdminDashboardApp();
  }
});