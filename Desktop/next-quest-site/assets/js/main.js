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
      if (!isValidEmail(email)) {
        alert('Adresse e-mail invalide.');
        return;
      }
      const user = users[email];
      if (!user) {
        alert('Aucun compte trouvé pour cet e-mail.');
        return;
      }
      const hash = await sha256(password);
      if (user.passwordHash !== hash) {
        alert('Mot de passe incorrect.');
        return;
      }
      auth.isAuthenticated = true;
      auth.role = user.role;
      auth.email = user.email;
      auth.name = user.name;
      saveAuth();
      alert('Connecté en tant que ' + (auth.name || auth.email) + ' • ' + auth.role);
      closeModal();
      location.reload();
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
      if (!name) { alert('Veuillez saisir un nom.'); return; }
      if (!isValidEmail(email)) { alert('Adresse e-mail invalide.'); return; }
      if (!password || password.length < 6) { alert('Mot de passe trop court (min. 6 caractères).'); return; }
      if (users[email]) { alert('Un compte existe déjà avec cet e-mail.'); return; }
      const passwordHash = await sha256(password);
      users[email] = { name, email, passwordHash, role, createdAt: new Date().toISOString() };
      saveUsers();
      auth.isAuthenticated = true;
      auth.role = role;
      auth.email = email;
      auth.name = name;
      saveAuth();
      alert('Compte créé et connecté avec succès.');
      closeModal();
      location.reload();
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
