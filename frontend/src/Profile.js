import React, { useEffect, useState } from "react";
import "./App.css";

const Profile = () => {
    const [preview, setPreview] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        const savedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!savedToken) {
            window.location.replace("/signin");
            return;
        }

        setToken(savedToken);

        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/user/", {
                    headers: { 'Authorization': `Bearer ${savedToken}` },
                });

                if (res.status === 401) {
                    window.location.replace("/signin");
                    return;
                }

                const data = await res.json();
                if (data){
                    setUserData(data);
                }
                if (data.image) {
                    setPreview(`data:image/jpeg;base64,${data.image}`);
                }
                setIsAuthorized(true);
            } catch (error) {
                console.error("Błąd pobierania użytkownika:", error);
                window.location.replace("/signin");
            }
        };

        fetchUser();
    }, []);

    const updateImage = async (base64Image) => {
        try {
            const res = await fetch('http://localhost:8000/api/user/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ image_upload: base64Image }),
            });

            if (res.status === 401) {
                window.location.replace("/signin");
                return;
            }

            if (!res.ok) throw new Error("Błąd aktualizacji zdjęcia");
        } catch (error) {
            console.error(error);
            alert("Coś poszło nie tak...");
        }
    };

    const handleEdit = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result.split(",")[1];
            setPreview(reader.result);
            await updateImage(base64String);
            alert("Zdjęcie zaktualizowane!");
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = async () => {
        setPreview(null);
        await updateImage("");
        alert("Zdjęcie usunięte!");
    };
    const handleChangeEmail = () => {

    };

    if (!isAuthorized) {
        return null; 
    };

    return (
        <div className="main">
            <div className="settings">
                <p>Account Settings</p>
                <div className="general-settings">General</div>
                <div className="password-settings">Password</div>
                <div className="email-settings">Email</div>
                <div className="allergens-settings">Allergens</div>
                <div className="sign-out">Sign Out</div>
            </div>
    
            <div className="profile-container">
                <div className="profile-picture-text">
                    <h3>Profile Picture</h3>
                    <div className="profile-picture">
                        {preview ? (
                            <img src={preview} alt="Avatar" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder" />
                        )}
                    </div>
                    <div className="avatar-edit">
                        <label htmlFor="avatar-upload" className="edit-button">Edit</label>
                        <input id="avatar-upload" type="file" onChange={handleEdit} style={{ display: "none" }} />
                    </div>
                    <div className="avatar-remove">
                        <div onClick={handleRemove}>Remove</div>
                    </div>
                </div>
            </div>
    
            <div className="data">
                <div className="user-data">
                    <p><strong>Username</strong>{userData.username}<u>Edit</u></p>
                    <p><strong>Email</strong>{userData.email}<u>Edit</u></p>
                    <p><strong>Name</strong>{userData.first_name}<u>Edit</u></p>
                    <p><strong>Surname</strong>{userData.last_name}<u>Edit</u></p>
                    <p><strong>Age</strong>{userData.age}<u>Edit</u></p>
                    <p><strong>Pronouns</strong>{userData.pronouns}<u>Edit</u></p>
                    <button className="save-changes" onClick={handleChangeEmail}>Save Changes</button>
                    <button className="cancel-changes">Cancel</button>
                </div>
            </div>
        </div>
    );
    
};

export default Profile;
