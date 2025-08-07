import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import NewRecipe from './NewRecipe'
import Footer from './Footer';

const queryClient = new QueryClient();

function App() {
  const [recipes, setRecipes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    fetch("http://localhost:8000/api/user/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setIsAdmin(data.is_superuser);
    })
    .catch(() => setIsAdmin(false));

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    fetch("http://localhost:8000/api/recipes/") 
    .then(response => response.json())
    .then(data => setRecipes(data.results))
    .catch(error => console.error("Error:", error));

    if (token) {
      setIsLoggedIn(true);
    }

    return () => {
      document.head.removeChild(link); 
    };
  }, []);

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
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <SessionChecker setIsLoggedIn={setIsLoggedIn} />
      <div className="app">
        <header className="header">
          <img src={logo} alt="Logo" className="logo" />
          <div id="home">
            <Link to="/">Daws'Cook</Link>
          </div>
          <div className="navigation-container"> 
            <nav>
              {isAdmin &&(
                <>
                <Link to="/create-recipe">Create recipe</Link>
                </>
              )}
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
          <Route path="/create-recipe" element={<NewRecipe/>}/>
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/" element={<Home recipes={recipes} />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/categories" element={<CategoryRecipesPage />} />
          <Route path="/choosen-category/:id" element={<ChoosenCategoryRecipes/>}/>
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
    </QueryClientProvider>
  );
}


export default App;
