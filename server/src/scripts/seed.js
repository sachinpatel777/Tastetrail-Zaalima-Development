require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('MONGO_URI not set. Seed script skipped.');
    process.exit(0);
  }
  await mongoose.connect(uri);
  await Recipe.deleteMany({});
  await Recipe.insertMany([
    {
      title: 'Vegan Buddha Bowl',
      description: 'Nourishing bowl with quinoa, chickpeas, and veggies.',
      ingredients: [
        { name: 'Quinoa', quantity: '1 cup', category: 'grains' },
        { name: 'Chickpeas', quantity: '1 can', category: 'canned' },
        { name: 'Spinach', quantity: '2 cups', category: 'produce' },
      ],
      steps: ['Cook quinoa', 'Roast chickpeas', 'Assemble with veggies'],
      prepTime: 20,
      cookTime: 25,
      diet: 'vegan',
      cuisines: ['fusion'],
      images: [],
      rating: 4.6,
    },
    {
      title: 'Gluten-Free Chicken Stir Fry',
      description: 'Quick stir fry with tamari sauce.',
      ingredients: [
        { name: 'Chicken breast', quantity: '500g', category: 'meat' },
        { name: 'Bell pepper', quantity: '1', category: 'produce' },
        { name: 'Tamari', quantity: '2 tbsp', category: 'condiments' },
      ],
      steps: ['Slice chicken and veggies', 'Stir fry', 'Add tamari'],
      prepTime: 15,
      cookTime: 10,
      diet: 'gluten-free',
      cuisines: ['asian'],
      images: [],
      rating: 4.2,
    },
  ]);
  console.log('Seeded recipes.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});