import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetails = () => {
  const { id } = useParams(); 
  const [recipe, setRecipe] = useState(null);
  useEffect(() => {
    fetch(`http://localhost:8000/api/recipes/${id}/`) 
      .then((response) => {
        if (!response.ok) {
          throw new Error('Nie można załadować danych');
        }
        return response.json();
      })
      .then((data) => setRecipe(data))
  }, [id]);

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
