const mongoose = require('mongoose');

const nutrientSchema = new mongoose.Schema({
  calories: String,
  carbohydrateContent: String,
  cholesterolContent: String,
  fiberContent: String,
  proteinContent: String,
  saturatedFatContent: String,
  sodiumContent: String,
  sugarContent: String,
  fatContent: String
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  cuisine: String,
  title: String,
  rating: Number,
  prep_time: Number,
  cook_time: Number,
  total_time: Number,
  description: String,
  nutrients: nutrientSchema,
  serves: String
});

module.exports = mongoose.model('Recipe', recipeSchema);