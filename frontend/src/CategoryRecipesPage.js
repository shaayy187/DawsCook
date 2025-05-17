import React, { useEffect, useState } from 'react';
import './App.css';

const CategoryRecipesPage = () => {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/category/')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error with fetching categories", error));

    fetch('http://localhost:8000/api/recipes/')
      .then((res) => res.json())
      .then((data) => {
       console.log("RECEIVED recipes:", data);
        if (Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        } else {
        console.error("Niepoprawny format danych:", data);
        }
      })
      .catch((error) => console.error("Error with fetching recipes", error));
  }, []);

  const getRecipesForCategory = (categoryId) => {
    return recipes
      .filter((r) => r.category === categoryId || r.category?.id === categoryId)
      .slice(0, 4);
  };

  return (
    <div className="category-page">
      {categories.map((category) => (
        <div key={category.id} className="category-section">
          <h3 className="category-title">{category.name}</h3>
          <div className="recipe-row">
            {getRecipesForCategory(category.id).map((recipe) => (
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
            ))}
          </div>
          <button className="see-more-btn">See more »</button>
        </div>
      ))}
    </div>
  );
};

export default CategoryRecipesPage;
