// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Recipe = require('./models/Recipe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- API Endpoints ---

// 1. Get All Recipes (Paginated & Sorted)
app.get('/api/recipes', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const recipes = await Recipe.find()
      .sort({ rating: -1 }) // Sort by rating descending
      .skip(skip)
      .limit(limit);
    
    const total = await Recipe.countDocuments();
    
    res.json({
      page,
      limit,
      total,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. Search Recipes
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { title, cuisine, rating, total_time, calories } = req.query;
    let query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive partial match
    }
    if (cuisine) {
      query.cuisine = cuisine; // Exact match
    }

    // Helper for numeric/range queries
    const buildRangeQuery = (param, field) => {
      if (!param) return;
      const match = param.match(/(>=|<=|=)(\d+(\.\d+)?)/);
      if (match) {
        const operator = match[1];
        const value = parseFloat(match[2]);
        if (operator === '>=') query[field] = { ...query[field], $gte: value };
        if (operator === '<=') query[field] = { ...query[field], $lte: value };
        if (operator === '=') query[field] = { ...query[field], $eq: value };
      }
    };
    
    buildRangeQuery(rating, 'rating');
    buildRangeQuery(total_time, 'total_time');
    buildRangeQuery(calories, 'nutrients.calories');

    const recipes = await Recipe.find(query);
    res.json({ data: recipes });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));