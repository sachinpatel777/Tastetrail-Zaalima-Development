const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    dietaryPreferences: {
      diet: { type: String, enum: ['none', 'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo'], default: 'none' },
      allergies: [{ type: String }],
      cuisines: [{ type: String }],
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    collections: [
      {
        name: String,
        recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
      },
    ],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);