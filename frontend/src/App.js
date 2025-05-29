import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./logo.png";
import SignIn from './SignIn';
import SignUp from './SignUp';
import AvatarDropdown from './AvatarDropdown';
import Home from './Home';
import AboutUs from './AboutUs';
import './App.css';
import RecipeDetails from './Recipe';
import Profile from './Profile';
import Settings from './Settings';
import SessionChecker from './Session'
import CategoryRecipesPage from './CategoryRecipesPage';
import ChoosenCategoryRecipes from './ChoosenCategoryRecipes'

function App() {
  const [recipes, setRecipes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    fetch("http://localhost:8000/api/recipes/") 
    .then(response => response.json())
    .then(data => setRecipes(data.results))
    .catch(error => console.error("Error:", error));

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    }

    return () => {
      document.head.removeChild(link); 
    };
  }, []);

  const fetchRecipes = () => {
    fetch("http://localhost:8000/api/recipes/") 
      .then(response => response.json())
      .then(data => setRecipes(data.results))
      .catch(error => console.error("Error:", error));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.reload();
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
    <SessionChecker setIsLoggedIn={setIsLoggedIn} />
      <div className="app">
        <header className="header">
          <img src={logo} alt="Logo" className="logo" />
          <div id="home">
            <Link to="/" onClick={fetchRecipes}>Daws'Cook</Link>
          </div>
          <div className="navigation-container"> 
            <nav>
              <Link to="/">Home</Link>
              <Link to="/aboutus">About us</Link>
              <Link to="/categories">Recipes</Link>
              {!isLoggedIn && (
                <>
                  <Link to="/signin">Sign in</Link>
                  <Link to="/signup">Sign up</Link>
                </>
              )}
            </nav>
            <AvatarDropdown isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
          </div>
        </header>

        <Routes>
          <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/" element={<Home recipes={recipes} />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/categories" element={<CategoryRecipesPage />} />
          <Route path="/choosen-category/:id" element={<ChoosenCategoryRecipes/>}/>
        </Routes>

        <footer className="footer">
          <p>&copy; 2025 Daws'Cook. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}


export default App;
