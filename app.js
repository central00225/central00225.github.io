// Gestion navigation et rôles
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const presenceSection = document.getElementById('presence-section');
const employesSection = document.getElementById('employes-section');
const contactSection = document.getElementById('contact-section');
const navDashboardLi = document.getElementById('nav-dashboard-li');
const navPresenceLi = document.getElementById('nav-presence-li');
const navEmployesLi = document.getElementById('nav-employes-li');
const navContactLi = document.getElementById('nav-contact-li');
const navLogoutLi = document.getElementById('nav-logout-li');
const navUserLi = document.getElementById('nav-user-li');
const navDashboard = document.getElementById('nav-dashboard');
const navPresence = document.getElementById('nav-presence');
const navEmployes = document.getElementById('nav-employes');
const navContact = document.getElementById('nav-contact');
const navLogout = document.getElementById('nav-logout');
const navUser = document.getElementById('nav-user');
const ADMIN_EMAIL = 'admin@gmail.com';

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function hash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = ((h<<5)-h) + str.charCodeAt(i); return h.toString();
}
function saveSession(email) {
  localStorage.setItem('session', email);
}
function getSession() {
  return localStorage.getItem('session');
}
function clearSession() {
  localStorage.removeItem('session');
}
function getRole(email) {
  if (email === ADMIN_EMAIL) return 'admin';
  let users = getUsers();
  return users[email] && users[email].role === 'admin' ? 'admin' : 'employe';
}
function showNav(role) {
  navDashboardLi.style.display = '';
  navContactLi.style.display = '';
  navLogoutLi.style.display = '';
  navUserLi.style.display = '';
  if (role === 'admin') {
    navEmployesLi.style.display = '';
    navPresenceLi.style.display = 'none';
  } else {
    navEmployesLi.style.display = 'none';
    navPresenceLi.style.display = '';
  }
}
function hideNav() {
  navDashboardLi.style.display = 'none';
  navContactLi.style.display = 'none';
  navLogoutLi.style.display = 'none';
  navUserLi.style.display = 'none';
  navEmployesLi.style.display = 'none';
  navPresenceLi.style.display = 'none';
}
function showSection(section) {
  loginSection.style.display = section === 'login' ? '' : 'none';
  registerSection.style.display = section === 'register' ? '' : 'none';
  dashboardSection.style.display = section === 'dashboard' ? '' : 'none';
  presenceSection.style.display = section === 'presence' ? '' : 'none';
  employesSection.style.display = section === 'employes' ? '' : 'none';
  contactSection.style.display = section === 'contact' ? '' : 'none';
}
function logout() {
  clearSession();
  hideNav();
  showSection('login');
}
navDashboard.onclick = () => { showSection('dashboard'); renderDashboard(); };
navPresence.onclick = () => { showSection('presence'); renderPresence(getSession()); };
navEmployes.onclick = () => { showSection('employes'); renderEmployes(); };
navContact.onclick = () => { showSection('contact'); };
navLogout.onclick = () => { logout(); };

// Authentification
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
document.getElementById('show-register').onclick = () => { showSection('register'); };
document.getElementById('show-login').onclick = () => { showSection('login'); };
loginForm.onsubmit = function(e) {
  e.preventDefault();
  let email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  let users = getUsers();
  // Connexion admin spéciale
  if ((email === 'admin' && password === 'admin') || (email === ADMIN_EMAIL && password === 'admin')) {
    email = ADMIN_EMAIL;
    if (!users[email]) {
      users[email] = { password: hash('admin'), role: 'admin', presence: [] };
      setUsers(users);
    }
    saveSession(email);
    showNav('admin');
    navUser.textContent = email;
    showSection('dashboard');
    renderDashboard();
    return;
  }
  if (!users[email] || users[email].password !== hash(password)) return alert('Identifiants invalides');
  saveSession(email);
  showNav(getRole(email));
  navUser.textContent = email;
  showSection('dashboard');
  renderDashboard();
};
registerForm.onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) return alert('Email invalide');
  if (password.length < 5) return alert('Mot de passe trop court');
  let users = getUsers();
  if (users[email]) return alert('Email déjà utilisé');
  users[email] = { password: hash(password), role: 'employe', presence: [] };
  setUsers(users);
  saveSession(email);
  showNav('employe');
  navUser.textContent = email;
  showSection('dashboard');
  renderDashboard();
};

// Tableau de bord
function renderDashboard() {
  const email = getSession();
  const role = getRole(email);
  const dashboardTitle = document.getElementById('dashboard-title');
  const dashboardContent = document.getElementById('dashboard-content');
  if (role === 'admin') {
    dashboardTitle.textContent = 'Tableau de bord Administrateur';
    dashboardContent.innerHTML = '<p>Bienvenue, administrateur ! Utilisez le menu pour gérer les employés et consulter les pointages.</p>';
  } else {
    dashboardTitle.textContent = 'Tableau de bord Employé';
    dashboardContent.innerHTML = '<p>Bienvenue ! Utilisez le menu pour pointer votre présence et consulter votre historique.</p>';
  }
}
// Présence employé
const btnPointer = document.getElementById('btn-pointer');
const btnPointerDescente = document.getElementById('btn-pointer-descente');
const presenceUser = document.getElementById('presence-user');
const presenceHistory = document.getElementById('presence-history');
function renderPresence(email) {
  let users = getUsers();
  let user = users[email];
  presenceUser.textContent = email;
  presenceHistory.innerHTML = '';
  if (!user.presence || user.presence.length === 0) {
    presenceHistory.innerHTML = '<li style="color:#888;">Aucune présence enregistrée.</li>';
    return;
  }
  user.presence.slice().reverse().forEach(p => {
    let txt = `Arrivée : ${p.arrivee}`;
    if (p.descente) txt += ` | Départ : ${p.descente}`;
    presenceHistory.innerHTML += `<li>${txt}</li>`;
  });
}
if (btnPointer) btnPointer.onclick = function() {
  const email = getSession();
  if (!email) return;
  let users = getUsers();
  let user = users[email];
  const now = new Date().toLocaleString('fr-FR');
  user.presence = user.presence || [];
  if (user.presence.length && !user.presence[user.presence.length-1].descente) {
    alert('Vous devez pointer votre départ avant de pointer une nouvelle arrivée.');
    return;
  }
  user.presence.push({ arrivee: now });
  setUsers(users);
  renderPresence(email);
};
if (btnPointerDescente) btnPointerDescente.onclick = function() {
  const email = getSession();
  if (!email) return;
  let users = getUsers();
  let user = users[email];
  if (!user.presence || user.presence.length === 0 || user.presence[user.presence.length-1].descente) {
    alert("Vous devez d'abord pointer votre arrivée.");
    return;
  }
  const now = new Date().toLocaleString('fr-FR');
  user.presence[user.presence.length-1].descente = now;
  setUsers(users);
  renderPresence(email);
};
// Gestion employés (admin)
const employesList = document.getElementById('employes-list');
const adminCreateEmployeeForm = document.getElementById('admin-create-employee-form');
const adminCreateSuccess = document.getElementById('admin-create-success');
function renderEmployes() {
  let users = getUsers();
  let html = '';
  const employes = Object.keys(users).filter(email => users[email].role === 'employe');
  if (employes.length === 0) {
    html = '<p style="color:#888;">Aucun employé inscrit.</p>';
  } else {
    employes.forEach(email => {
      html += `<div style='margin-bottom:18px;'><b>${email}</b> <button onclick="deleteEmploye('${email}')" style='margin-left:10px;color:#fff;background:#e11d48;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;'>Supprimer</button><ul style='background:#f1f5f9;padding:8px 8px;border-radius:8px;'>`;
      if (!users[email].presence || users[email].presence.length === 0) {
        html += '<li style="color:#888;">Aucune présence enregistrée.</li>';
      } else {
        users[email].presence.slice().reverse().forEach(p => {
          let txt = `Arrivée : ${p.arrivee}`;
          if (p.descente) txt += ` | Départ : ${p.descente}`;
          html += `<li>${txt}</li>`;
        });
      }
      html += '</ul></div>';
    });
  }
  employesList.innerHTML = html;
}
window.deleteEmploye = function(email) {
  if (!confirm('Supprimer cet employé ?')) return;
  let users = getUsers();
  delete users[email];
  setUsers(users);
  renderEmployes();
};
if (adminCreateEmployeeForm) adminCreateEmployeeForm.onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('admin-create-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-create-password').value;
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) return alert('Email invalide');
  if (password.length < 5) return alert('Mot de passe trop court');
  let users = getUsers();
  if (users[email]) return alert('Email déjà utilisé');
  users[email] = { password: hash(password), role: 'employe', presence: [] };
  setUsers(users);
  adminCreateSuccess.style.display = 'block';
  setTimeout(() => { adminCreateSuccess.style.display = 'none'; adminCreateEmployeeForm.reset(); renderEmployes(); }, 1500);
};
// Contact
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
if (contactForm) contactForm.onsubmit = function(e) {
  e.preventDefault();
  contactSuccess.style.display = 'block';
  setTimeout(() => { contactSuccess.style.display = 'none'; contactForm.reset(); }, 2000);
};
// Init
window.onload = function() {
  hideNav();
  showSection('login');
  const email = getSession();
  if (email && getUsers()[email]) {
    showNav(getRole(email));
    navUser.textContent = email;
    showSection('dashboard');
    renderDashboard();
  }
}; 