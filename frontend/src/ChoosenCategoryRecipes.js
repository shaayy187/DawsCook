import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './App.css';

const ChoosenCategoryRecipes = () => {
    const { id } = useParams();
    const [category, setCategory] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem('access') || sessionStorage.getItem('access');

    useEffect(() => {
        fetch(`http://localhost:8000/api/category/${id}/`)
            .then((res) => res.json())
            .then((data) => setCategory(data))
            .catch((error) => console.error("Error with fetching exact category", error));

        fetch(`http://localhost:8000/api/recipes/`)
            .then((res) => res.json())
            .then((data) => setRecipes(data.results))
            .catch((error) => console.error("Error with fetching recipes for exact category", error));

        if (token) {
            fetch(`http://localhost:8000/api/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => setIsAdmin(data.is_superuser))
                .catch(() => setIsAdmin(false));
        }
    }, [id, token]);

    const getRecipesForCategory = (categoryId) =>
        recipes.filter(r => r.category?.id === categoryId).slice(0, 4);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result.split(',')[1];
            setSelectedImage(base64Image);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = () => {
        if (!selectedImage) {
            alert("Please select an image first.");
            return;
        }

        fetch(`http://localhost:8000/api/category/admin/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: category.name,
                image_upload: selectedImage
            }),
        })
            .then(res => {
                if (res.ok) {
                    alert("Image updated successfully!");
                    window.location.reload();
                } else {
                    alert("Failed to update image.");
                }
            })
            .catch(err => console.error("Error updating image:", err));
    };

    return (
        <div className="choosen-category-container">
            <p className="choosen-category-name">
                <span className="decor">🍽</span> {category.name} <span className="decor">🍽</span>
            </p>
            {category.image && (
                <img
                    className="choosen-category-photo"
                    src={`data:image/png;base64,${category.image}`}
                    alt={category.name}
                />
            )}
            {isAdmin && (
                <div style={{ marginTop: "20px" }}>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <button onClick={handleImageUpload}>Update Image</button>
                </div>
            )}
            <div className="exact-category-recipe-grid">
                {getRecipesForCategory(category.id).map((recipe) => (
                    <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="exact-category-recipe-link">
                        <div className="exact-category-recipe-tile">
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