const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Demo data fallback
const demoRecipes = [
  {
    id: '1',
    title: 'Vegan Buddha Bowl',
    description: 'Nourishing bowl with quinoa, chickpeas, and fresh vegetables.',
    ingredients: [
      { name: 'Quinoa', quantity: '1 cup', category: 'grains' },
      { name: 'Chickpeas', quantity: '1 can', category: 'canned' },
      { name: 'Spinach', quantity: '2 cups', category: 'produce' },
      { name: 'Avocado', quantity: '1', category: 'produce' },
      { name: 'Cherry tomatoes', quantity: '1 cup', category: 'produce' },
    ],
    steps: ['Cook quinoa', 'Roast chickpeas', 'Arrange bowl', 'Drizzle dressing'],
    prepTime: 20,
    cookTime: 25,
    diet: 'vegan',
    cuisines: ['fusion'],
    images: [],
    rating: 4.6,
    owner: 'admin@tastetrail.com'
  }
];

// Get all recipes (admin view with owner info)
router.get('/recipes', verifyToken, isAdmin, async (req, res) => {
  try {
    const isDemo = process.env.DEMO_MODE === 'true';
    let recipes = [];
    
    if (isDemo) {
      recipes = demoRecipes;
    } else {
      recipes = await Recipe.find().populate('owner', 'name email').lean();
    }
    
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new recipe
router.post('/recipes', verifyToken, isAdmin, async (req, res) => {
  try {
    const isDemo = process.env.DEMO_MODE === 'true';
    const recipeData = { ...req.body, owner: req.user.id };
    
    if (isDemo) {
      const newRecipe = { 
        id: String(Date.now()), 
        ...recipeData,
        owner: req.user.email 
      };
      demoRecipes.push(newRecipe);
      return res.status(201).json(newRecipe);
    }
    
    const recipe = await Recipe.create(recipeData);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update any recipe
router.put('/recipes/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const isDemo = process.env.DEMO_MODE === 'true';
    
    if (isDemo) {
      const index = demoRecipes.findIndex(r => r.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Recipe not found' });
      
      demoRecipes[index] = { ...demoRecipes[index], ...req.body };
      return res.json(demoRecipes[index]);
    }
    
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('owner', 'name email');
    
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete any recipe
router.delete('/recipes/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const isDemo = process.env.DEMO_MODE === 'true';
    
    if (isDemo) {
      const index = demoRecipes.findIndex(r => r.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Recipe not found' });
      
      const deleted = demoRecipes.splice(index, 1);
      return res.json(deleted[0]);
    }
    
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;