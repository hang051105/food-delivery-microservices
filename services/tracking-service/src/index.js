const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 4005;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const trackingStore = {};

app.get('/health', (_, res) => res.json({ service: 'tracking-service', status: 'ok' }));

app.post('/tracking/update-location', (req, res) => {
  const { orderId, driverId, lat, lng, status = 'DELIVERING' } = req.body;
  if (!orderId || !driverId || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: 'orderId, driverId, lat, lng are required' });
  }
  trackingStore[orderId] = {
    orderId,
    driverId,
    lat,
    lng,
    status,
    updatedAt: new Date().toISOString(),
    provider: 'firebase-realtime-db-mock'
  };
  res.json(trackingStore[orderId]);
});

app.get('/tracking/:orderId', (req, res) => {
  const data = trackingStore[req.params.orderId];
  if (!data) return res.status(404).json({ message: 'Tracking not found' });
  res.json(data);
});

app.listen(PORT, () => console.log(`tracking-service running on port ${PORT}`));
