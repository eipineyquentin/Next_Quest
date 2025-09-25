// Simple state for auth simulation
let auth = JSON.parse(localStorage.getItem('auth')) || { isAuthenticated: false, role: null };

// Simple users registry persisted in localStorage: keyed by lowercased email
let users = JSON.parse(localStorage.getItem('users')) || {};

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(users));
}

function saveAuth() {
  localStorage.setItem('auth', JSON.stringify(auth));
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Toggle modal and handle login/registration
document.addEventListener('DOMContentLoaded', () => {
  const accountBtn = document.querySelector('#accountBtn');
  const modalOverlay = document.querySelector('#modalOverlay');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const tabButtons = document.querySelectorAll('.modal .tab-buttons button');
  const tabContents = document.querySelectorAll('.modal .tab-content');
  const loginForm = document.querySelector('#loginForm');
  const registerForm = document.querySelector('#registerForm');

  function openModal() {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  if (accountBtn) accountBtn.addEventListener('click', openModal);
  closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Tabs switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
  });

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailRaw = loginForm.querySelector('[name="email"]').value.trim();
      const password = loginForm.querySelector('[name="password"]').value;
      const email = emailRaw.toLowerCase();
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { throw new Error(data.error || 'Erreur de connexion'); }
        auth.isAuthenticated = true;
        auth.role = data.user.role;
        auth.email = data.user.email;
        auth.name = data.user.name;
        saveAuth();
        alert('Connecté en tant que ' + (auth.name || auth.email) + ' • ' + auth.role);
        closeModal();
        location.reload();
      } catch (err) {
        alert(err.message);
      }
    });
  }
  // Registration handler (auto-login after creation)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = registerForm.querySelector('[name="name"]').value.trim();
      const emailRaw = registerForm.querySelector('[name="email"]').value.trim();
      const password = registerForm.querySelector('[name="password"]').value;
      const role = registerForm.querySelector('[name="role"]').value || 'etudiant';
      const email = emailRaw.toLowerCase();
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) { throw new Error(data.error || 'Erreur lors de l\'inscription'); }
        auth.isAuthenticated = true;
        auth.role = data.user.role;
        auth.email = data.user.email;
        auth.name = data.user.name;
        saveAuth();
        alert('Compte créé et connecté avec succès.');
        closeModal();
        location.reload();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // UI toggle based on auth on role-specific pages
  function updateUIForAuth() {
    const accountBtn = document.querySelector('#accountBtn');
    if (accountBtn) {
      accountBtn.setAttribute('aria-label', auth.isAuthenticated ? 'Compte: ' + (auth.name || auth.email) : 'Connexion');
      accountBtn.title = auth.isAuthenticated ? (auth.name || auth.email) + ' (' + (auth.role || '') + ')' : 'Connexion';
    }

    const etuOn = document.getElementById('etudiant-connecte');
    const etuOff = document.getElementById('etudiant-non-connecte');
    if (etuOn || etuOff) {
      const show = auth.isAuthenticated && auth.role === 'etudiant';
      if (etuOn) etuOn.style.display = show ? '' : 'none';
      if (etuOff) etuOff.style.display = show ? 'none' : '';
    }

    const entOn = document.getElementById('entreprise-connectee');
    const entOff = document.getElementById('entreprise-non-connectee');
    if (entOn || entOff) {
      const show = auth.isAuthenticated && auth.role === 'entreprise';
      if (entOn) entOn.style.display = show ? '' : 'none';
      if (entOff) entOff.style.display = show ? 'none' : '';
    }

    const partOn = document.getElementById('particulier-connecte');
    const partOff = document.getElementById('particulier-non-connecte');
    if (partOn || partOff) {
      const show = auth.isAuthenticated && auth.role === 'particulier';
      if (partOn) partOn.style.display = show ? '' : 'none';
      if (partOff) partOff.style.display = show ? 'none' : '';
    }
  }

  updateUIForAuth();
});
