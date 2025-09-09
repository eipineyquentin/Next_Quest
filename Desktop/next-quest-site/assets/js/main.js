// Simple state for auth simulation
let auth = JSON.parse(localStorage.getItem('auth')) || { isAuthenticated: false, role: null };

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
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;
      if (email && password) {
        auth.isAuthenticated = true;
        auth.role = loginForm.querySelector('[name="role"]').value || 'etudiant';
        localStorage.setItem('auth', JSON.stringify(auth));
        alert('Connecté en tant que ' + auth.role);
        closeModal();
        location.reload();
      }
    });
  }
  // Registration handler
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = registerForm.querySelector('[name="role"]').value;
      auth.isAuthenticated = true;
      auth.role = role;
      localStorage.setItem('auth', JSON.stringify(auth));
      alert('Inscription réussie en tant que ' + role);
      closeModal();
      location.reload();
    });
  }
});
