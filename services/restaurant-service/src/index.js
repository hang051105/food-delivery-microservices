const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 4002;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const restaurants = [
  {
    id: 1,
    name: 'Cơm Tấm Sài Gòn',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    location: { lat: 10.7745, lng: 106.7036 },
    status: 'OPEN',
    menu: [
      { id: 101, name: 'Cơm tấm sườn', price: 45000, available: true },
      { id: 102, name: 'Cơm tấm bì chả', price: 40000, available: true }
    ]
  },
  {
    id: 2,
    name: 'Phở Hà Nội',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    location: { lat: 10.7727, lng: 106.6981 },
    status: 'OPEN',
    menu: [
      { id: 201, name: 'Phở bò tái', price: 55000, available: true },
      { id: 202, name: 'Phở gà', price: 50000, available: true }
    ]
  }
];

app.get('/health', (_, res) => res.json({ service: 'restaurant-service', status: 'ok' }));
app.get('/restaurants', (_, res) => res.json(restaurants.map(({ menu, ...rest }) => rest)));
app.get('/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find((r) => r.id === Number(req.params.id));
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant);
});
app.get('/restaurants/:id/menu', (req, res) => {
  const restaurant = restaurants.find((r) => r.id === Number(req.params.id));
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant.menu);
});

app.listen(PORT, () => console.log(`restaurant-service running on port ${PORT}`));
