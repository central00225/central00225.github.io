// Gestion navigation
const homeSection = document.getElementById('home-section');
const contactSection = document.getElementById('contact-section');
const presenceSection = document.getElementById('presence-section');
const navHome = document.getElementById('nav-home');
const navContact = document.getElementById('nav-contact');
const navPresence = document.getElementById('nav-presence');
const navPresenceLi = document.getElementById('nav-presence-li');
const navLogoutLi = document.getElementById('nav-logout-li');
const navLogout = document.getElementById('nav-logout');
const navUserLi = document.getElementById('nav-user-li');
const navUser = document.getElementById('nav-user');
const navAdminLi = document.getElementById('nav-admin-li');
const navAdmin = document.getElementById('nav-admin');
const adminSection = document.getElementById('admin-section');
const adminUsersList = document.getElementById('admin-users-list');
const ADMIN_EMAIL = 'admin@gmail.com';

function showSection(section) {
  homeSection.style.display = section === 'home' ? '' : 'none';
  contactSection.style.display = section === 'contact' ? '' : 'none';
  presenceSection.style.display = section === 'presence' ? '' : 'none';
  adminSection.style.display = section === 'admin' ? '' : 'none';
}
navHome.onclick = () => showSection('home');
navContact.onclick = () => showSection('contact');
navPresence.onclick = () => showSection('presence');
navLogout.onclick = () => { logout(); };
navAdmin.onclick = function() {
  showSection('admin');
  renderAdminUsers();
};

// Authentification simple (localStorage)
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function hash(str) {
  // Simple hash pour la démo (ne pas utiliser en prod !)
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
function showLoggedUI(email) {
  navPresenceLi.style.display = '';
  navLogoutLi.style.display = '';
  navUserLi.style.display = '';
  navUser.textContent = email;
  document.getElementById('auth-forms').style.display = 'none';
  if (email === ADMIN_EMAIL) {
    navAdminLi.style.display = '';
  } else {
    navAdminLi.style.display = 'none';
  }
  showSection('home');
}
function showLoggedOutUI() {
  navPresenceLi.style.display = 'none';
  navLogoutLi.style.display = 'none';
  navUserLi.style.display = 'none';
  navUser.textContent = '';
  navAdminLi.style.display = 'none';
  document.getElementById('auth-forms').style.display = '';
  showSection('home');
}
function logout() {
  clearSession();
  showLoggedOutUI();
}
// Inscription
const registerForm = document.getElementById('register-form');
const registerFormDiv = document.getElementById('register-form-div');
const loginFormDiv = document.getElementById('login-form-div');
document.getElementById('show-register').onclick = () => {
  loginFormDiv.style.display = 'none';
  registerFormDiv.style.display = '';
};
document.getElementById('show-login').onclick = () => {
  registerFormDiv.style.display = 'none';
  loginFormDiv.style.display = '';
};
registerForm.onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) return alert('Email invalide');
  if (password.length < 5) return alert('Mot de passe trop court');
  let users = getUsers();
  if (users[email]) return alert('Email déjà utilisé');
  users[email] = { password: hash(password), presence: [] };
  setUsers(users);
  saveSession(email);
  showLoggedUI(email);
};
// Connexion
const loginForm = document.getElementById('login-form');
loginForm.onsubmit = function(e) {
  e.preventDefault();
  let email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  // Connexion admin spéciale
  if (email === 'admin' && password === 'admin') {
    email = ADMIN_EMAIL;
    // Crée le compte admin s'il n'existe pas
    let users = getUsers();
    if (!users[email]) {
      users[email] = { password: hash('admin'), presence: [] };
      setUsers(users);
    }
    saveSession(email);
    showLoggedUI(email);
    return;
  }
  let users = getUsers();
  if (!users[email] || users[email].password !== hash(password)) return alert('Identifiants invalides');
  saveSession(email);
  showLoggedUI(email);
};
// Présence
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
btnPointer.onclick = function() {
  const email = getSession();
  if (!email) return;
  let users = getUsers();
  let user = users[email];
  const now = new Date().toLocaleString('fr-FR');
  user.presence = user.presence || [];
  // On ne permet pas de pointer deux arrivées sans départ
  if (user.presence.length && !user.presence[user.presence.length-1].descente) {
    alert('Vous devez pointer votre départ avant de pointer une nouvelle arrivée.');
    return;
  }
  user.presence.push({ arrivee: now });
  setUsers(users);
  renderPresence(email);
};
btnPointerDescente.onclick = function() {
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
// Contact
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
contactForm.onsubmit = function(e) {
  e.preventDefault();
  contactSuccess.style.display = 'block';
  setTimeout(() => { contactSuccess.style.display = 'none'; contactForm.reset(); }, 2000);
};
// Gestion du formulaire de contact admin
const adminContactForm = document.getElementById('admin-contact-form');
const adminContactSuccess = document.getElementById('admin-contact-success');
if (adminContactForm) {
  adminContactForm.onsubmit = function(e) {
    e.preventDefault();
    adminContactSuccess.style.display = 'block';
    setTimeout(() => { adminContactSuccess.style.display = 'none'; adminContactForm.reset(); }, 2000);
  };
}
// Init
window.onload = function() {
  const email = getSession();
  if (email && getUsers()[email]) {
    showLoggedUI(email);
  } else {
    showLoggedOutUI();
  }
};
navPresence.onclick = function() {
  showSection('presence');
  const email = getSession();
  if (email) renderPresence(email);
};
function renderAdminUsers() {
  const users = getUsers();
  let html = '';
  const userEmails = Object.keys(users).filter(email => email !== ADMIN_EMAIL);
  if (userEmails.length === 0) {
    html = '<p style="color:#888;">Aucun employé inscrit.</p>';
  } else {
    userEmails.forEach(email => {
      html += `<div style='margin-bottom:18px;'><b>${email}</b><ul style='background:#f1f5f9;padding:8px 8px;border-radius:8px;'>`;
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
  adminUsersList.innerHTML = html;
} 