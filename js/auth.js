/**
 * VirtualVerse – Cosmic Archive
 * js/auth.js
 * Frontend Demonstration Authentication Engine using LocalStorage
 * Note: Clearly discloses client-side demo security boundaries.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initPasswordToggles();
  initDemoQuickFill();
});

function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;

    if (!email || !password) {
      window.VirtualVerseApp?.showToast('Please provide both cosmic credentials (Email & Password).', 'error');
      return;
    }

    const users = window.StorageManager.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      window.VirtualVerseApp?.showToast('User not found. Check credentials or register an account.', 'error');
      return;
    }

    if (matchedUser.password !== password) {
      window.VirtualVerseApp?.showToast('Incorrect password entered for this user.', 'error');
      return;
    }

    // Successful login
    window.StorageManager.setCurrentUser(matchedUser);
    if (rememberMe) {
      localStorage.setItem('vv_remembered_email', email);
    } else {
      localStorage.removeItem('vv_remembered_email');
    }

    window.VirtualVerseApp?.showToast(`Welcome back, ${matchedUser.name}! Initializing museum portal...`, 'success');

    setTimeout(() => {
      // If admin, option to redirect to admin or museum
      const redirectUrl = matchedUser.role === 'admin' ? 'admin.html' : 'museum.html';
      window.location.href = redirectUrl;
    }, 1000);
  });

  // Check remembered email
  const remembered = localStorage.getItem('vv_remembered_email');
  if (remembered) {
    const emailInput = document.getElementById('login-email');
    const rememberCheckbox = document.getElementById('remember-me');
    if (emailInput) emailInput.value = remembered;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
}

function initRegisterForm() {
  const regForm = document.getElementById('register-form');
  if (!regForm) return;

  const passInput = document.getElementById('reg-password');
  const strengthMeter = document.getElementById('password-strength-bar');

  if (passInput && strengthMeter) {
    passInput.addEventListener('input', () => {
      const val = passInput.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      strengthMeter.className = 'strength-bar';
      if (score === 1) strengthMeter.classList.add('weak');
      else if (score >= 2 && score <= 3) strengthMeter.classList.add('medium');
      else if (score >= 4) strengthMeter.classList.add('strong');
    });
  }

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const terms = document.getElementById('reg-terms')?.checked;

    if (!name || !email || !password) {
      window.VirtualVerseApp?.showToast('All fields are required.', 'error');
      return;
    }

    if (password.length < 6) {
      window.VirtualVerseApp?.showToast('Password must contain at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      window.VirtualVerseApp?.showToast('Passwords do not match. Please re-check.', 'error');
      return;
    }

    if (terms !== undefined && !terms) {
      window.VirtualVerseApp?.showToast('Please acknowledge the VirtualVerse Exploration Protocols.', 'error');
      return;
    }

    const users = window.StorageManager.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      window.VirtualVerseApp?.showToast('An account with this email already exists.', 'error');
      return;
    }

    // Create new student explorer user
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name,
      email: email,
      password: password,
      role: 'user',
      avatar: 'assets/images/avatar-student.png',
      title: 'Cosmic Research Fellow',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    window.StorageManager.saveUser(newUser);
    window.StorageManager.setCurrentUser(newUser);

    window.VirtualVerseApp?.showToast('Account registered successfully! Welcome to VirtualVerse.', 'success');

    setTimeout(() => {
      window.location.href = 'museum.html';
    }, 1000);
  });
}

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  });
}

function initDemoQuickFill() {
  const adminFillBtn = document.getElementById('demo-fill-admin');
  const studentFillBtn = document.getElementById('demo-fill-student');
  const guestBtn = document.getElementById('guest-continue-btn');

  if (adminFillBtn) {
    adminFillBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = 'admin@virtualverse.com';
        passInput.value = 'admin123';
        window.VirtualVerseApp?.showToast('Loaded Curator Admin Demo Credentials.', 'info');
      }
    });
  }

  if (studentFillBtn) {
    studentFillBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = 'student@mca.edu';
        passInput.value = 'student123';
        window.VirtualVerseApp?.showToast('Loaded Student Explorer Demo Credentials.', 'info');
      }
    });
  }

  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      window.StorageManager.logout(); // sets guest session
      window.VirtualVerseApp?.showToast('Proceeding as Cosmic Guest Explorer...', 'info');
      setTimeout(() => {
        window.location.href = 'museum.html';
      }, 500);
    });
  }
}

// Global Auth Route Guards
window.AuthGuard = {
  requireAuth: () => {
    const user = window.StorageManager.getCurrentUser();
    if (!user || user.role === 'guest') {
      window.VirtualVerseApp?.showToast('Please sign in to access this sector.', 'error');
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
      return false;
    }
    return true;
  },
  requireAdmin: () => {
    const user = window.StorageManager.getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.VirtualVerseApp?.showToast('Restricted Access: Curator Administrator privileges required.', 'error');
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
      return false;
    }
    return true;
  }
};