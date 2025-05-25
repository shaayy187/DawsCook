import React, { useEffect, useState } from "react";
import "./App.css";
import { AnimatePresence, motion } from "framer-motion";

const Profile = () => {
    const [preview, setPreview] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userData, setUserData] = useState({});
    const [editData, setEditData] = useState({});
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
                if (data) {
                    setUserData(data);
                    setEditData({}); // Leave input fields empty
                }
                if (data.image) {
                    setPreview(`data:image/jpeg;base64,${data.image}`);
                }
                setIsAuthorized(true);
            } catch (error) {
                console.error("Fetch user error.", error);
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

            if (!res.ok) throw new Error("Update photo error.");
        } catch (error) {
            console.error(error);
            alert("Fatal error.");
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
            alert("Photo updated.");
            window.location.replace("/profile");
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = async () => {
        setPreview(null);
        await updateImage("");
        alert("Photo removed.");
        window.location.replace("/profile");
    };

    const handleInputChange = (e, field) => {
        setEditData({ ...editData, [field]: e.target.value });
    };

    const handleSaveChanges = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/user/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editData),
            });

            if (!res.ok) throw new Error("Update error");

            alert("User data updated successfully.");
            window.location.reload();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update user data.");
        }
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
        <button type="submit">Submit</button>
        </motion.div>
        </div>
      );

    if (!isAuthorized) return null;

    return (
        <div className="main">
            <div className="top-row">
            <div className="settings">
                <p>Account Settings</p>
                <div className="general-settings">General</div>
                <div
                    className={`password-settings ${activeTab === "password" ? "active-tab" : ""}`}
                    onClick={() => setActiveTab("password")}>
                    Password
                </div>
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
                    { label: "Username", field: "username" },
                    { label: "Email", field: "email" },
                    { label: "Name", field: "first_name" },
                    { label: "Surname", field: "last_name" },
                    { label: "Age", field: "age" },
                    { label: "Pronouns", field: "pronouns" }
                ].map((field, index) => (
                    <div className="user-data-row" key={index}>
                        <span className="user-data-label">{field.label}</span>
                        <span className="user-data-value">{userData[field.field]}</span>
                        <input
                            type="text"
                            className="user-input-data"
                            placeholder={`Enter new ${field.label.toLowerCase()}`}
                            value={editData[field.field] || ''}
                            onChange={(e) => handleInputChange(e, field.field)}
                        />
                    </div>
                ))}
                <div className="user-data-buttons">
                    <button className="save-changes" onClick={handleSaveChanges}>Save Changes</button>
                    <button className="cancel-changes" onClick={() => setEditData({})}>Cancel</button>
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
