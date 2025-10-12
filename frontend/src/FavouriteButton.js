import { useState, useEffect } from "react";

export default function FavoriteButton({ recipeId, initialIsFavorite, onChange }) {
  const [isFav, setIsFav] = useState(!!initialIsFavorite);
  const token = sessionStorage.getItem("access") || localStorage.getItem("access");
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  useEffect(() => {
    setIsFav(!!initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    let cancelled = false;

    const checkFavorite = async () => {
      if (!token) { 
        setIsFav(false); 
        return; 
      }

      try {
        const res = await fetch(`http://localhost:8000/api/favorites/${recipeId}/`, { headers });
        if (res.status === 200) { if (!cancelled) setIsFav(true);  return; }
        if (res.status === 404) { if (!cancelled) setIsFav(false); return; }
      } catch (e) {
        console.error(e);
        if (!cancelled) setIsFav(false);
      }
    };

    checkFavorite();
    return () => { cancelled = true; };
  }, [recipeId, token]);

  const toggle = async () => {
    if (!token) { alert("Please sign in to use favourites."); return; }
    try {
      if (isFav) {
        await fetch(`http://localhost:8000/api/favorites/${recipeId}/`, { method: "DELETE", headers });
        setIsFav(false);
        onChange?.(false);
      } else {
        await fetch(`http://localhost:8000/api/favorites/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ recipe: recipeId })
        });
        setIsFav(true);
        onChange?.(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={toggle}
      className="fav-button"
      aria-pressed={isFav}
      title={isFav ? "Remove from favourites" : "Add to favourites"}
    >
      {isFav ? "❤️" : "🤍"}
    </button>
  );
}
