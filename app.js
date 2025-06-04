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
const navProfileLi = document.getElementById('nav-profile-li');
const navProfile = document.getElementById('nav-profile');
const navDarkmodeLi = document.getElementById('nav-darkmode-li');
const toggleDarkmode = document.getElementById('toggle-darkmode');
const profileSection = document.getElementById('profile-section');
const profileForm = document.getElementById('profile-form');
const profileName = document.getElementById('profile-name');
const profilePassword = document.getElementById('profile-password');
const profileAvatar = document.getElementById('profile-avatar');
const profileSuccess = document.getElementById('profile-success');
const deleteAccountBtn = document.getElementById('delete-account');
const ADMIN_EMAIL = 'admin@gmail.com';
const exportCsvBtn = document.getElementById('export-csv');
const searchEmployeeInput = document.getElementById('search-employee');
const filterDateInput = document.getElementById('filter-date');
let employeSearch = '';
let employeFilterDate = '';
const API_URL = 'http://localhost:4000/api'; // À adapter si déployé

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function hash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = ((h<<5)-h) + str.charCodeAt(i); return h.toString();
}
function saveToken(token) {
  localStorage.setItem('token', token);
}
function getToken() {
  return localStorage.getItem('token');
}
function clearToken() {
  localStorage.removeItem('token');
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
  navProfileLi.style.display = '';
  navDarkmodeLi.style.display = '';
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
  navProfileLi.style.display = 'none';
  navDarkmodeLi.style.display = 'none';
}
function showSection(section) {
  loginSection.style.display = section === 'login' ? '' : 'none';
  registerSection.style.display = section === 'register' ? '' : 'none';
  dashboardSection.style.display = section === 'dashboard' ? '' : 'none';
  presenceSection.style.display = section === 'presence' ? '' : 'none';
  employesSection.style.display = section === 'employes' ? '' : 'none';
  contactSection.style.display = section === 'contact' ? '' : 'none';
  profileSection.style.display = section === 'profile' ? '' : 'none';
}
function logout() {
  clearToken();
  localStorage.removeItem('user');
  hideNav();
  showSection('login');
}
navDashboard.onclick = () => { showSection('dashboard'); renderDashboard(); };
navPresence.onclick = () => { showSection('presence'); renderPresence(getSession()); };
navEmployes.onclick = () => { showSection('employes'); renderEmployes(); };
navContact.onclick = () => { showSection('contact'); };
navLogout.onclick = () => { logout(); };
navProfile.onclick = () => { showSection('profile'); renderProfile(); };

// Authentification via API
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
document.getElementById('show-register').onclick = () => { showSection('register'); };
document.getElementById('show-login').onclick = () => { showSection('login'); };
loginForm.onsubmit = async function(e) {
  e.preventDefault();
  let email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showToast('error', data.error || 'Erreur de connexion');
    saveToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showNav(data.user.role);
    navUser.textContent = data.user.email;
    showSection('dashboard');
    renderDashboard();
  } catch (err) {
    showToast('error', 'Erreur réseau');
  }
};
registerForm.onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  try {
    const res = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return showToast('error', data.error || 'Erreur d\'inscription');
    showToast('success', 'Inscription réussie, connecte-toi !');
    showSection('login');
  } catch (err) {
    showToast('error', 'Erreur réseau');
  }
};
function getSession() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).email : null;
}

// Tableau de bord
function getLastNDays(n) {
  const days = [];
  const now = new Date();
  for (let i = n-1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }));
  }
  return days;
}
function renderDashboard() {
  const email = getSession();
  const role = getRole(email);
  const dashboardTitle = document.getElementById('dashboard-title');
  const dashboardContent = document.getElementById('dashboard-content');
  const dashboardStats = document.getElementById('dashboard-stats');
  const dashboardGraph = document.getElementById('dashboard-graph');
  dashboardStats.innerHTML = '';
  dashboardGraph.getContext('2d').clearRect(0,0,360,120);
  if (role === 'admin') {
    dashboardTitle.textContent = 'Tableau de bord Administrateur';
    dashboardContent.innerHTML = '<div class="card"><b>Bienvenue, administrateur !</b><br>Utilisez le menu pour gérer les employés et consulter les pointages.</div>';
    // Stats globales
    const users = getUsers();
    const employes = Object.keys(users).filter(e => users[e].role === 'employe');
    let totalPointages = 0;
    let topEmploye = null, topCount = 0;
    let absentToday = [];
    const today = new Date().toLocaleDateString('fr-FR');
    employes.forEach(email => {
      const pres = users[email].presence || [];
      totalPointages += pres.length;
      if (pres.length > topCount) { topCount = pres.length; topEmploye = email; }
      // Absent aujourd'hui ?
      if (!pres.some(p => (p.arrivee||'').split(' ')[0] === today)) absentToday.push(email);
    });
    dashboardStats.innerHTML = `<div class="card"><b>Total pointages :</b> ${totalPointages}<br>`+
      (topEmploye ? `<b>Top employé :</b> ${topEmploye} (${topCount} pointages)<br>` : '')+
      (absentToday.length ? `<b>Absents aujourd'hui :</b> ${absentToday.join(', ')}` : '<b>Tous présents aujourd\'hui !</b>')+
      `</div>`;
    // Graphique global : nombre de pointages par jour (7 derniers jours)
    const days = getLastNDays(7);
    const data = days.map(day => employes.reduce((sum, email) => {
      const pres = users[email].presence || [];
      return sum + pres.filter(p => (p.arrivee||'').includes(day)).length;
    }, 0));
    drawBarGraph(dashboardGraph, days, data, '#2563eb');
  } else {
    dashboardTitle.textContent = 'Tableau de bord Employé';
    dashboardContent.innerHTML = '<p>Bienvenue ! Utilisez le menu pour pointer votre présence et consulter votre historique.</p>';
    // Stats perso
    const users = getUsers();
    const user = users[email];
    const pres = user.presence || [];
    dashboardStats.innerHTML = `<b>Présences totales :</b> ${pres.length}<br>`+
      (pres.length ? `<b>Dernier pointage :</b> ${pres[pres.length-1].arrivee}` : '');
    // Graphique : présence sur 7 jours
    const days = getLastNDays(7);
    const data = days.map(day => pres.filter(p => (p.arrivee||'').includes(day)).length);
    drawBarGraph(dashboardGraph, days, data, '#22c55e');
  }
}
function drawBarGraph(canvas, labels, data, color) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const max = Math.max(...data, 1);
  const barW = 32;
  for (let i=0; i<data.length; i++) {
    const x = 24 + i*48;
    const y = canvas.height - 20 - (data[i]/max)*(canvas.height-40);
    const h = (data[i]/max)*(canvas.height-40);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = '#222';
    ctx.font = '12px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x+barW/2, canvas.height-4);
    ctx.fillText(data[i], x+barW/2, y-6);
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
    showToast('error', 'Vous devez pointer votre départ avant de pointer une nouvelle arrivée.');
    return;
  }
  user.presence.push({ arrivee: now });
  setUsers(users);
  renderPresence(email);
  showToast('success', 'Arrivée enregistrée !');
};
if (btnPointerDescente) btnPointerDescente.onclick = function() {
  const email = getSession();
  if (!email) return;
  let users = getUsers();
  let user = users[email];
  if (!user.presence || user.presence.length === 0 || user.presence[user.presence.length-1].descente) {
    showToast('error', "Vous devez d'abord pointer votre arrivée.");
    return;
  }
  const now = new Date().toLocaleString('fr-FR');
  user.presence[user.presence.length-1].descente = now;
  setUsers(users);
  renderPresence(email);
  showToast('success', 'Départ enregistré !');
};
// Gestion employés (admin)
const employesList = document.getElementById('employes-list');
const adminCreateEmployeeForm = document.getElementById('admin-create-employee-form');
const adminCreateSuccess = document.getElementById('admin-create-success');
if (searchEmployeeInput) searchEmployeeInput.oninput = function() {
  employeSearch = this.value.trim().toLowerCase();
  renderEmployes();
};
if (filterDateInput) filterDateInput.oninput = function() {
  employeFilterDate = this.value;
  renderEmployes();
};
function renderEmployes() {
  let users = getUsers();
  let html = '';
  let employes = Object.keys(users).filter(email => users[email].role === 'employe');
  if (employeSearch) {
    employes = employes.filter(email => {
      const user = users[email];
      return email.includes(employeSearch) || (user.name||'').toLowerCase().includes(employeSearch);
    });
  }
  if (employes.length === 0) {
    html = '<p style="color:#888;">Aucun employé trouvé.</p>';
  } else {
    employes.forEach(email => {
      const user = users[email];
      html += `<div style='margin-bottom:18px;'><b>${email}</b> <button onclick="deleteEmploye('${email}')" style='margin-left:10px;color:#fff;background:#e11d48;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;'>Supprimer</button><ul style='background:#f1f5f9;padding:8px 8px;border-radius:8px;'>`;
      let pres = user.presence||[];
      if (employeFilterDate) {
        pres = pres.filter(p => (p.arrivee||'').slice(0,10) === employeFilterDate);
      }
      if (pres.length === 0) {
        html += '<li style="color:#888;">Aucune présence enregistrée.</li>';
      } else {
        pres.slice().reverse().forEach(p => {
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
  showToast('success', 'Employé supprimé !');
};
if (adminCreateEmployeeForm) adminCreateEmployeeForm.onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('admin-create-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-create-password').value;
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) { showToast('error', 'Email invalide'); return; }
  if (password.length < 5) { showToast('error', 'Mot de passe trop court'); return; }
  let users = getUsers();
  if (users[email]) { showToast('error', 'Email déjà utilisé'); return; }
  users[email] = { password: hash(password), role: 'employe', presence: [] };
  setUsers(users);
  adminCreateSuccess.style.display = 'block';
  setTimeout(() => { adminCreateSuccess.style.display = 'none'; adminCreateEmployeeForm.reset(); renderEmployes(); }, 1500);
  showToast('success', 'Employé créé !');
};
// Contact
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
if (contactForm) contactForm.onsubmit = function(e) {
  e.preventDefault();
  contactSuccess.style.display = 'block';
  setTimeout(() => { contactSuccess.style.display = 'none'; contactForm.reset(); }, 2000);
};
// Profil utilisateur
function getAvatar(email, name) {
  // Avatar avec initiales
  const initials = (name || email).split('@')[0].split(/[ ._-]/).map(w => w[0]).join('').toUpperCase().slice(0,2);
  const colors = ['#a1c4fd','#fbc2eb','#fcb69f','#c2e9fb','#2563eb'];
  const color = colors[(email.charCodeAt(0)+email.length)%colors.length];
  return `<div style='width:70px;height:70px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:2.2em;color:#fff;margin:auto;'>${initials}</div>`;
}
function renderProfile() {
  const email = getSession();
  let users = getUsers();
  let user = users[email];
  profileName.value = user.name || '';
  profileAvatar.innerHTML = getAvatar(email, user.name);
}
profileForm.onsubmit = function(e) {
  e.preventDefault();
  const email = getSession();
  let users = getUsers();
  let user = users[email];
  user.name = profileName.value.trim();
  if (profilePassword.value) user.password = hash(profilePassword.value);
  setUsers(users);
  profileSuccess.style.display = 'block';
  setTimeout(() => { profileSuccess.style.display = 'none'; profilePassword.value = ''; }, 1500);
  renderProfile();
  showToast('success', 'Profil mis à jour !');
};
deleteAccountBtn.onclick = function() {
  if (!confirm('Supprimer définitivement votre compte ?')) return;
  const email = getSession();
  let users = getUsers();
  delete users[email];
  setUsers(users);
  logout();
  showToast('success', 'Compte supprimé !');
};
// Dark mode
function setDarkMode(on) {
  if (on) {
    document.body.classList.add('dark');
    localStorage.setItem('darkmode','1');
    toggleDarkmode.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkmode','0');
    toggleDarkmode.textContent = '🌙';
  }
}
toggleDarkmode.onclick = function() {
  setDarkMode(!document.body.classList.contains('dark'));
};
if (localStorage.getItem('darkmode')==='1') setDarkMode(true);
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

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'success' ? 'toast-success' : 'toast-error');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  setTimeout(() => { container.removeChild(toast); }, 2700);
}

if (exportCsvBtn) exportCsvBtn.onclick = function() {
  const users = getUsers();
  const employes = Object.keys(users).filter(email => users[email].role === 'employe');
  let csv = 'Email,Nom,Arrivée,Départ\n';
  employes.forEach(email => {
    const user = users[email];
    const name = user.name || '';
    (user.presence||[]).forEach(p => {
      csv += `"${email}","${name}","${p.arrivee||''}","${p.descente||''}"\n`;
    });
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'presences.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  showToast('success', 'Export CSV généré !');
}; 