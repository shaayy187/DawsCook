import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import './App.css';

async function fetchCurrentUser() {
  const token = localStorage.getItem('access') || sessionStorage.getItem('access');
  if (!token) {
    const error = new Error('No auth token');
    error.status = 401;
    throw error;
  }

  const res = await fetch('http://localhost:8000/api/user/', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  if (!res.ok) {
    throw new Error('Could not fetch current user.');
  }

  return res.json();
}

async function fetchCategories() {
  const res = await fetch('http://localhost:8000/api/category/');
  if (!res.ok) throw new Error('Error with fetching categories.');
  return res.json();
}

async function fetchAllergies() {
  const res = await fetch('http://localhost:8000/api/allergies/');
  if (!res.ok) throw new Error('Error with fetching allergens.');
  return res.json();
}

async function createRecipe(recipeData) {
  const token = localStorage.getItem('access') || sessionStorage.getItem('access');
  const res = await fetch('http://localhost:8000/api/recipes/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recipeData),
  });

  if (!res.ok) {
    const err = await res.json();
    const messages = [];
    for (const [field, errs] of Object.entries(err)) {
      if (Array.isArray(errs)) {
        errs.forEach((e) => messages.push(`${field}: ${e}`));
      } else {
        messages.push(`${field}: ${errs}`);
      }
    }
    throw new Error(messages.join(' | ') || 'Could not create a new recipe.');
  }

  return res.json();
}

export default function NewRecipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdminUser, setIsAdminUser] = useState(undefined);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        setIsAdminUser(Boolean(data.is_superuser));
      })
      .catch((_) => {
        setIsAdminUser(false);
      });
  }, []);

  useEffect(() => {
    if (isAdminUser === false) {
      navigate('/');
    }
  }, [isAdminUser, navigate]);

  const [form, setForm] = useState({
    recipe: '',
    difficulty: '',
    description: '',
    category_id: '',
    allergy_ids: [],
    image_upload: '',
  });

  const {
    data: categories = [],
    isLoading: catLoading,
    isError: catError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isAdminUser === true,
  });

  const {
    data: allergies = [],
    isLoading: algLoading,
    isError: algError,
  } = useQuery({
    queryKey: ['allergies'],
    queryFn: fetchAllergies,
    enabled: isAdminUser === true,
  });

  const { mutate, isLoading: isSaving, error: saveError } = useMutation({
    mutationFn: createRecipe,
    onSuccess: (newRecipe) => {
      queryClient.invalidateQueries(['recipes']);
      navigate(`/recipe/${newRecipe.id}`);
    },
  });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image_upload: reader.result.split(',')[1],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
  setValidationError('');

  if (!form.recipe.trim()) {
    setValidationError('Title cant be null.');
    return;
  }
  if (!form.difficulty.trim()) {
    setValidationError('Difficulty cant be null');
    return;
  }
  if (!form.category_id) {
    setValidationError('Category cant be null');
    return;
  }
  if (!form.description.trim()) {
    setValidationError('Description cant be null');
    return;
  }

  console.log("=== Payload do mutacji:", JSON.stringify(form, null, 2));
  mutate(form);
  };

  if (isAdminUser === undefined) {
    return <p className="loading">Checking permissions...</p>;
  }

  if (isAdminUser === false) {
    return null;
  }

  if (catLoading || algLoading) return <p className="loading">Loading data...</p>;
  if (catError || algError) return <p className="error">Error fetching data.</p>;

  return (
    <div className="new-recipe-page">
      <h1 className="page-title">Create New Recipe</h1>
      {saveError && <p className="error">Error: {saveError.message}</p>}
      {validationError && <p className="error">{validationError}</p>}
      <div className="cards-row">
        <div className="card">
          <h2 className="card-title">Basic Info</h2>
          <div className="card-content">
            <label>
              <span className="label-text">Title</span>
              <span className="gradient-border">
                <input
                  required
                  type="text"
                  value={form.recipe}
                  onChange={(e) => setForm((f) => ({ ...f, recipe: e.target.value }))}
                  placeholder="Enter recipe title"
                />
              </span>
            </label>
            <label>
              <span className="label-text">Difficulty</span>
              <span className="gradient-border">
                <input
                  required
                  type="text"
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                  placeholder="Easy / Medium / Hard"
                />
              </span>
            </label>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Category & Allergens</h2>
          <div className="card-content">
            <label>
              <span className="label-text">Category</span>
              <select
                required
                value={form.category_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_id: Number(e.target.value) }))
                }
              >
                <option value="">— select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label-text">Allergens (Ctrl+click)</span>
              <select
                multiple
                value={form.allergy_ids}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setForm((f) => ({ ...f, allergy_ids: opts }));
                }}
              >
                {allergies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Main Photo</h2>
          <div className="card-content">
            <span className="gradient-border">
              <input type="file" accept="image/*" onChange={handleImage} />
            </span>
            {form.image_upload && (
              <div className="preview-container">
                <img
                  src={`data:image/*;base64,${form.image_upload}`}
                  alt="preview"
                  className="image-preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="cards-row">
        <div className="card full-width">
          <h2 className="card-title">Description</h2>
          <div className="card-content">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Write a short description..."
            />
          </div>
        </div>
      </div>
      <div className="cards-row">
        <div className="card full-width align-center">
          <button
            type="button"
            className="submit-btn"
            onClick={() => handleSubmit(form)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
