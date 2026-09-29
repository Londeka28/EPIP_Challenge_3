const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const MQTT_BROKER_URL = 'mqtt://broker.hivemq.com'; // Standard public test broker
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

let activeAlerts = [];

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('emergency/alerts/raw');
});

mqttClient.on('message',(topic, message) => {
    try {
        const alertData = JSON.parse(message.toString());
        alertData.timestamp = new Date().toISOString();
        alertData.status = 'PENDING';

        activeAlerts.push(alertData);

        // Push directly to live Web Client Admin Dashboard
        io.emit('NEW_EMERGENCY', alertData);
        console.log('New Emergency Relayed:', alertData.node_id);
    } catch (err) {
        console.error('Invalid JSON payload:', err.message);
    }

});

// Admin accepts the emergency alert
app.post('/api/accept-alert', (req, res) => {
    const {node_id, responder_name, responder_contact, eta_mins} = req.body;

    const payload = JSON.stringify({
        target: node_id,
        responder: responder_name,
        eta_mins: eta_mins,
        status: 'ACCEPTED'
    });
    mqttClient.publish('emergency/alerts/accepted', payload);
    res.status(200).send({ message: 'Alert accepted and published' });

// Publish back to the Gateway via MQTT broker that the alert has been accepted
mqttClient.publish('emergency/confirmations', payload);

// Update in-memory state
activeAlerts = activeAlerts.map(alert => 
alert.node_id === node_id ? { ...alert, status: 'ACCEPTED', responder_name, responder_contact, eta_mins } : alert);
});

// Notify all connected clients about the update
io.emit('ALERT_UPDATED', { node_id, status: 'ACCEPTED', responder_name, responder_contact, eta_mins });
return res.json({ success: true, message: `Alert for ${node_id} acknowledged.` });

app.get('/api/active-alerts', (req, res) => res.json(activeAlerts));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 