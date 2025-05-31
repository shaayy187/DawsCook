import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ recipes = []}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/category/")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Couldn't download categories.", error);
        setError("Couldn't load categories. Please try again later.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
    <div className="home-container">
      <section className="categories">
        <h2>The secret ingredient is always <span>love</span>.</h2>
        <div className="category-list">
          {loading && <p>Loading categories...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && categories.length === 0 && <p>No categories found.</p>}
          {categories.map((category) => (
             <Link to={`/choosen-category/${category.id}`} key={category.id} className="category-card">
            <div key={category.id} className="category">
              <img src={`data:image/png;base64,${category.image}`} alt={category.name} className="category-image" />
              <span>{category.name}</span>
            </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="latest-recipes">
        <h2>Latest recipes</h2>
        {recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          <div className="recipe-grid">
            {recipes.slice(-5).reverse().map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card">
                <img
                  src={`data:image/png;base64,${recipe.image}`}
                  alt={recipe.recipe}
                  className="recipe-thumb"
                />
                <div className="recipe-info">
                  <h4>{recipe.recipe}</h4>
                  <p>{recipe.difficulty}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="featured-recipes">
        {recipes.length >= 3 &&
          [...recipes]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="featured-recipe-link">
              <div key={recipe.id} className="featured-recipe">
                <img
                  src={`data:image/png;base64,${recipe.image}`}
                  alt={recipe.recipe}
                  className="featured-image"
                />
                <div className="featured-content">
                  <h3>{recipe.recipe}</h3>
                  <p className="featured-date">
                    {new Date(recipe.created).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="featured-description">{recipe.description}</p>

                  <div className="icons-line">
                    <span>♡</span>
                    <span>🛒</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>({recipe.rating || 0})</span>
                  </div>
                </div>
              </div>
              </Link>
            ))}
      </section>
    </div>
    </div>
  );
};

export default Home;
