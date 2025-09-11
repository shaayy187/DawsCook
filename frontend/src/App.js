import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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
import NotFound from "./NotFound";

const queryClient = new QueryClient();

function AppShell() {
  const [recipes, setRecipes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("access") || sessionStorage.getItem("access");
  const location = useLocation();
  const is404 = location.pathname === "/404";

  useEffect(() => {
    fetch("http://localhost:8000/api/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.is_superuser))
      .catch(() => setIsAdmin(false));

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    fetch("http://localhost:8000/api/recipes/")
      .then(r => r.json())
      .then(d => setRecipes(d.results))
      .catch(console.error);

    if (token) setIsLoggedIn(true);
    return () => document.head.removeChild(link);
  }, [token]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.reload();
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      {!is404 && (
        <header className="header">
          <img src={logo} alt="Logo" className="logo" />
          <div id="home"><Link to="/">Daws'Cook</Link></div>
          <div className="navigation-container">
            <nav>
              {isAdmin && <Link to="/create-recipe">Create recipe</Link>}
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
      )}

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
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {!is404 && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionChecker setIsLoggedIn={() => {}} />
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
