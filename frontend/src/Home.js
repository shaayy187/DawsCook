import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = ({ recipes }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/category/")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Błąd pobierania kategorii:", error));
  }, []);


  return (
    <div className="home-container">
      <section className="categories">
        <h2>The secret ingredient is always <span>love</span>.</h2>
        <div className="category-list">
          {categories.map((category) => (
            <div key={category.id} className="category">
              <img src={`data:image/png;base64,${category.image}`} alt={category.name} className="category-image" />
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="latest-recipes">
        <h2>Latest recipes</h2>
        <div className="recipe-grid">
          {recipes.slice(0, 6).map((recipe, index) => (
            <div key={index} className="recipe-card">
              <h4>{recipe.recipe}</h4>
              <p>{recipe.difficulty}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;