// Simulation d'une IA qui "devine" la position d'un colis
// Ajout de la correspondance ville -> coordonnées fictives
const villesCoords = {
  "Paris": [48.8566, 2.3522],
  "Lyon": [45.75, 4.85],
  "Marseille": [43.3, 5.4],
  "Toulouse": [43.6, 1.44],
  "Bordeaux": [44.84, -0.58],
  "Lille": [50.63, 3.06],
  "Nantes": [47.22, -1.55],
  "Strasbourg": [48.58, 7.75],
  "Nice": [43.7, 7.27],
  "Rennes": [48.11, -1.68]
};

function getColisPosition(trackingNumber) {
  // Pour la démo, on génère une position aléatoire ou basée sur le numéro
  const villes = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille", "Nantes", "Strasbourg", "Nice", "Rennes"
  ];
  if (!trackingNumber || trackingNumber.length < 5) {
    return "Numéro de suivi invalide. Veuillez réessayer.";
  }
  // IA simulée : choix pseudo-aléatoire basé sur le numéro
  const index = trackingNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % villes.length;
  const status = [
    "en transit", "arrivé au centre de tri", "en cours de livraison", "livré", "en attente de retrait"
  ];
  const statusIndex = trackingNumber.charCodeAt(0) % status.length;
  return `Votre colis est actuellement à <b>${villes[index]}</b>, statut : <b>${status[statusIndex]}</b>.`;
}

function getVilleFromTracking(trackingNumber) {
  const villes = Object.keys(villesCoords);
  const index = trackingNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % villes.length;
  return villes[index];
}

function updateHistory(trackingNumber) {
  if (!trackingNumber) return;
  let history = JSON.parse(localStorage.getItem('history') || '[]');
  history = history.filter(n => n !== trackingNumber);
  history.unshift(trackingNumber);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem('history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const ul = document.getElementById('history');
  ul.innerHTML = '';
  if (history.length === 0) {
    ul.innerHTML = '<li style="color:#888;">Aucune recherche récente.</li>';
    return;
  }
  history.forEach(num => {
    const li = document.createElement('li');
    li.textContent = num;
    li.style.cursor = 'pointer';
    li.onclick = () => {
      document.getElementById('tracking-number').value = num;
      document.getElementById('tracking-form').dispatchEvent(new Event('submit'));
    };
    ul.appendChild(li);
  });
}

async function fetchCainiao(trackingNumber) {
  const url = `https://global.cainiao.com/detail.json?mailNoList=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur réseau');
    const data = await response.json();
    if (!data || !data.data || !data.data[0]) return {error: 'Aucune information trouvée pour ce numéro.'};
    return data.data[0];
  } catch (e) {
    return {error: 'Erreur lors de la récupération des données.'};
  }
}

function renderCainiaoResult(data) {
  const resultDiv = document.getElementById('result');
  const mapDiv = document.getElementById('map');
  const lastUpdateDiv = document.getElementById('last-update');
  const copyBtn = document.getElementById('copy-btn');
  if (data.error) {
    resultDiv.innerHTML = data.error;
    mapDiv.style.display = 'none';
    copyBtn.style.display = 'none';
    lastUpdateDiv.textContent = '';
    return;
  }
  let html = `<b>Numéro :</b> ${data.mailNo}<br>`;
  if (data.statusDesc) html += `<b>Statut :</b> ${data.statusDesc}<br>`;
  if (data.sendMailAddr) html += `<b>Expéditeur :</b> ${data.sendMailAddr}<br>`;
  if (data.recMailAddr) html += `<b>Destinataire :</b> ${data.recMailAddr}<br>`;
  if (data.latestTrackInfo) html += `<b>Dernière étape :</b> ${data.latestTrackInfo.desc} <br><b>Date :</b> ${data.latestTrackInfo.time}<br>`;
  if (data.trackInfoList && data.trackInfoList.length > 0) {
    html += '<b>Historique :</b><ul style="text-align:left;">';
    data.trackInfoList.slice(-5).reverse().forEach(ev => {
      html += `<li>${ev.time} : ${ev.desc}</li>`;
    });
    html += '</ul>';
  }
  resultDiv.innerHTML = html;
  // Carte fictive si localisation dispo
  let loc = null;
  if (data.latestTrackInfo && data.latestTrackInfo.desc) {
    const desc = data.latestTrackInfo.desc;
    const match = desc.match(/à ([A-Za-zÀ-ÿ\- ]+)/);
    if (match) loc = match[1];
  }
  if (loc) {
    mapDiv.innerHTML = `<b>Dernière localisation :</b> ${loc} <br><span style='font-size:2.5em;'>📦</span>`;
    mapDiv.style.display = 'flex';
  } else {
    mapDiv.style.display = 'none';
  }
  // Date/heure
  if (data.latestTrackInfo && data.latestTrackInfo.time) {
    lastUpdateDiv.textContent = `Dernière mise à jour : ${data.latestTrackInfo.time}`;
  } else {
    lastUpdateDiv.textContent = '';
  }
  copyBtn.style.display = 'block';
}

document.getElementById('tracking-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const trackingNumber = document.getElementById('tracking-number').value.trim();
  const resultDiv = document.getElementById('result');
  const mapDiv = document.getElementById('map');
  const lastUpdateDiv = document.getElementById('last-update');
  const copyBtn = document.getElementById('copy-btn');
  resultDiv.innerHTML = "Recherche en cours...";
  mapDiv.style.display = 'none';
  copyBtn.style.display = 'none';
  lastUpdateDiv.textContent = '';
  updateHistory(trackingNumber);
  const data = await fetchCainiao(trackingNumber);
  renderCainiaoResult(data);
});

document.getElementById('copy-btn').onclick = function() {
  const resultDiv = document.getElementById('result');
  const text = resultDiv.innerText;
  navigator.clipboard.writeText(text);
  this.textContent = 'Copié !';
  setTimeout(() => { this.textContent = 'Copier le résultat'; }, 1200);
};

document.getElementById('clear-history').onclick = function() {
  localStorage.removeItem('history');
  renderHistory();
};

window.onload = renderHistory; 