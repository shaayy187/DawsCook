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
  const [newIngredient, setNewIngredient] = useState({name: "",amount: "",unit: "",note: ""});
  const NUTR_FIELDS = ["kcal","fat","saturates","carbs","sugars","fibre","protein","salt"];
  const emptyNutrition = {
  recipe: id,
  kcal: 0, fat: 0, saturates: 0, carbs: 0, sugars: 0, fibre: 0, protein: 0, salt: 0
  };
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [nutritionForm, setNutritionForm] = useState(emptyNutrition);
  const [showStepForm, setShowStepForm] = useState(false);
  const [newStep, setNewStep] = useState({
    recipe: id, step_number: 1, instruction: ""
  });
  const [userAllergies, setUserAllergies] = useState([]); 
  const [hasAlerted, setHasAlerted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [editCommentId, setEditCommentState] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [allAllergies, setAllAllergies] = useState([]);
  const [selectedAllergyId, setSelectedAllergyId] = useState("");
  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [pendingAllergyIds, setPendingAllergyIds] = useState([]);
  const [portionCalculator, calculatePortion] = useState(1);

  useEffect(() => {
    fetch("http://localhost:8000/api/allergies/")
      .then(r => r.json())
      .then(setAllAllergies)
      .catch(() => setAllAllergies([]));
  }, []);

  const currentAllergyIds = (recipe?.allergies || []).map(a => a.id);

  const patchRecipeAllergies = (newIds) => {
    const token = sessionStorage.getItem("access");
    return fetch(`http://localhost:8000/api/recipes/${id}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ allergy_ids: newIds })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update recipe allergies");
        return res.json();
      })
      .then(updated => {
        setRecipe(updated);
        return updated;
      })
      .catch(err => setError(err.message));
  };

  const openAllergyForm = () => {
    setPendingAllergyIds(currentAllergyIds);
    setSelectedAllergyId("");
    setShowAllergyForm(true);
  };

  const addPendingAllergy = () => {
    if (!selectedAllergyId) return;
    const idNum = Number(selectedAllergyId);
    setPendingAllergyIds(prev => Array.from(new Set([...prev, idNum])));
    setSelectedAllergyId("");
  };

  const removePendingAllergy = (idToRemove) => {
    setPendingAllergyIds(prev => prev.filter(id => id !== idToRemove));
  };

  const saveAllergies = () => {
    patchRecipeAllergies(pendingAllergyIds)
      .then(() => setShowAllergyForm(false))
      .catch(err => setError(err.message));
  };


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
      setCurrentUsername(data.username);
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

  const openNutritionModal = () => {
    if (recipe?.nutrition) {
      setNutritionForm({
        recipe: id,
        ...NUTR_FIELDS.reduce((acc, k) => {
          acc[k] = recipe.nutrition[k] ?? 0;
          return acc;
        }, {})
      });
    } else {
      setNutritionForm(emptyNutrition);
    }
    setShowNutritionForm(true);
  };

  const saveNutrition = async () => {
    const token = sessionStorage.getItem("access");
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      let res;
      if (recipe?.nutrition?.id) {
        res = await fetch(`http://localhost:8000/api/nutrition/${recipe.nutrition.id}/`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(nutritionForm),
        });
      } else {
        res = await fetch(`http://localhost:8000/api/nutrition/`, {
          method: "POST",
          headers,
          body: JSON.stringify(nutritionForm),
        });
      }
      if (!res.ok) throw new Error("Failed to save nutrition");
      const data = await res.json();
      setRecipe(prev => ({ ...prev, nutrition: data }));
      setShowNutritionForm(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteNutritionFromModal = async () => {
    if (!recipe?.nutrition?.id) return;
    if (!window.confirm("Delete this nutrition entry?")) return;

    const token = sessionStorage.getItem("access");
    try {
      const res = await fetch(`http://localhost:8000/api/nutrition/${recipe.nutrition.id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete nutrition");
      setRecipe(prev => ({ ...prev, nutrition: null }));
      setShowNutritionForm(false);
    } catch (e) {
      setError(e.message);
    }
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

  const deleteIngredient = async (id) => {
    const token = sessionStorage.getItem("access");
    const res = await fetch(`http://localhost:8000/api/ingredients/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete ingredient");
  };

  const handleDeleteIngredient = (ingId) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    deleteIngredient(ingId)
      .then(() => {
        setRecipe(prev => ({
          ...prev,
          ingredients: prev.ingredients.filter(i => i.id !== ingId)
        }));
      })
      .catch((err) => alert(err.message));
  };

  const handleAddIngredient = () => {
  createIngredient({ ...newIngredient, recipe: id })
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

  const handleSubmitComment = () => {
    if (!newCommentText.trim()) {
      return;
    }
    const token = sessionStorage.getItem("access");
    fetch("http://localhost:8000/api/comments/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipe: parseInt(id, 10),
        text: newCommentText.trim(),
        parent: null
      })
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/signin');
          }
          throw new Error("Failed to submit comment");
        }
        return res.json();
      })
      .then((createdComment) => {
        setRecipe(prev => ({
          ...prev,
          comments: [createdComment, ...prev.comments]
        }));
        setNewCommentText("");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  const saveEditComment = () => {
    const token = sessionStorage.getItem("access");
  fetch(`http://localhost:8000/api/comments/${editCommentId}/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: editMessage })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to update comment");
      }
      return res.json();
    })
    .then(updatedComment => {
      setRecipe(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c.id === updatedComment.id ? updatedComment : c
        )
      }));
      setEditCommentState(null);
      setEditMessage("");
    })
    .catch(err => {
      console.error(err);
      setError(err.message);
    });
  }

  const cancelEditing = () => {
    setEditCommentState(null);
  }

  const handleSaveDescription = () => {
    const token = sessionStorage.getItem("access");
    fetch(`http://localhost:8000/api/recipes/${id}/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ description: editedDescription })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update description.");
        return res.json();
      })
      .then(updatedRecipe => {
        setRecipe(updatedRecipe);
        setIsEditingDescription(false);
      })
      .catch(err => {
        console.error(err);
        setError("Update failed.");
      });
  };

  const scaleAmount = (amount, factor) => {
    const n = Number(amount);
    if (Number.isNaN(n)) return amount;
    const scaled = n * (Number(factor));
    const rounded = Math.round(scaled * 100) / 100;
    return rounded;
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
          {isEditingDescription ? (
            <>
              <textarea
                className="description-edit-area"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
              />
              <button onClick={handleSaveDescription}>Save</button>
              <button onClick={() => setIsEditingDescription(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p className="description">{recipe.description}</p>
              <button
                className="pushable-edit"
                onClick={() => {
                  setEditedDescription(recipe.description);
                  setIsEditingDescription(true);
                }}
              >
              <span className="shadow"></span>
              <span className="edge"></span>
              <span className="front">✎ Edit Description</span>
              </button>
            </>
          )}
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
              <input
                id="recipe-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-file-hidden"
              />
              <label htmlFor="recipe-image-input" className="pushable-xs pushable-xs--light btn-gap-xs">
                <span className="shadow-xs"></span>
                <span className="edge-xs"></span>
                <span className="front-xs">Choose file</span>
              </label>
              <button onClick={uploadImage} className="pushable-xs">
                <span className="shadow-xs"></span>
                <span className="edge-xs"></span>
                <span className="front-xs">Upload image</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <h3>Ingredients {isAdmin && (
            <button onClick={() => setShowIngredientForm(true)} className="ingredient-add-button">+</button>
          )}
          </h3>
          <div className="portion-input">
            <div className="portion-text">
              Portion amount: 
            </div>
            <input 
              type="number"
              min="0"
              value={portionCalculator}
              onChange={(e)=>calculatePortion(e.target.value)}
            >
            </input>
          </div>
          <ul className="ingredients-list">
            {recipe.ingredients?.length ? (
              recipe.ingredients.map((ing) => (
                <li key={ing.id} className="ing-item">
                  <div className="ing-row">
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-qty">
                      {(() => {
                        const scaled = scaleAmount(ing.amount, portionCalculator);
                        return scaled !== null ? `${scaled} ${ing.unit || ""}`.trim() : "—";
                      })()}
                    </span>
                    {isAdmin && (
                      <button
                        className="ing-remove"
                        onClick={() => handleDeleteIngredient(ing.id)}
                      >
                        −
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="ing-empty">No ingredients yet.</li>
            )}
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
              type="number"
              placeholder="Amount"
              value={newIngredient.amount}
              onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
            />
            <input
              type="text"
              placeholder="Unit"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            />
            <input
              type="text"
              placeholder="Note"
              value={newIngredient.note}
              onChange={(e) => setNewIngredient({ ...newIngredient, note: e.target.value })}
            />
            <button onClick={handleAddIngredient}>Save</button>
          </Modal>
        )}
        </div>
        <div className="column">
          <h3>
            Allergens {isAdmin && (
              <button onClick={openAllergyForm} className="allergy-add-button"></button>
            )}
          </h3>
          <ul>
            {recipe.allergies?.length ? (
              recipe.allergies.map(a => {
                const isUserAllergic = userAllergies.some(uA => uA.allergy === a.name);
                return <li key={a.id} className={isUserAllergic ? "allergy-warning" : ""}>{a.name}</li>;
              })
            ) : <li>None</li>}
          </ul>
          {isAdmin && showAllergyForm && (
            <Modal title="Edit Allergens" onClose={() => setShowAllergyForm(false)}>
              <div className="allergy-modal">
                <div className="allergy-row">
                  <select
                    className="allergy-select"
                    value={selectedAllergyId}
                    onChange={(e) => setSelectedAllergyId(e.target.value)}
                  >
                    <option value="">-- select allergy --</option>
                    {allAllergies
                      .filter(a => !pendingAllergyIds.includes(a.id))
                      .map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                  </select>
                  <button className="btn" onClick={addPendingAllergy}>Add</button>
                </div>

                {pendingAllergyIds.length > 0 && (
                  <ul className="allergy-list">
                    {pendingAllergyIds.map(idVal => {
                      const a = allAllergies.find(x => x.id === idVal);
                      if (!a) return null;
                      return (
                        <li key={idVal} className="allergy-list-item">
                          <div className="allergy-text">
                            {a.name}
                          </div>
                          <button className="btn btn-light" onClick={() => removePendingAllergy(idVal)}>−</button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="allergy-actions">
                  <button className="btn btn-primary" onClick={saveAllergies}>Save</button>
                  <button className="btn" onClick={() => setShowAllergyForm(false)}>Close</button>
                </div>
              </div>
            </Modal>
          )}
        </div>
        <div className="column">
          <h3>
            Nutrition {isAdmin && (
              <button onClick={openNutritionModal} className="nutrition-add-button"></button>
            )}
          </h3>
          {recipe.nutrition ? (
            <ul>
              <li>kcal {Math.round(recipe.nutrition.kcal * portionCalculator * 100)/100 ?? 0}</li>
              <li>fat {Math.round(recipe.nutrition.fat * portionCalculator * 100)/100 ?? 0}g</li>
              <li>saturates {Math.round(recipe.nutrition.saturates * portionCalculator * 100)/100 ?? 0}g</li>
              <li>carbs {Math.round(recipe.nutrition.carbs * portionCalculator * 100)/100 ?? 0}g</li>
              <li>sugars {Math.round(recipe.nutrition.sugars * portionCalculator * 100)/100 ?? 0}g</li>
              <li>fibre {Math.round(recipe.nutrition.fibre * portionCalculator * 100)/100 ?? 0}g</li>
              <li>protein {Math.round(recipe.nutrition.protein * portionCalculator * 100)/100 ?? 0}g</li>
              <li>salt {Math.round(recipe.nutrition.salt * portionCalculator * 100)/100 ?? 0}g</li>
            </ul>
          ) : (
            <p>No nutrition yet.</p>
          )}
          {showNutritionForm && (
            <Modal
              title={recipe.nutrition ? "Edit Nutrition" : "Add Nutrition"}
              onClose={() => setShowNutritionForm(false)}
            >
              {NUTR_FIELDS.map((field) => (
                <div key={field} className="nutrition-input-group">
                  <label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <input
                    id={field}
                    type="number"
                    min="0"
                    step="0.1"
                    value={nutritionForm[field]}
                    onChange={(e) =>
                      setNutritionForm(prev => ({
                        ...prev,
                        [field]: parseFloat(e.target.value || "0")
                      }))
                    }
                  />
                </div>
              ))}

              <div style={{gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                {recipe.nutrition && (
                  <button
                    onClick={deleteNutritionFromModal}
                    style={{ background: '#fdd', border: '1px solid #f99' }}
                  >
                    Delete
                  </button>
                )}
                <button onClick={saveNutrition}>Save</button>
                <button onClick={() => setShowNutritionForm(false)}>Cancel</button>
              </div>
            </Modal>
          )}
        </div>
        </div>
        <div className="steps-section">
          <h3>Directions {isAdmin && (
            <button onClick={() => setShowStepForm(true)} className="step-create-button"></button>
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
                 <div className="step-actions">
                  <input
                    id={`step-file-${step.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStepImageChange(e, step.id)}
                    className="input-file-hidden"
                  />
                  <label htmlFor={`step-file-${step.id}`} className="pushable-xs pushable-xs--light pushable-compact">
                    <span className="shadow-xs"></span>
                    <span className="edge-xs"></span>
                    <span className="front-xs">Choose file</span>
                  </label>

                  <button className="pushable-xs pushable-compact" onClick={() => uploadStepImage(step.id)}>
                    <span className="shadow-xs"></span>
                    <span className="edge-xs"></span>
                    <span className="front-xs">Set step photo</span>
                  </button>

                  <button className="pushable-xs pushable-xs--danger pushable-compact" onClick={() => handleDeleteStep(step.id)}>
                    <span className="shadow-xs"></span>
                    <span className="edge-xs"></span>
                    <span className="front-xs">Delete step</span>
                  </button>
                </div>
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
      <section className="comments-section">
        <h3>Comments ({recipe.comments?.length || 0})</h3>
        <div className="add-comment-box">
          <textarea
            rows={3}
            className="comment-input"
            placeholder="Add a comment…"
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
          />
          <button
            className="comment-submit"
            onClick={handleSubmitComment}
          >
            Submit
          </button>
        </div>
        <div className="comments-list">
          {recipe.comments && recipe.comments.length > 0 ? (
            [...recipe.comments]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(c => {
              const commenterName = c.username || "Unknown";
              const avatarLetter = commenterName.charAt(0).toUpperCase();
              const avatarData = c.avatar;
              return (
                <div key={c.id} className="single-comment">
                  <div className="comment-header">
                    {avatarData ? (
                      <img
                        className="comment-avatar-img"
                        src={`data:image/png;base64,${avatarData}`}
                        alt={`${commenterName}’s avatar`}
                      />
                    ) : (
                      <div className="comment-avatar-placeholder">
                        {avatarLetter}
                      </div>
                    )}
                    <strong className="comment-username">
                      {commenterName}
                    </strong>
                    <span className="comment-date">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    {c.username === currentUsername && editCommentId !== c.id && (
                      <button 
                        onClick={() => {
                          setEditCommentState(c.id);
                          setEditMessage(c.text);
                        }} 
                        className="comment-edit-button"
                      >
                        Edit
                      </button>
                    )}
                    {editCommentId === c.id ? (
                      <>
                      <button 
                        onClick={() => saveEditComment(editMessage)}
                        className="comment-save-button"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => cancelEditing()}
                        className="comment-cancel-button"
                      >
                        Cancel
                      </button>
                      </>
                    ) : (
                      <></>
                    )
                    }
                  </div>
                  {editCommentId === c.id ? (
                    <input 
                      type="text"
                      className="unstyled-edit"
                      value={editMessage}
                      onChange={e => setEditMessage(e.target.value)}
                      autoFocus
                    >
                    </input>
                  ):(
                    <p className="comment-text">{c.text}</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="no-comments">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecipeDetails;