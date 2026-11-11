/**
 * VirtualVerse – Cosmic Archive
 * js/room-navigation.js
 * Room Portal and Sector Navigation Manager
 */

class RoomNavigationManager {
  static init() {
    this.renderRoomSelectorModal();
    this.bindRoomShortcuts();
  }

  static renderRoomSelectorModal() {
    const triggerBtn = document.getElementById('hud-room-picker-btn');
    const modal = document.getElementById('room-selector-modal');
    if (!triggerBtn || !modal) return;

    triggerBtn.addEventListener('click', () => {
      this.populateRoomsGrid();
      modal.classList.add('active');
      window.VirtualVerseApp?.sound.playHover();
    });

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  static populateRoomsGrid() {
    const grid = document.getElementById('rooms-modal-grid');
    if (!grid) return;

    const rooms = window.StorageManager.getRooms();
    const artifacts = window.StorageManager.getArtifacts();
    const currentRoomId = window.MuseumApp?.currentRoomId || 'room-ancient';

    grid.innerHTML = rooms.map(room => {
      const count = artifacts.filter(a => a.roomId === room.id).length;
      const isCurrent = room.id === currentRoomId;

      return `
        <div class="room-nav-card ${isCurrent ? 'current-room' : ''}" data-room="${room.id}">
          <div class="room-nav-header">
            <span class="room-nav-code">${room.code}</span>
            <span class="room-nav-badge">${count} Exhibits</span>
          </div>
          <h3>${room.name}</h3>
          <p>${room.description}</p>
          <div class="room-nav-action">
            ${isCurrent ? '<span class="status-current"><i class="fa-solid fa-location-dot"></i> Current Sector</span>' : '<button class="cyber-btn btn-sm btn-ghost">Teleport &rarr;</button>'}
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.room-nav-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetRoom = card.getAttribute('data-room');
        const modal = document.getElementById('room-selector-modal');
        if (modal) modal.classList.remove('active');

        if (window.MuseumApp) {
          window.MuseumApp.navigateToRoom(targetRoom, true);
        } else {
          // If on another page, navigate to museum.html with query param
          window.location.href = `museum.html?room=${targetRoom}`;
        }
      });
    });
  }

  static bindRoomShortcuts() {
    // Quick number keys 1-5 to switch rooms while in museum
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 5 && window.MuseumApp) {
        const rooms = window.StorageManager.getRooms();
        if (rooms[keyNum - 1]) {
          window.MuseumApp.navigateToRoom(rooms[keyNum - 1].id, true);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  RoomNavigationManager.init();
});

window.RoomNavigationManager = RoomNavigationManager;