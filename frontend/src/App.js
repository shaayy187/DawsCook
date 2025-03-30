import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./logo.png";
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import './App.css';
import RecipeDetails from './Recipe';

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    fetch("http://localhost:8000/api/recipes/") 
    .then(response => response.json())
    .then(data => setRecipes(data.recipes))
    .catch(error => console.error("Error:", error));

    return () => {
      document.head.removeChild(link); 
    };
  }, []);

  const fetchRecipes = () => {
    fetch("http://localhost:8000/api/recipes/") 
      .then(response => response.json())
      .then(data => setRecipes(data.recipes))
      .catch(error => console.error("Error:", error));
  };
  

  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <img src={logo} alt="Logo" className="logo" />
          <div id="home">
          <Link to="/" onClick={fetchRecipes}>Daws'Cook</Link>
          </div>
          <nav>
            <Link to="/signin">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Home recipes={recipes} />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
        </Routes>

        <footer className="footer">
          <p>&copy; 2025 Daws'Cook. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
