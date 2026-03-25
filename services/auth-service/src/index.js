const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let users = [
  { id: 1, name: 'Demo Customer', email: 'customer@example.com', password: '123456', role: 'CUSTOMER', phone: '0900000001' },
  { id: 2, name: 'Demo Driver', email: 'driver@example.com', password: '123456', role: 'DRIVER', phone: '0900000002' },
  { id: 3, name: 'Demo Restaurant', email: 'restaurant@example.com', password: '123456', role: 'RESTAURANT', phone: '0900000003' },
  { id: 4, name: 'Admin', email: 'admin@example.com', password: '123456', role: 'ADMIN', phone: '0900000004' }
];

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
}

app.get('/health', (_, res) => res.json({ service: 'auth-service', status: 'ok' }));

app.post('/auth/register', (req, res) => {
  const { name, email, password, role = 'CUSTOMER', phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' });
  if (users.some((u) => u.email === email)) return res.status(409).json({ message: 'Email already exists' });
  const user = { id: users.length + 1, name, email, password, role, phone: phone || '' };
  users.push(user);
  const token = sign(user);
  res.status(201).json({ user: { id: user.id, name, email, role, phone: user.phone }, token });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = sign(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token });
});

app.get('/auth/verify', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

app.get('/users/drivers/available', (_, res) => {
  res.json(users.filter((u) => u.role === 'DRIVER').map((u, idx) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    currentLocation: idx === 0 ? { lat: 10.7769, lng: 106.7009 } : { lat: 10.7801, lng: 106.6950 },
    status: 'AVAILABLE'
  })));
});

app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`));
