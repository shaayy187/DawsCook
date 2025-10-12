import { useEffect, useState, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access") || sessionStorage.getItem("access");

    if(!token){
      navigate("/");
    }
    
    fetch("http://localhost:8000/api/favorites/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(data => {
       const list = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.favorites)
          ? data.favorites
          : [];
        setFavourites(list);
    })
    .catch((e) => {
      console.error(e);
    });
  }, [navigate]);

  return (
    <div className="app">
        <h2>Favourites list</h2>
        <div className="line-before-featured-recipes"></div>
        {favourites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-card">
              <div className="empty-illustration">
                <svg viewBox="0 0 24 24" width="64" height="64" aria-hidden="true">
                  <path d="M12 21s-7.3-4.7-9.6-8.2C.8 10.3 1.3 7.4 3.4 5.8 5.9 3.7 9 4.5 12 7.6c3-3.1 6.1-3.9 8.6-1.8 2.1 1.6 2.6 4.5 1 7C19.3 16.3 12 21 12 21z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="empty-title">Add your first favourite recipe!</h3>
              <p className="empty-text">
                Add recipes you liked, so you have easier access!
              </p>
              <Link to="/categories" className="empty-btn">Watch recipes</Link>
            </div>
          </div>
        ) : (
        <div>
        <div className="favourites">
         {favourites.map((favourites) => (
              <Link
                to={`/recipe/${favourites.id}`}
                key={favourites.id}
                className="favourites-link"
              >
                  <img
                    src={`data:image/png;base64,${favourites.image}`}
                    alt={favourites.name}
                    className="favourites-image"
                  />
                  <h2>{favourites.recipe}</h2>
                  <h3>⭐{(favourites.rating).toFixed(1)}</h3>
              </Link>
            ))}
        </div>
        <div className="line-before-featured-recipes"></div>
        </div>
        )}
    </div>
  );
};

export default Favourites;
