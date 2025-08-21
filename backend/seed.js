
const fs = require('fs');
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
require('dotenv').config();

const cleanAndInsertData = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');


    await Recipe.deleteMany({});
    console.log('Cleared existing recipes.');


    // 2. Read and Parse JSON file
    // 2. Read, Clean, and Parse the JSON file
    console.log('Reading and cleaning JSON file...');
    const fileContent = fs.readFileSync('US_recipes.json', 'utf-8');

    // Replace standalone NaN values with null so the JSON is valid
    const cleanedJsonString = fileContent.replace(/:\s*NaN/g, ': null');

    const recipesData = JSON.parse(cleanedJsonString);
    console.log('JSON file parsed successfully.');


    const cleanedRecipes = Object.values(recipesData).map(recipe => ({
      ...recipe,
      rating: isNaN(parseFloat(recipe.rating)) ? null : parseFloat(recipe.rating),
      prep_time: isNaN(parseInt(recipe.prep_time)) ? null : parseInt(recipe.prep_time),
      cook_time: isNaN(parseInt(recipe.cook_time)) ? null : parseInt(recipe.cook_time),
      total_time: isNaN(parseInt(recipe.total_time)) ? null : parseInt(recipe.total_time),
    }));


    await Recipe.insertMany(cleanedRecipes);
    console.log(`Successfully inserted ${cleanedRecipes.length} recipes.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {

    mongoose.connection.close();
  }
};

// Create a .env file with your MONGO_URI
// Example: MONGO_URI=mongodb://127.0.0.1:27017/recipesDB
cleanAndInsertData();