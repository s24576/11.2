import React, { useState, useEffect } from 'react';
import StarRatings from 'react-star-ratings';
import "./index.css";

const URL = "https://www.themealdb.com/api/json/v1/";
const KEY = "1";

function App() {
  const [mealsList, setMealsList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchIngredient, setSearchIngredient] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    fetch(URL + KEY + '/list.php?c=list')
      .then(response => response.json())
      .then(data => setCategories(data.meals))
      .catch(error => console.error('Error fetching categories:', error));

    fetch(URL + KEY + '/list.php?a=list')
      .then(response => response.json())
      .then(data => setCountries(data.meals))
      .catch(error => console.error('Error fetching countries:', error));

    fetch(URL + KEY + '/list.php?i=list')
      .then(response => response.json())
      .then(data => setIngredients(data.meals))
      .catch(error => console.error('Error fetching ingredients:', error));
  }, []);

  const searchMeal = () => {
    const searchPromises = [];

    if (searchName) {
      const searchByNamePromise = fetch(URL + KEY + '/search.php?s=' + searchName)
        .then(response => response.json())
        .then(data => data.meals)
        .catch(error => {
          console.error('Error searching by name:', error);
          return [];
        });

      searchPromises.push(searchByNamePromise);
    }

    if (searchCountry) {
      const searchByCountryPromise = fetch(URL + KEY + '/filter.php?a=' + searchCountry)
        .then(response => response.json())
        .then(data => data.meals)
        .catch(error => {
          console.error('Error searching by country:', error);
          return [];
        });

      searchPromises.push(searchByCountryPromise);
    }

    if (searchIngredient) {
      const searchByIngredientPromise = fetch(URL + KEY + '/filter.php?i=' + searchIngredient)
        .then(response => response.json())
        .then(data => data.meals)
        .catch(error => {
          console.error('Error searching by ingredient:', error);
          return [];
        });

      searchPromises.push(searchByIngredientPromise);
    }

    if (searchCategory) {
      const searchByCategoryPromise = fetch(URL + KEY + '/filter.php?c=' + searchCategory)
        .then(response => response.json())
        .then(data => data.meals)
        .catch(error => {
          console.error('Error searching by category:', error);
          return [];
        });

      searchPromises.push(searchByCategoryPromise);
    }

    Promise.all(searchPromises)
      .then(results => {
        const filteredMeals = results[0].filter(meal =>
          results.every(result => result.some(rMeal => rMeal.idMeal === meal.idMeal))
        );

        if (filteredMeals.length === 0) {
          setSearchMessage('No meals found for the selected criteria.');
        } else {
          setSearchMessage('');
        }

        setMealsList(filteredMeals.map(meal => ({ ...meal, rating: 0 })));
      })
      .catch(error => console.error('Error in fetching meals:', error));
  };

  const handleMealDetails = (mealId) => {
    fetch(URL + KEY + '/lookup.php?i=' + mealId)
      .then(response => response.json())
      .then(data => {
        const mealDetails = {
          ...data.meals[0],
          searchName,
          searchCategory,
          searchCountry,
          searchIngredient
        };
        setMealsList(prevMealsList => prevMealsList.map(m => m.idMeal === mealDetails.idMeal ? { ...m, details: mealDetails } : m));
      })
      .catch(error => console.error('Error fetching meal details:', error));
  };

  const changeRating = (newRating, mealId) => {
    setMealsList(prevMealsList =>
      prevMealsList.map(m => m.idMeal === mealId ? { ...m, rating: newRating } : m)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Meal Explorer</h1>
  
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search meal by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mr-2"
        />
        <button
          onClick={searchMeal}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
        >
          Search
        </button>
      </div>
  
      <div className="mb-4">
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mr-2"
        >
          <option value="">Select category...</option>
          {categories.map(category => (
            <option key={category.strCategory} value={category.strCategory}>{category.strCategory}</option>
          ))}
        </select>
        <select
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mr-2"
        >
          <option value="">Select country...</option>
          {countries.map(country => (
            <option key={country.strArea} value={country.strArea}>{country.strArea}</option>
          ))}
        </select>
        <select
          value={searchIngredient}
          onChange={(e) => setSearchIngredient(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mr-2"
        >
          <option value="">Select ingredient...</option>
          {ingredients.map(ingredient => (
            <option key={ingredient.strIngredient} value={ingredient.strIngredient}>{ingredient.strIngredient}</option>
          ))}
        </select>
      </div>
  
      <div>
        {searchMessage && <p className="text-red-500 mb-4">{searchMessage}</p>}
        {mealsList.map(meal => (
          <div key={meal.idMeal} className="mb-8">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-auto h-1/2 mb-2 rounded-md shadow-md"
            />
            <p className="text-xl font-semibold mb-2">{meal.strMeal}</p>
            <StarRatings
              rating={meal.rating}
              starRatedColor="gold"
              changeRating={(newRating) => changeRating(newRating, meal.idMeal)}
              numberOfStars={5}
              name='rating'
            />
            <button
              onClick={() => handleMealDetails(meal.idMeal)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 mt-2"
            >
              View Details
            </button>
            {meal.details && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Meal Details</h2>
                <p>ID: {meal.details.idMeal}</p>
                <p>Category: {meal.details.strCategory}</p>
                <p>Country: {meal.details.strArea}</p>
                <p>Ingredient 1: {meal.details.strIngredient1}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );  
}

export default App;
