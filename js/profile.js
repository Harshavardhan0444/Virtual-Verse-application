/**
 * VirtualVerse – Cosmic Archive
 * js/profile.js
 * User Profile Dashboard, Statistics, Badges, Exploration Timeline
 */

class UserProfileApp {
  constructor() {
    this.user = null;
    this.explorationData = null;
    this.achievements = [];

    this.init();
  }

  init() {
    this.user = window.StorageManager.getCurrentUser();
    this.explorationData = window.StorageManager.getExplorationData();
    this.achievements = window.StorageManager.getAchievements();

    this.renderProfileHeader();
    this.renderKPIStats();
    this.renderAchievementsGrid();
    this.renderActivityTimeline();
    this.bindDataActions();
  }

  renderProfileHeader() {
    const nameEl = document.getElementById('profile-name');
    const titleEl = document.getElementById('profile-title');
    const rolePill = document.getElementById('profile-role-pill');
    const emailEl = document.getElementById('profile-email');
    const joinedEl = document.getElementById('profile-joined');
    const levelBadge = document.getElementById('profile-level-badge');

    if (!this.user) return;

    if (nameEl) nameEl.textContent = this.user.name;
    if (titleEl) titleEl.textContent = this.user.title || 'Cosmic Explorer';
    if (emailEl) emailEl.textContent = this.user.email;
    if (joinedEl) joinedEl.textContent = `Enrolled: ${this.user.joinedDate || '2026'}`;
    if (rolePill) {
      rolePill.textContent = this.user.role.toUpperCase();
      rolePill.className = `role-pill role-${this.user.role}`;
    }

    // Calculate level based on XP from unlocked achievements
    const totalXP = this.achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.xp || 50), 0);
    const level = Math.floor(totalXP / 100) + 1;
    if (levelBadge) levelBadge.textContent = `Rank Level ${level} (${totalXP} XP)`;
  }

  renderKPIStats() {
    const viewedCount = this.explorationData.viewedArtifacts?.length || 0;
    const roomsCount = this.explorationData.visitedRooms?.length || 0;
    const quizCount = this.explorationData.quizScores?.length || 0;
    const favCount = window.StorageManager.getFavorites()?.length || 0;

    const elViewed = document.getElementById('kpi-viewed-count');
    const elRooms = document.getElementById('kpi-rooms-count');
    const elQuiz = document.getElementById('kpi-quiz-count');
    const elFav = document.getElementById('kpi-fav-count');

    if (elViewed) elViewed.textContent = viewedCount;
    if (elRooms) elRooms.textContent = `${roomsCount} / 5`;
    if (elQuiz) elQuiz.textContent = quizCount;
    if (elFav) elFav.textContent = favCount;
  }

  renderAchievementsGrid() {
    const grid = document.getElementById('profile-achievements-grid');
    if (!grid) return;

    grid.innerHTML = this.achievements.map(ach => `
      <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon-circle">
          <i class="fa-solid ${ach.icon}"></i>
        </div>
        <div class="ach-info">
          <h4>${ach.title}</h4>
          <p>${ach.desc}</p>
          <div class="ach-footer">
            <span class="ach-xp">+${ach.xp} XP</span>
            <span class="ach-status">${ach.unlocked ? `<i class="fa-solid fa-check"></i> Unlocked` : `<i class="fa-solid fa-lock"></i> Locked`}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderActivityTimeline() {
    const timeline = document.getElementById('profile-timeline');
    if (!timeline) return;

    const logs = this.explorationData.activityLog || [];
    if (logs.length === 0) {
      timeline.innerHTML = `
        <div class="empty-timeline-state">
          <i class="fa-solid fa-hourglass-start"></i>
          <p>No activity recorded yet. Explore 3D museum chambers to log entries!</p>
        </div>
      `;
      return;
    }

    const artifacts = window.StorageManager.getArtifacts();
    const rooms = window.StorageManager.getRooms();

    timeline.innerHTML = logs.slice(0, 10).map(log => {
      let icon = 'fa-compass';
      let title = 'Museum Action';
      let desc = '';

      if (log.type === 'artifact_view') {
        const art = artifacts.find(a => a.id === log.targetId);
        icon = 'fa-cube';
        title = 'Inspected Relic';
        desc = art ? `Studied 3D specifications of "${art.name}".` : 'Examined museum artifact.';
      } else if (log.type === 'room_visit') {
        const room = rooms.find(r => r.id === log.targetId);
        icon = 'fa-door-open';
        title = 'Traversed Sector';
        desc = room ? `Step into ${room.name}.` : 'Visited exhibition chamber.';
      } else if (log.type === 'quiz_attempt') {
        icon = 'fa-graduation-cap';
        title = 'Knowledge Examination';
        desc = `Scored ${log.score}/${log.total} (${log.percentage}%) on museum quiz.`;
      } else if (log.type === 'tour_completed') {
        icon = 'fa-route';
        title = 'Cinematic Tour';
        desc = 'Traversed flagship museum tour exhibits.';
      }

      const dateStr = new Date(log.timestamp).toLocaleString();

      return `
        <div class="timeline-entry">
          <div class="timeline-dot"><i class="fa-solid ${icon}"></i></div>
          <div class="timeline-content">
            <div class="timeline-head">
              <strong>${title}</strong>
              <small>${dateStr}</small>
            </div>
            <p>${desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  bindDataActions() {
    const exportBtn = document.getElementById('profile-export-btn');
    const resetBtn = document.getElementById('profile-reset-btn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          user: this.user,
          exploration: this.explorationData,
          favorites: window.StorageManager.getFavorites(),
          achievements: this.achievements
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VirtualVerse-Dossier-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.VirtualVerseApp?.showToast('Cosmic exploration dossier exported successfully!', 'success');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.VirtualVerseApp?.showConfirm(
          'Reset Exploration Progress',
          'Are you certain you wish to purge your museum logs, quiz scores, and achievements? This action cannot be reversed.',
          () => {
            window.StorageManager.resetToDefaults();
            window.VirtualVerseApp?.showToast('Exploration records restored to initial state.', 'info');
            setTimeout(() => window.location.reload(), 600);
          }
        );
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profile-name')) {
    window.ProfileApp = new UserProfileApp();
  }
});