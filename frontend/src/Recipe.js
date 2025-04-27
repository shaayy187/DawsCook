import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RecipeDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate('/signin');
      return;
    }

    fetch(`http://localhost:8000/api/recipes/${id}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
        }
        throw new Error('Nie można załadować danych');
      }
      return response.json();
    })
    .then((data) => setRecipe(data))
    .catch((err) => setError(err.message));
  }, [id, navigate]);

  if (error) return <p>{error}</p>;
  if (!recipe) return <p>Ładowanie...</p>;

  return (
    <div className="recipe-details">
      <h2>{recipe.recipe}</h2>
      <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
      {recipe.allergies?.length > 0 && (
        <p><strong>Allergies:</strong> {recipe.allergies.map(a => a.name).join(', ')}</p>
      )}
    </div>
  );
};

export default RecipeDetails;
