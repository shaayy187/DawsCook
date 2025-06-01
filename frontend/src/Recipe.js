import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';
import Modal from './Window';

const RecipeDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stepImages, setStepImages] = useState({});
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" });
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [newNutrition, setNewNutrition] = useState({
    recipe: id,
    kcal: 0, fat: 0, saturates: 0, carbs: 0, sugars: 0,
    fibre: 0, protein: 0, salt: 0
  });
  const [showStepForm, setShowStepForm] = useState(false);
  const [newStep, setNewStep] = useState({
    recipe: id, step_number: 1, instruction: ""
  });
  const [userAllergies, setUserAllergies] = useState([]); 
  const [hasAlerted, setHasAlerted] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("access");

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
    .then((data) => {
      setRecipe(data);
      setUserRating(data.my_rating || 0);
    })
    .catch((err) => setError(err.message));
  }, [id, navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("access");

    fetch("http://localhost:8000/api/user/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setIsAdmin(data.is_superuser);
      setUserAllergies(data.user_allergy_info || []);
    })
    .catch(() => {
      setIsAdmin(false);
      setUserAllergies([]);
    });
  }, []);

  useEffect(() => {
    if (!recipe || userAllergies.length === 0) return;
    if (hasAlerted) return;

    const recipeAllergyNames = (recipe.allergies || []).map(a => a.name);
    const userAllergyNames   = userAllergies.map(u => u.allergy);
    const commonNames = recipeAllergyNames.filter(name => userAllergyNames.includes(name));

    if (commonNames.length > 0) {
      alert(
        "Attention! Recipe contains allergens which can affect you: " +
        commonNames.join(", ")
      );
      setHasAlerted(true);
    }
  }, [recipe, userAllergies, hasAlerted]);


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
    const token = sessionStorage.getItem("access");
    if (!selectedImage) {
      alert("No file selected.");
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
        if (!res.ok) throw new Error("Couldn't upload the image.");
        return res.json();
      })
      .then((updatedRecipe) => {
        setRecipe(updatedRecipe);
        setSelectedImage(null);
      })
      .catch((err) => setError(err.message));
  };

  const handleStepImageChange = (e, stepId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStepImages(prev => ({
          ...prev,
          [stepId]: reader.result.split(',')[1]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadStepImage = (stepId) => {
    const token = sessionStorage.getItem("access");
    const image = stepImages[stepId];

    if (!image) {
      alert("No image selected for this step.");
      return;
    }

    fetch(`http://localhost:8000/api/steps/${stepId}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_upload: image }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to upload step image.");
        return res.json();
      })
      .then((updatedStep) => {
        setRecipe(prev => ({
          ...prev,
          steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
        }));
        setStepImages(prev => ({ ...prev, [stepId]: null }));
      })
      .catch(err => setError(err.message));
  };

  const createIngredient = async (ingredient) => {
  const token = sessionStorage.getItem("access");
  const res = await fetch(`http://localhost:8000/api/ingredients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ingredient),
  });
  if (!res.ok) throw new Error("Failed to create ingredient");
  return res.json();
  };

  const handleAddIngredient = () => {
  createIngredient({ ...newIngredient, recipe: id })
    .then(() => window.location.reload())
    .catch((err) => alert(err.message));
  };  

  const createNutrition = async (nutrition) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/nutrition/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nutrition),
    });
    if (!res.ok) throw new Error("Failed to create nutrition");
    return res.json();
  };
  
  const handleAddNutrition = () => {
  createNutrition({ ...newNutrition, recipe: id })
    .then(() => window.location.reload())
    .catch((err) => alert(err.message));
  };

  const createStep = async (step) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/steps/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(step),
    });
    if (!res.ok) throw new Error("Failed to create step");
    return res.json();
  };

  const handleAddStep = () => {
  createStep({ ...newStep, recipe: id })
    .then(() => window.location.reload())
    .catch((err) => alert(err.message));
  };

  const deleteIngredient = async (id) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/ingredients/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete ingredient");
  };

  const handleDeleteIngredient = (ingId) => {
  if (window.confirm("Are you sure you want to delete this ingredient?")) {
    deleteIngredient(ingId)
      .then(() => window.location.reload())
      .catch((err) => alert(err.message));
  }
  };

  const deleteStep = async (id) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/steps/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete step");
  };

  const handleDeleteStep = (stepId) => {
  if (window.confirm("Are you sure you want to delete this step?")) {
    deleteStep(stepId)
      .then(() => window.location.reload())
      .catch((err) => alert(err.message));
  }
  };

  const deleteNutrition = async (id) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/nutrition/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete nutrition");
  };

  const handleDeleteNutrition = (nutritionId) => {
  if (window.confirm("Are you sure you want to delete nutrition?")) {
    deleteNutrition(nutritionId)
      .then(() => window.location.reload())
      .catch((err) => alert(err.message));
  }
  };

  const submitRating = (ratingValue) => {
    const token = sessionStorage.getItem("access");
        fetch(`http://localhost:8000/api/recipes/${id}/rate/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recipe: id, value: ratingValue })
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/signin');
          }
          throw new Error("Failed to submit rating");
        }
        return res.json();
      })
      .then((updatedRecipe) => {
        setRecipe(updatedRecipe);
        setUserRating(updatedRecipe.my_rating || 0);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  if (error){
    return <p>{error}</p>;
  } 

  if (!recipe){
    return <p>Loading...</p>;
  }

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
            <span>Time: {Math.round((recipe.cooking_time || 0) / 60) || 1}h</span>
          </div>
          <div className="user-rating-container">
            <p>Rate this recipe:</p>
            <div className="stars-wrapper">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="star"
                  onClick={() => submitRating(star)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '24px',
                    color: star <= userRating ? '#FFD700' : '#CCC'
                  }}
                >
                  {star <= userRating ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>
          {isAdmin && (
            <>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <button onClick={uploadImage}>Wyślij zdjęcie</button>
            </>
          )}
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <h3>Ingredients {isAdmin && (
            <button onClick={() => setShowIngredientForm(true)}>+</button>
          )}
          </h3>
          <ul>
            {recipe.ingredients?.map((ing, i) => (
              <li key={i}>
                {ing.name} – {ing.quantity}
                {isAdmin && (
                  <button onClick={() => handleDeleteIngredient(ing.id)}>−</button>
                )}
              </li>
            ))}
          </ul>
         {showIngredientForm && (
          <Modal title="Add Ingredient" onClose={() => setShowIngredientForm(false)}>
            <input
              type="text"
              placeholder="Name"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Quantity"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
            />
            <button onClick={handleAddIngredient}>Save</button>
          </Modal>
        )}
        </div>
        <div className="column">
          <h3>Allergens</h3>
          <ul>
            {recipe.allergies?.length > 0 ? (
              recipe.allergies.map((a, i) => {
                const isUserAllergic = userAllergies.some(uA => uA.allergy === a.name);
                return (
                  <li
                    key={i}
                    className={isUserAllergic ? "allergy-warning" : ""}
                  >
                    {a.name}
                  </li>
                );
              })
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
        <div className="column">
          <h3>Nutrition {isAdmin && (
            <button onClick={() => setShowNutritionForm(true)}>+</button>
          )}
          </h3>
          <ul>
            <li>kcal {recipe.nutrition?.kcal || 0}</li>
            <li>fat {recipe.nutrition?.fat || 0}g</li>
            <li>saturates {recipe.nutrition?.saturates || 0}g</li>
            <li>carbs {recipe.nutrition?.carbs || 0}g</li>
            <li>sugars {recipe.nutrition?.sugars || 0}g</li>
            <li>fibre {recipe.nutrition?.fibre || 0}g</li>
            <li>protein {recipe.nutrition?.protein || 0}g</li>
            <li>salt {recipe.nutrition?.salt || 0}g</li>
          </ul>
          {isAdmin && recipe.nutrition && (
            <button onClick={() => handleDeleteNutrition(recipe.nutrition.id)}>Delete Nutrition</button>
          )}
          {showNutritionForm && (
            <Modal title="Add Nutrition" onClose={() => setShowNutritionForm(false)}>
             {Object.keys(newNutrition)
                .filter(k => k !== "recipe")
                .map((field) => (
                  <div key={field} className="nutrition-input-group">
                    <label htmlFor={field}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </label>
                    <input
                      id={field}
                      type="number"
                      min="0"
                      step="0.1"
                      value={newNutrition[field]}
                      onChange={(e) =>
                        setNewNutrition({
                          ...newNutrition,
                          [field]: parseFloat(e.target.value) || 0
                        })
                      }
                    />
                  </div>
              ))}
              <button onClick={handleAddNutrition}>Save</button>
            </Modal>
          )}
          </div>
        </div>
        <div className="steps-section">
          <h3>Directions {isAdmin && (
            <button onClick={() => setShowStepForm(true)}>+</button>
          )}
          </h3>
          {recipe.steps.map((step) => (
            <div key={step.id}>
              <p><strong>Step {step.step_number}</strong></p>
              <p>{step.instruction}</p>
              {step.image && (
                <img src={`data:image/jpeg;base64,${step.image}`} alt={`Step ${step.step_number}`} />
              )}
              {isAdmin && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStepImageChange(e, step.id)}
                  />
                  <button onClick={() => uploadStepImage(step.id)}>Set step photo</button>
                  <button onClick={() => handleDeleteStep(step.id)}>−</button>
                </>
              )}
            </div>
          ))}
          {showStepForm && (
            <Modal title="Add Step" onClose={() => setShowStepForm(false)}>
              <input
                type="number"
                placeholder="Step Number"
                value={newStep.step_number}
                onChange={(e) => setNewStep({ ...newStep, step_number: e.target.value })}
              />
              <textarea
                placeholder="Instruction"
                value={newStep.instruction}
                onChange={(e) => setNewStep({ ...newStep, instruction: e.target.value })}
              />
              <button onClick={handleAddStep}>Save</button>
            </Modal>
          )}
        </div>
    </div>
  );
};

export default RecipeDetails;