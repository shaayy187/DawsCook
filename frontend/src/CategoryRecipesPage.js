import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const CategoryRecipesPage = () => {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/category/')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error with fetching categories", error));

    fetch('http://localhost:8000/api/recipes/')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setRecipes(list);
      })
      .catch((error) => console.error("Error with fetching recipes", error));
  }, []);

  const getRecipesForCategory = (categoryId) =>
    Array.isArray(recipes)
      ? recipes.filter(r => r.category?.id === categoryId).slice(0, 6)
      : [];

  return (
    <div className="category-page">
      {categories.map((category) => (
        <div key={category.id} className="category-section">
          <h3 className="category-title">{category.name}</h3>
          <div className="recipe-row">
            {getRecipesForCategory(category.id).map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="category-recipe-link">
                <div className="recipe-tile">
                  <img
                    src={`data:image/png;base64,${recipe.image}`}
                    alt={recipe.recipe}
                    className="recipe-image"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <p className="recipe-name">{recipe.recipe}</p>
                  <div className="stars">
                    {'⭐'.repeat(Math.round(recipe.rating || 0))} ({recipe.rating || 0})
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to={`/choosen-category/${category.id}`} className="category-navigate-link">
            <button className="see-more-btn">See more »</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CategoryRecipesPage;
