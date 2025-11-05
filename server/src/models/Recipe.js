const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    ingredients: [
      {
        name: String,
        quantity: String,
        category: { type: String, default: 'misc' },
      },
    ],
    steps: [String],
    prepTime: Number,
    cookTime: Number,
    diet: { type: String, enum: ['none', 'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo'], default: 'none' },
    cuisines: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);