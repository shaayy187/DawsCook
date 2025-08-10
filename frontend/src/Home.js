import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ recipes = [] }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/category/")
      .then((response) => response.json())
      .then((data) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        setLoading(false);
        setCategories(selected);
      })
      .catch((error) => {
        console.error("Couldn't download categories.", error);
        setError("Couldn't load categories. Please try again later.");
        setLoading(false);
      });
  }, []);

  const renderStars = (rating) => {
    const filledCount = Math.round(rating || 0);
    return (
      <span className="star-rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{ color: i <= filledCount ? '#FFD700' : '#CCC', fontSize: '1rem' }}
          >
            {i <= filledCount ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="app">
      <div className="home-container">
        <section className="categories">
          <h2>The secret ingredient is always <span>love</span>.</h2>
          <div className="category-list">
            {loading && <p>Loading categories...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && categories.length === 0 && <p>No categories found. Under construction.</p>}
            {categories.map((category) => (
              <Link
                to={`/choosen-category/${category.id}`}
                className="category-card"
                key={category.id}
              >
                <div className="category">
                  <img
                    src={`data:image/png;base64,${category.image}`}
                    alt={category.name}
                    className="category-image"
                  />
                  <span>{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="line-before-featured-recipes"></div>
        <section className="latest-recipes">
          <h2>Latest recipes</h2>
          {recipes.length === 0 ? (
            <p>Loading...</p>
          ) : (
            <div className="recipe-grid">
              {recipes.slice(-5).reverse().map((recipe) => (
                <Link 
                  to={`/recipe/${recipe.id}`} 
                  key={recipe.id} 
                  className="recipe-card"
                >
                  <img
                    src={`data:image/png;base64,${recipe.image}`}
                    alt={recipe.recipe}
                    className="recipe-thumb"
                  />
                  <div className="recipe-info">
                    <h4>{recipe.recipe}</h4>
                    <p>
                      {recipe.description
                        ? recipe.description.length > 40
                          ? recipe.description.slice(0, 40) + '...'
                          : recipe.description
                        : ''}
                    </p>
                    {renderStars(recipe.rating)}
                    <span className="vote-count">
                      {`${recipe.ratings_count || 0} vote${(recipe.ratings_count || 0) !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="line-before-featured-recipes"></div>
        <section className="featured-recipes">
          {recipes.length >= 3 &&
            [...recipes]
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map((recipe) => (
                <Link
                  to={`/recipe/${recipe.id}`}
                  key={recipe.id}
                  className="featured-recipe-link"
                >
                  <div className="featured-recipe">
                    <img
                      src={`data:image/png;base64,${recipe.image}`}
                      alt={recipe.recipe}
                      className="featured-image"
                    />
                    <div className="featured-content">
                      <h3>{recipe.recipe}</h3>
                      <p className="featured-date">
                        {new Date(recipe.created).toLocaleDateString('en-GB')}
                      </p>
                      <p className="featured-description">{recipe.description}</p>
                      <div className="icons-line">
                        {renderStars(recipe.rating)}
                        <span>
                          ({recipe.rating ? recipe.rating.toFixed(1) : '0.0'})
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {`${recipe.ratings_count || 0} vote${(recipe.ratings_count || 0) !== 1 ? 's' : ''}`}
                        </span>
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
