const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'naturals-health-store-secret-change-in-production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Naturals backend is running' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    db.get('SELECT id FROM users WHERE email = ? OR username = ?', [normalizedEmail, username.trim()], async (err, existing) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.' });
      if (existing) return res.status(409).json({ success: false, message: 'Username or email already exists.' });

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username.trim(), normalizedEmail, hashedPassword], function (insertErr) {
        if (insertErr) return res.status(500).json({ success: false, message: 'Could not create account.' });
        res.status(201).json({ success: true, message: 'Registration successful.', userId: this.lastID });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, email, password } = req.body;
  const loginValue = (email || username || '').trim();
  if (!loginValue || !password) {
    return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
  }

  db.get('SELECT id, username, email, password FROM users WHERE email = ? OR username = ?', [loginValue.toLowerCase(), loginValue], async (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, message: 'Login successful.', token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

app.get('/api/profile', authenticate, (req, res) => {
  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'All contact fields are required.' });
  db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [name.trim(), email.trim(), message.trim()], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Could not save message.' });
    res.status(201).json({ success: true, message: 'Your message has been received.', contactId: this.lastID });
  });
});

app.get('/api/products', (req, res) => {
  res.json({ success: true, products: [
    { name: 'Kola Nuts', category: 'Natural Remedy' },
    { name: 'Myrtle', category: 'Natural Remedy' },
    { name: 'Pulsatilla', category: 'Natural Remedy' },
    { name: 'Reishi', category: 'Natural Remedy' },
    { name: 'Uncaria', category: 'Natural Remedy' },
    { name: 'Sorbus', category: 'Natural Remedy' },
    { name: 'Pine Nuts', category: 'Natural Remedy' },
    { name: 'Dog Rose', category: 'Natural Remedy' },
    { name: 'Black Garlic', category: 'Natural Remedy' },
    { name: 'Swiss Chard', category: 'Natural Remedy' },
    { name: 'Yellow Dock', category: 'Natural Remedy' },
    { name: 'Bakuchiol', category: 'Natural Remedy' }
  ]});
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Naturals Health Store running at http://localhost:${PORT}`);
});
