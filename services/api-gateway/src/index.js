const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const AUTH_URL = 'http://localhost:4001';
const RESTAURANT_URL = 'http://localhost:4002';
const ORDER_URL = 'http://localhost:4003';
const DELIVERY_URL = 'http://localhost:4004';
const TRACKING_URL = 'http://localhost:4005';
const NOTIFICATION_URL = 'http://localhost:4006';

async function authGuard(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Missing Authorization header' });
    await axios.get(`${AUTH_URL}/auth/verify`, { headers: { authorization: auth } });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

async function forward(req, res, method, url) {
  try {
    const response = await axios({
      method,
      url,
      data: req.body,
      headers: req.headers.authorization ? { authorization: req.headers.authorization } : undefined
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Gateway forwarding error' });
  }
}

app.get('/health', (_, res) => res.json({ service: 'api-gateway', status: 'ok' }));

app.post('/auth/login', (req, res) => forward(req, res, 'post', `${AUTH_URL}/auth/login`));
app.post('/auth/register', (req, res) => forward(req, res, 'post', `${AUTH_URL}/auth/register`));
app.get('/auth/verify', (req, res) => forward(req, res, 'get', `${AUTH_URL}/auth/verify`));

app.get('/restaurants', authGuard, (req, res) => forward(req, res, 'get', `${RESTAURANT_URL}/restaurants`));
app.get('/restaurants/:id', authGuard, (req, res) => forward(req, res, 'get', `${RESTAURANT_URL}/restaurants/${req.params.id}`));
app.get('/restaurants/:id/menu', authGuard, (req, res) => forward(req, res, 'get', `${RESTAURANT_URL}/restaurants/${req.params.id}/menu`));

app.post('/orders', authGuard, (req, res) => forward(req, res, 'post', `${ORDER_URL}/orders`));
app.get('/orders/:id', authGuard, (req, res) => forward(req, res, 'get', `${ORDER_URL}/orders/${req.params.id}`));
app.post('/orders/:id/pay', authGuard, (req, res) => forward(req, res, 'post', `${ORDER_URL}/orders/${req.params.id}/pay`));
app.put('/orders/:id/status', authGuard, (req, res) => forward(req, res, 'put', `${ORDER_URL}/orders/${req.params.id}/status`));

app.get('/deliveries/order/:orderId', authGuard, (req, res) => forward(req, res, 'get', `${DELIVERY_URL}/deliveries/order/${req.params.orderId}`));
app.put('/deliveries/order/:orderId/status', authGuard, (req, res) => forward(req, res, 'put', `${DELIVERY_URL}/deliveries/order/${req.params.orderId}/status`));

app.post('/tracking/update-location', authGuard, (req, res) => forward(req, res, 'post', `${TRACKING_URL}/tracking/update-location`));
app.get('/tracking/:orderId', authGuard, (req, res) => forward(req, res, 'get', `${TRACKING_URL}/tracking/${req.params.orderId}`));

app.get('/notifications/logs', authGuard, (req, res) => forward(req, res, 'get', `${NOTIFICATION_URL}/notifications/logs`));

app.listen(PORT, () => console.log(`api-gateway running on port ${PORT}`));
