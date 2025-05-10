import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

const RecipeDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    fetch(`http://localhost:8000/api/recipes/${id}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) navigate('/signin');
        throw new Error('An error occurred. Please try again.');
      }
      return response.json();
    })
    .then((data) => setRecipe(data))
    .catch((err) => setError(err.message));
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = () => {
    const token = sessionStorage.getItem("token");
    if (!selectedImage) {
      alert("Haven't choosen file.");
      return;
    }

    fetch(`http://localhost:8000/api/recipes/${id}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_upload: selectedImage
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się zaktualizować zdjęcia");
        return res.json();
      })
      .then((updatedRecipe) => {
        setRecipe(updatedRecipe);
        setSelectedImage(null);
      })
      .catch((err) => setError(err.message));
  };

  if (error){
    return <p>{error}</p>;
  }; 

  if (!recipe){
    return <p></p>;
  };

  return (
    <div className="details-container">
      <h2>{recipe.recipe}</h2>
      <p className="date">Added: {new Date(recipe.created).toLocaleDateString()}</p>

      <div className="top-section">
        <div className="top-left">
          {recipe.image && (
            <img
              className="recipe-photo"
              src={`data:image/png;base64,${recipe.image}`}
              alt={recipe.recipe}
            />
          )}
        </div>
        <div className="top-right">
          <p className="description">{recipe.description}</p>
          <div className="info-line">
            <span>⭐ {recipe.rating || 'No rating'}</span>
            <span> | </span>
            <span>{recipe.difficulty}</span>
            <span> | </span>
            <span>Time: {Math.round(recipe.cooking_time / 60) || 1}h</span>
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button onClick={uploadImage}>Wyślij zdjęcie</button>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients?.map((ing, i) => (
              <li key={i}>{ing.name} – {ing.quantity}</li>
            ))}
          </ul>
        </div>

        <div className="column">
          <h3>Allergens</h3>
          <ul>
            {recipe.allergies?.length > 0 ? (
              recipe.allergies.map((a, i) => <li key={i}>{a.name}</li>)
            ) : (
              <li>Brak</li>
            )}
          </ul>
        </div>

        <div className="column">
          <h3>Nutrition</h3>
          <ul>
            <li>kcal {recipe.kcal || 0}</li>
            <li>fat {recipe.fat || 0}g</li>
            <li>saturates {recipe.saturates || 0}g</li>
            <li>carbs {recipe.carbs || 0}g</li>
            <li>sugars {recipe.sugars || 0}g</li>
            <li>fibre {recipe.fibre || 0}g</li>
            <li>protein {recipe.protein || 0}g</li>
            <li>salt {recipe.salt || 0}g</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
