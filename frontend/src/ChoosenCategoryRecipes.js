import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,  Link } from 'react-router-dom';
import './App.css';

const ChoosenCategoryRecipes = () => {
    const { id } = useParams();
    const [category, setCategory] = useState([]);
    const [recipes, setRecipes] = useState([]);

    useEffect(()=>{
        fetch(`http://localhost:8000/api/category/${id}/`)
        .then((res) => res.json())
        .then((data) => setCategory(data))
        .catch((error) => console.error("Error with fetching exact category", error));

        fetch(`http://localhost:8000/api/recipes/`)
        .then((res)=> res.json())
        .then((data)=>setRecipes(data.recipes))
        .catch((error => console.error("Error witch fetching recipes for exact category",error)));
    },[id]);

    const getRecipesForCategory = (categoryId) => {
        return recipes
            .filter((r) => r.category === categoryId || r.category?.id === categoryId).slice(0, 4);
    };

    return(
    <div className="choosen-category-container">
        <p className="choosen-category-name">
            <span className="decor">🍽</span> {category.name} <span className="decor">🍽</span>
        </p>
        {category.image && (
            <img
            className="choosen-category-photo"
            src={`data:image/png;base64,${category.image}`}
            alt={category.category}
            />
        )}

        <div className="exact-category-recipe-grid">
            {getRecipesForCategory(category.id).map((recipe) => (
            <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="exact-category-recipe-link">
            <div key={recipe.id} className="exact-category-recipe-tile">
                <img
                src={`data:image/png;base64,${recipe.image}`}
                alt={recipe.recipe}
                className="exact-category-recipe-image"
                />
                <p className="recipe-name">{recipe.recipe}</p>
                <div className="stars">
                {'⭐'.repeat(Math.round(recipe.rating || 0))} ({recipe.rating || 0})
                </div>
            </div>
            </Link>
            ))}
        </div>
    </div>
    );
};
export default ChoosenCategoryRecipes;