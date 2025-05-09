import React, { useEffect, useState } from "react";
import "./App.css";
import { AnimatePresence, motion } from "framer-motion";

const Profile = () => {
    const [preview, setPreview] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userData, setUserData] = useState([]);
    const [activeTab, setActiveTab] = useState("general");

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
            window.location.replace("/profile");
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = async () => {
        setPreview(null);
        await updateImage("");
        alert("Zdjęcie usunięte!");
        window.location.replace("/profile");
    };
    const handleChangeEmail = () => {

    };

    if (!isAuthorized) {
        return null; 
    };

    const PasswordSettings = () => (
        <div className="password-settings-animation">
        <motion.div
          key="password"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
        <h3>Change Password</h3>
        <div className="input-passwords">
            <div className="password-top">
                    <span className="gradient-input">
                        <input type="password" placeholder="Old Password" />
                        <span></span>
                    </span>
            </div>
            <div className="password-bottom">
                <span className="gradient-input">
                    <input type="password" placeholder="New Password" />
                    <span></span>
                </span>
                <span className="gradient-input">
                    <input type="password" placeholder="Confirm new password" />
                <span></span>
                </span>
            </div>
        </div>
        <button>Submit</button>
        </motion.div>
        </div>
      );

    return (
        <div className="main">
            <div className="top-row">
            <div className="settings">
                <p>Account Settings</p>
                <div className="general-settings">General</div>
                <div className="password-settings" onClick={() => setActiveTab("password")}>Password</div>
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
                {[
                    { label: "Username", value: userData.username },
                    { label: "Email", value: userData.email },
                    { label: "Name", value: userData.first_name },
                    { label: "Surname", value: userData.last_name },
                    { label: "Age", value: userData.age },
                    { label: "Pronouns", value: userData.pronouns }
                ].map((field, index) => (
                    <div className="user-data-row" key={index}>
                        <span className="user-data-label">{field.label}</span>
                        <span className="user-data-value">{field.value}</span>
                        <u className="user-data-edit">Edit</u>
                    </div>
                ))}
                <div className="user-data-buttons">
                <button className="save-changes" onClick={handleChangeEmail}>Save Changes</button>
                <button className="cancel-changes">Cancel</button>
                </div>
                </div>
            </div>
            </div>
            <AnimatePresence mode="wait">
                {activeTab === "password" && <div className="bottom-row"><PasswordSettings /></div>}
            </AnimatePresence>
        </div>
    );
    
};

export default Profile;
