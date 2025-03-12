import { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";  

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); 
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/recipes/") 
      .then(response => response.json())
      .then(data => setRecipes(data.recipes))
      .catch(error => console.error("Error:", error));
  }, []);

  return (
    <div className="app">
      <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h3> Daws'Cook</h3>
        <nav>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Recipes</li>
            <li>Sign In</li>
            <li>Sign Up</li>
          </ul>
        </nav>
      </header>

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

      <footer className="footer">
        <p>&copy; 2025 Daws'Cook. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;