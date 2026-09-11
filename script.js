// State Management
let activeCompanies = JSON.parse(localStorage.getItem('fixgrid_companies')) || [];
let currentUser = JSON.parse(localStorage.getItem('fixgrid_user')) || null;
let completedCount = parseInt(localStorage.getItem('fixgrid_completed')) || 0;
let totalEarnings = parseFloat(localStorage.getItem('fixgrid_earnings')) || 0;

// Navigation Elements
const pageHome = document.getElementById('page-home');
const pageBounties = document.getElementById('page-bounties');
const pageDashboard = document.getElementById('page-dashboard');

const navHome = document.getElementById('nav-home');
const navBounties = document.getElementById('nav-bounties');
const navDashboard = document.getElementById('nav-dashboard');

// Auth Modal Elements
const authModal = document.getElementById('auth-modal');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const openLoginBtn = document.getElementById('open-login-btn');
const openSignupBtn = document.getElementById('open-signup-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const logoutBtn = document.getElementById('logout-btn');

const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const userDisplayName = document.getElementById('user-display-name');

// Dashboard & Home UI Elements
const statCompleted = document.getElementById('stat-completed');
const statEarnings = document.getElementById('stat-earnings');
const statStatus = document.getElementById('stat-status');

const companyList = document.getElementById('company-list');
const noCompanies = document.getElementById('no-companies');
const searchInput = document.getElementById('company-search');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Page Switch Router
function switchPage(activeNav, activePage) {
  pageHome.classList.add('hidden');
  pageBounties.classList.add('hidden');
  pageDashboard.classList.add('hidden');

  navHome.classList.remove('active');
  navBounties.classList.remove('active');
  navDashboard.classList.remove('active');

  activePage.classList.remove('hidden');
  if (activeNav) activeNav.classList.add('active');
}

navHome.addEventListener('click', (e) => { e.preventDefault(); switchPage(navHome, pageHome); });
navBounties.addEventListener('click', (e) => { e.preventDefault(); switchPage(navBounties, pageBounties); });
navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchPage(navDashboard, pageDashboard); });

// Modal Handlers
function openModal(view) {
  authModal.classList.add('active');
  if (view === 'signup') {
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
  } else {
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
  }
}

function closeModal() { authModal.classList.remove('active'); }

openLoginBtn.addEventListener('click', () => openModal('login'));
openSignupBtn.addEventListener('click', () => openModal('signup'));
closeModalBtn.addEventListener('click', closeModal);
switchToSignup.addEventListener('click', (e) => { e.preventDefault(); openModal('signup'); });
switchToLogin.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

// Render Active Companies List
function renderCompanies(filterText = '') {
  companyList.innerHTML = '';

  const filtered = activeCompanies.filter(comp => 
    comp.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    companyList.appendChild(noCompanies);
    noCompanies.classList.remove('hidden');
    return;
  }

  noCompanies.classList.add('hidden');
  filtered.forEach(comp => {
    const card = document.createElement('div');
    card.className = 'company-card';
    card.innerHTML = `<h4>${comp.name}</h4><span>● Online</span>`;
    companyList.appendChild(card);
  });
}

// Search Filter Listener
searchInput.addEventListener('input', (e) => {
  renderCompanies(e.target.value);
});

// User State Update
function updateUIState() {
  if (currentUser) {
    authButtons.classList.add('hidden');
    userProfile.classList.remove('hidden');
    userDisplayName.textContent = currentUser.name;
    statStatus.textContent = "Active Member";

    // Add user to active company list if not present
    if (!activeCompanies.some(c => c.name.toLowerCase() === currentUser.name.toLowerCase())) {
      activeCompanies.push({ name: currentUser.name });
      localStorage.setItem('fixgrid_companies', JSON.stringify(activeCompanies));
    }
  } else {
    authButtons.classList.remove('hidden');
    userProfile.classList.add('hidden');
    statStatus.textContent = "Guest";
  }

  statCompleted.textContent = completedCount;
  statEarnings.textContent = `$${totalEarnings.toFixed(2)}`;
  renderCompanies(searchInput.value);
}

// Authentication Forms Logic
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;

  currentUser = { name, email };
  localStorage.setItem('fixgrid_user', JSON.stringify(currentUser));
  updateUIState();
  closeModal();
  signupForm.reset();
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const name = email.split('@')[0];

  currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
  localStorage.setItem('fixgrid_user', JSON.stringify(currentUser));
  updateUIState();
  closeModal();
  loginForm.reset();
});

logoutBtn.addEventListener('click', () => {
  if (currentUser) {
    activeCompanies = activeCompanies.filter(c => c.name.toLowerCase() !== currentUser.name.toLowerCase());
    localStorage.setItem('fixgrid_companies', JSON.stringify(activeCompanies));
  }
  currentUser = null;
  localStorage.removeItem('fixgrid_user');
  updateUIState();
});

// Bounty Claim Logic
document.querySelectorAll('.claim-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    if (!currentUser) {
      openModal('login');
      return;
    }

    const card = e.target.closest('.card');
    const reward = parseFloat(card.dataset.reward);

    completedCount += 1;
    totalEarnings += reward;

    localStorage.setItem('fixgrid_completed', completedCount);
    localStorage.setItem('fixgrid_earnings', totalEarnings);

    e.target.disabled = true;
    e.target.textContent = "Claimed";

    updateUIState();
  });
});

// Initialize Interface
updateUIState();