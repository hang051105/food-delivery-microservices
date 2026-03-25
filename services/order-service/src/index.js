const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 4003;
const RESTAURANT_URL = 'http://localhost:4002';
const INTEGRATION_URL = 'http://localhost:4007';
const DELIVERY_URL = 'http://localhost:4004';
const NOTIFICATION_URL = 'http://localhost:4006';
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let orders = [];
let payments = [];

app.get('/health', (_, res) => res.json({ service: 'order-service', status: 'ok' }));
app.get('/orders', (_, res) => res.json(orders));
app.get('/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

app.post('/orders', async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, restaurantId, items, customerLocation } = req.body;
    if (!customerId || !restaurantId || !Array.isArray(items) || items.length === 0 || !customerLocation) {
      return res.status(400).json({ message: 'customerId, restaurantId, items, customerLocation are required' });
    }

    const restaurant = (await axios.get(`${RESTAURANT_URL}/restaurants/${restaurantId}`)).data;
    const enrichedItems = items.map((item) => {
      const menuItem = restaurant.menu.find((m) => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: menuItem.price * item.quantity
      };
    });

    const itemsTotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = (await axios.post(`${INTEGRATION_URL}/maps/shipping-fee`, {
      restaurantLocation: restaurant.location,
      customerLocation
    })).data;

    const order = {
      id: orders.length + 1,
      customerId,
      customerName,
      customerPhone,
      restaurantId,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location,
      customerLocation,
      items: enrichedItems,
      itemsTotal,
      shippingFee: shipping.fee,
      distanceKm: shipping.distanceKm,
      etaMinutes: shipping.etaMinutes,
      totalAmount: itemsTotal + shipping.fee,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Cannot create order' });
  }
});

app.post('/orders/:id/pay', async (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const payment = (await axios.post(`${INTEGRATION_URL}/payment/create`, { orderId: order.id, amount: order.totalAmount })).data;
  payments.push(payment);
  order.paymentStatus = payment.status;
  order.status = 'PAID';

  const delivery = (await axios.post(`${DELIVERY_URL}/deliveries/assign`, {
    orderId: order.id,
    customerPhone: order.customerPhone
  })).data;

  order.delivery = delivery;
  order.status = 'DRIVER_ASSIGNED';

  if (order.customerPhone) {
    await axios.post(`${NOTIFICATION_URL}/notifications/sms`, {
      to: order.customerPhone,
      message: `Đơn hàng ${order.id} đã thanh toán thành công. Tổng tiền ${order.totalAmount}đ.`,
      type: 'PAYMENT_SUCCESS'
    });
  }

  res.json({ order, payment, delivery });
});

app.put('/orders/:id/status', async (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status || order.status;
  order.updatedAt = new Date().toISOString();
  if (req.body.status === 'COMPLETED' && order.customerPhone) {
    await axios.post(`${NOTIFICATION_URL}/notifications/sms`, {
      to: order.customerPhone,
      message: `Đơn hàng ${order.id} đã giao thành công. Cảm ơn bạn đã sử dụng dịch vụ.`,
      type: 'ORDER_COMPLETED'
    });
  }
  res.json(order);
});

app.listen(PORT, () => console.log(`order-service running on port ${PORT}`));
