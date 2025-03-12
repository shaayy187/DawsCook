import React from 'react';

const Home = ({ recipes }) => {
  return (
    <div className="home-container">
      <section className="categories">
        <h2>The secret ingredient is always <span>love</span> .</h2>
        <div className="category-list">
          <div className="category">Vegan</div>
          <div className="category">Vegetarian</div>
          <div className="category">Healthy</div>
          <div className="category">Confectionery</div>
          <div className="category">Most Popular</div>
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
