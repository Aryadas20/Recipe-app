// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Drawer, Typography, Box, TablePagination, TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';

const API_BASE_URL = '/api';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [filters, setFilters] = useState({ title: '', cuisine: '' });
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page + 1,
      limit: rowsPerPage,
      ...filters,
    });
    
    // Use search endpoint if filters are active, otherwise use the main endpoint
    const endpoint = (filters.title || filters.cuisine) ? '/recipes/search' : '/recipes';
    
    axios.get(`${API_BASE_URL}${endpoint}?${params.toString()}`)
      .then(res => {
        setRecipes(res.data.data);
        // Search endpoint doesn't return total, so we get it from the main one if needed
        setTotalRecipes(res.data.total || res.data.data.length); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe);
  };
  
  const handleDrawerClose = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="container mx-auto p-8">
      <Typography variant="h4" className="mb-6 font-bold text-center">Recipe Finder 🍲</Typography>
      
      {/* --- Filter Section --- */}
      <Paper className="p-4 mb-6 flex gap-4 items-center">
        <TextField label="Filter by Title" name="title" value={filters.title} onChange={handleFilterChange} variant="outlined" size="small" />
        <TextField label="Filter by Cuisine" name="cuisine" value={filters.cuisine} onChange={handleFilterChange} variant="outlined" size="small" />
        {/* Add more filters for rating, time, etc. here */}
      </Paper>

      {/* --- Table Section --- */}
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold">Title</TableCell>
                <TableCell>Cuisine</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Total Time (min)</TableCell>
                <TableCell>Serves</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <TableRow key={recipe._id} hover onClick={() => handleRowClick(recipe)} className="cursor-pointer">
                    <TableCell>{recipe.title}</TableCell>
                    <TableCell>{recipe.cuisine}</TableCell>
                    <TableCell>
                      {recipe.rating && <ReactStars count={5} value={recipe.rating} edit={false} size={20} activeColor="#ffd700" />}
                    </TableCell>
                    <TableCell>{recipe.total_time}</TableCell>
                    <TableCell>{recipe.serves}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">No results found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 50]}
          component="div"
          count={totalRecipes}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {/* --- Drawer for Recipe Details --- */}
      <Drawer anchor="right" open={!!selectedRecipe} onClose={handleDrawerClose}>
        <Box sx={{ width: 400, padding: 3 }}>
          {selectedRecipe && (
            <>
              <Typography variant="h5" className="font-bold">{selectedRecipe.title}</Typography>
              <Typography variant="subtitle1" color="text.secondary" className="mb-4">{selectedRecipe.cuisine}</Typography>
              
              <Typography variant="body1" className="mb-4">{selectedRecipe.description}</Typography>
              
              <Typography variant="body2"><strong>Total Time:</strong> {selectedRecipe.total_time} min</Typography>
              <Typography variant="body2"><strong>Prep Time:</strong> {selectedRecipe.prep_time} min</Typography>
              <Typography variant="body2" className="mb-4"><strong>Cook Time:</strong> {selectedRecipe.cook_time} min</Typography>
              
              <Typography variant="h6" className="font-semibold mt-4 mb-2">Nutrients</Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(selectedRecipe.nutrients).map(([key, value]) => (
                    value && <TableRow key={key}><TableCell>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell><TableCell>{value}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
      </Drawer>
    </div>
  );
}

export default App;