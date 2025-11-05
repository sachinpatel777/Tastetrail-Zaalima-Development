const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const connectDB = require('./lib/db');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const adminRoutes = require('./routes/admin');

const PORT = process.env.PORT || 5000;

// DB connection (falls back to demo mode if MONGO_URI missing)
connectDB();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', demoMode: process.env.DEMO_MODE === 'true' });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`TasteTrail API running on http://localhost:${PORT}`);
});