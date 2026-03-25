const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 4006;
const INTEGRATION_URL = 'http://localhost:4007';
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let logs = [];

app.get('/health', (_, res) => res.json({ service: 'notification-service', status: 'ok' }));
app.get('/notifications/logs', (_, res) => res.json(logs));

app.post('/notifications/sms', async (req, res) => {
  const { to, message, type = 'ORDER_STATUS' } = req.body;
  if (!to || !message) return res.status(400).json({ message: 'to and message are required' });
  const result = await axios.post(`${INTEGRATION_URL}/sms/send`, { to, message });
  const log = { id: logs.length + 1, type, to, message, providerStatus: result.data.status, createdAt: new Date().toISOString() };
  logs.push(log);
  res.status(201).json(log);
});

app.listen(PORT, () => console.log(`notification-service running on port ${PORT}`));
