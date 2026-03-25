const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 4007;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function calcDistanceKm(from, to) {
  const dx = (from.lat - to.lat) * 111;
  const dy = (from.lng - to.lng) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

app.get('/health', (_, res) => res.json({ service: 'integration-service', status: 'ok' }));

app.post('/maps/shipping-fee', (req, res) => {
  const { restaurantLocation, customerLocation } = req.body;
  if (!restaurantLocation || !customerLocation) return res.status(400).json({ message: 'restaurantLocation and customerLocation are required' });
  const distanceKm = Number(calcDistanceKm(restaurantLocation, customerLocation).toFixed(2));
  const fee = Math.max(15000, Math.round(distanceKm * 5000));
  const etaMinutes = Math.max(15, Math.round(distanceKm * 4));
  res.json({ provider: 'google-maps-mock', distanceKm, fee, etaMinutes });
});

app.post('/payment/create', (req, res) => {
  const { orderId, amount } = req.body;
  res.json({
    provider: 'payment-gateway-mock',
    orderId,
    amount,
    paymentUrl: `https://mock-pay.local/pay?orderId=${orderId}`,
    transactionRef: `TX-${Date.now()}`,
    status: 'SUCCESS'
  });
});

app.post('/sms/send', (req, res) => {
  const { to, message } = req.body;
  console.log(`[SMS-MOCK] to=${to} message=${message}`);
  res.json({ provider: 'sms-mock', to, message, status: 'SENT' });
});

app.listen(PORT, () => console.log(`integration-service running on port ${PORT}`));
