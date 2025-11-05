const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const demoUsers = [];

function signToken(user) {
  const payload = { id: user._id || user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

// Simple auth middleware to validate Bearer token and attach user payload
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.auth = payload; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const isDemo = process.env.DEMO_MODE === 'true';
    if (isDemo) {
      if (demoUsers.find(u => u.email === email)) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      const user = { 
        id: String(Date.now()), 
        name, 
        email, 
        passwordHash, 
        dietaryPreferences: { diet: 'none', allergies: [], cuisines: [] },
        createdAt: new Date().toISOString()
      };
      demoUsers.push(user);
      // Don't send password hash in response
      const { passwordHash: _, ...userResponse } = user;
      return res.json({ token: signToken(user), user: userResponse });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, passwordHash });
    // Don't send password hash in response
    const { passwordHash: _, ...userResponse } = user.toObject();
    res.json({ token: signToken(user), user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDemo = process.env.DEMO_MODE === 'true';
    if (isDemo) {
      const user = demoUsers.find(u => u.email === email);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      // Don't send password hash in response
      const { passwordHash: _, ...userResponse } = user;
      return res.json({ token: signToken(user), user: userResponse });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    // Don't send password hash in response
    const { passwordHash: _, ...userResponse } = user.toObject();
    res.json({ token: signToken(user), user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const isDemo = process.env.DEMO_MODE === 'true';
    if (isDemo) {
      const user = demoUsers.find(u => u.email === req.auth.email);
      if (!user) return res.status(404).json({ message: 'User not found' });
      // Don't send password hash in response
      const { passwordHash: _, ...userResponse } = user;
      return res.json({ user: userResponse });
    }
    const user = await User.findOne({ email: req.auth.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Don't send password hash in response
    const { passwordHash: _, ...userResponse } = user.toObject();
    res.json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const isDemo = process.env.DEMO_MODE === 'true';
    if (isDemo) {
      const user = demoUsers.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // In demo mode, we'll just simulate sending an email
      return res.json({ 
        message: 'Password reset email sent successfully (Demo Mode - Check console for reset link)',
        resetToken: 'demo-reset-token-' + Date.now()
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    // For demo purposes, we'll just return a success message
    res.json({ 
      message: 'Password reset email sent successfully',
      resetToken: 'reset-token-' + Date.now()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, dietaryPreferences } = req.body;
    const isDemo = process.env.DEMO_MODE === 'true';
    if (isDemo) {
      const idx = demoUsers.findIndex(u => u.email === req.auth.email);
      if (idx === -1) return res.status(404).json({ message: 'User not found' });
      
      // Update user data
      if (name) demoUsers[idx].name = name;
      if (dietaryPreferences) demoUsers[idx].dietaryPreferences = dietaryPreferences;
      demoUsers[idx].updatedAt = new Date().toISOString();
      
      // Don't send password hash in response
      const { passwordHash: _, ...userResponse } = demoUsers[idx];
      return res.json({ user: userResponse });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (dietaryPreferences) updateData.dietaryPreferences = dietaryPreferences;
    updateData.updatedAt = new Date();
    
    const user = await User.findOneAndUpdate(
      { email: req.auth.email }, 
      updateData, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't send password hash in response
    const { passwordHash: _, ...userResponse } = user.toObject();
    res.json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;