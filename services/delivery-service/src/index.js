const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 4004;
const AUTH_URL = 'http://localhost:4001';
const NOTIFICATION_URL = 'http://localhost:4006';
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let deliveries = [];

app.get('/health', (_, res) => res.json({ service: 'delivery-service', status: 'ok' }));
app.get('/deliveries', (_, res) => res.json(deliveries));
app.get('/deliveries/order/:orderId', (req, res) => {
  const delivery = deliveries.find((d) => d.orderId === Number(req.params.orderId));
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  res.json(delivery);
});

app.post('/deliveries/assign', async (req, res) => {
  const { orderId, customerPhone } = req.body;
  const drivers = (await axios.get(`${AUTH_URL}/users/drivers/available`)).data;
  const driver = drivers[0];
  const delivery = {
    id: deliveries.length + 1,
    orderId,
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverLocation: driver.currentLocation,
    status: 'DRIVER_ASSIGNED',
    assignedAt: new Date().toISOString()
  };
  deliveries.push(delivery);
  if (customerPhone) {
    await axios.post(`${NOTIFICATION_URL}/notifications/sms`, {
      to: customerPhone,
      message: `Đơn hàng ${orderId} đã được gán cho tài xế ${driver.name}.`,
      type: 'DRIVER_ASSIGNED'
    });
  }
  res.status(201).json(delivery);
});

app.put('/deliveries/order/:orderId/status', (req, res) => {
  const delivery = deliveries.find((d) => d.orderId === Number(req.params.orderId));
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  delivery.status = req.body.status || delivery.status;
  delivery.updatedAt = new Date().toISOString();
  res.json(delivery);
});

app.listen(PORT, () => console.log(`delivery-service running on port ${PORT}`));
