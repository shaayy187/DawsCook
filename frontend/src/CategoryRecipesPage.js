import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const CategoryRecipesPage = () => {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/category/')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error with fetching categories", error));

     fetch(`http://localhost:8000/api/recipes/`)
        .then((res)=> res.json())
        .then((data)=>setRecipes(data.results))
        .catch((error => console.error("Error witch fetching recipes for exact category",error)));
  }, []);

  const getRecipesForCategory = (categoryId) =>
    recipes.filter(r => r.category?.id === categoryId).slice(0, 4);

  return (
    <div className="category-page">
      {categories.map((category) => (
        <div key={category.id} className="category-section">
          <h3 className="category-title">{category.name}</h3>
          <div className="recipe-row">
            {getRecipesForCategory(category.id).map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="category-recipe-link">
              <div key={recipe.id} className="recipe-tile">
                <img
                  src={`data:image/png;base64,${recipe.image}`}
                  alt={recipe.recipe}
                  className="recipe-image"
                />
                <p className="recipe-name">{recipe.recipe}</p>
                <div className="stars">
                  {'⭐'.repeat(Math.round(recipe.rating || 0))} ({recipe.rating || 0})
                </div>
              </div>
              </Link>
            ))}
          </div>
          <Link to={`/choosen-category/${category.id}`} key={category.id} className="category-navigate-link">
          <button className="see-more-btn">See more »</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CategoryRecipesPage;
