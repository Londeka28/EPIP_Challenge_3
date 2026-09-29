const socket = io('http://localhost:3000');

// Initialize Map centered over area coordinates
const map = L.map('map').setView([-29.8587, 31.0218], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = {};

socket.on('NEW_EMERGENCY', (alertData) => {
    document.getElementById('conn-text').innerText = 'Online';
    document.getElementById('conn-text').style.color ='green';

    const { node_id, latitude, longitude, timestamp, status } = alertData;
    const marker = L.marker([latitude, longitude]).addTo(map);
    markers[node_id] = marker;
});

socket.on('NEW EMERGENCY',(alertData) => {
    renderAlertCard(alertData);
addMarker(alertData);
});

socket.on('STATUS_UPDATE', ({ node_id, status, responder_name, responder_contact, eta_mins }) => {
    const card= document.getElementById('card-${node_id}');
    if (card) {
        card.classList.add('accepted');
        card.querySelector('.status-tag').innerText = 'Accepted by ${responder_name}';
        card.querySelector('.responder-info').innerText = 'Contact: ${responder_contact}, ETA: ${eta_mins} mins';
        const btn = card.querySelector('.accept-button');
        if (btn) {btn.remove(); 
    }


function renderAlertCard(alertData) {
    const container = document.getElementById('alerts-list');
    const emptyMessage = container.querySelector('empty-message');
    if (emptyMessage) emptyMessage.remove();
    
    const card= document.createElement('div');
    card.className = 'alert-card';
    card.id = 'card-${alertData.node_id}';
    card.innerHTML = `
    <h3>${alertData.node_id} - ${alertData.type}</h3>
    <p><strong>Status:</strong> <span class="status-tag">${alertData.status}</span></p>
    <p><strong>Details:</strong> ${alertData.qa_status}</p>
    <p><strong>Coordinates:</strong> ${alertData.lat.toFixed(4)}, ${alertData.lng.toFixed(4)}</p>
    <button onclick="acceptAlert('${alertData.node_id}')">Acknowledge & Dispatch</button>
  `;
  container.prepend(card);
}
function addMarker(alertData) {
    const Maker = L.marker([alert.node_id.latitude, alert.node_id.longitude]).addTo(map);
    marker.bindPopup('<b>${alertData.node_id}</b><br>Emergency: ${alertData.type}<br>Status: ${alertData.status}').openPopup();
    markers[alertData.node_id] = marker;
    map.panTo([alertData.latitude, alertData.longitude]);
}

async function acceptAlert(node_id) {
    const responder = prompt("Enter Dispatch Team / Clinic Name:", "Rural Clinic Alpha");
  if (!responder) return;

  await fetch('http://localhost:3000/api/accept-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node_id: nodeId, responder_name: responder, eta_mins: 15 })
  });
}
