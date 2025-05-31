import React, { useEffect, useState } from "react";
import "./App.css";

const PasswordSettings = ({ passwordData, setPasswordData, handlePasswordChange }) => (
    <div className="password-settings-animation">
            <h3>Change Password</h3>
            <div className="input-passwords">
                <div className="password-top">
                    <span className="gradient-input">
                        <input
                            type="password"
                            placeholder="Old Password"
                            value={passwordData.old_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                        />
                        <span></span>
                    </span>
                </div>
                <div className="password-bottom">
                    <span className="gradient-input">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        />
                        <span></span>
                    </span>
                    <span className="gradient-input">
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        />
                        <span></span>
                    </span>
                </div>
            </div>
            <button className="password-change-submit" onClick={handlePasswordChange}>Submit</button>
    </div>
);

const EmailSettings = ({ emailData, setEmailData, handleEmailChange, userData }) => (
    <div className="email-settings-box">
        <div className="email-settings-left">
            <h3 style={{textAlign: "center"}}>Current Email</h3>
            <div className="input-emails">
                    <span className="gradient-input-email">
                        <input
                            type="email"
                            placeholder={userData.email}
                            value={userData.email}
                            disabled
                        />
                        <span></span>
                    </span>
                </div>
        </div>
        <div className="email-settings-right">
            <h3 style={{ textAlign: "right" }}>Change Email</h3>
                <div className="input-emails">
                    <span className="gradient-input-email">
                        <input
                            type="email"
                            placeholder="New Email"
                            value={emailData.email}
                            onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <span></span>
                    </span>
                    <span className="gradient-input-email">
                        <input
                            type="email"
                            placeholder="Confirm email"
                            value={emailData.confirm_email}
                            onChange={(e) => setEmailData(prev => ({ ...prev, confirm_email: e.target.value }))}
                        />
                        <span></span>
                    </span>
                </div>
            <button onClick={handleEmailChange}>Submit</button>
        </div>
    </div>
);

const Profile = () => {
    const [preview, setPreview] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userData, setUserData] = useState({});
    const [editData, setEditData] = useState({});
    const [activeTab, setActiveTab] = useState('general');
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [emailData, setEmailData] = useState({ email: '', confirm_email: ''});
    const [showPasswordSettings, setShowPasswordSettings] = useState(false);
    const [showEmailSettings, setShowEmailSettings] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("access") || sessionStorage.getItem("access");

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
                    setEditData({});
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

    const handlePasswordChange = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch('http://localhost:8000/api/user/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: passwordData.old_password,
                    new_password: passwordData.new_password
                }),
            });

            if (!res.ok) throw new Error("Password update failed");

            alert("Password updated successfully.");
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error(error);
            alert("Failed to update password.");
        }
    };

    const handleEmailChange = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/user/change-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(emailData),
        });

        if (!res.ok) throw new Error("Email update failed");

        alert("Email updated successfully.");
        setEmailData({ email: '' , confirm_email: ''});
    } catch (error) {
        console.error(error);
        alert("Failed to update email.");
    }
    };

    if (!isAuthorized) return null;

    return (
        <div className="main">
            <div className="top-row">
                <div className="settings">
                    <p>Account Settings</p>
                    <div
                        className={`general-settings ${activeTab === "general" ? "active-tab" : ""}`}
                        onClick={() => {setActiveTab("general"); setShowPasswordSettings(''); setShowEmailSettings('')}}
                    >
                        General
                    </div>
                    <div
                        className={`password-settings ${showPasswordSettings ? "active-tab": ""}`}
                        onClick={() => setShowPasswordSettings(prev => !prev)}
                    >
                        Password
                    </div>
                    <div
                        className={`email-settings ${showEmailSettings ? "active-tab": ""}`}
                        onClick={() => setShowEmailSettings(prev => !prev)}
                    >
                        Email
                    </div>
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
                        {["username", "email", "first_name", "last_name", "age", "pronouns"].map((field, index) => (
                            <div className="user-data-row" key={index}>
                                <span className="user-data-label">{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                                <span className="user-data-value">{userData[field]}</span>
                                <input
                                    type="text"
                                    className="user-input-data"
                                    placeholder={`Enter new ${field.replace("_", " ")}`}
                                    value={editData[field] || ''}
                                    onChange={(e) => handleInputChange(e, field)}
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
            <div className="bottom-row" style={{ display: "flex", justifyContent: "space-between", gap: "2rem" }}>
                <div style={{ flex: 1 }}>
                        {showPasswordSettings && (
                                <PasswordSettings
                                    passwordData={passwordData}
                                    setPasswordData={setPasswordData}
                                    handlePasswordChange={handlePasswordChange}
                                />
                        )}
                </div>

                <div style={{ flex: 1 }}>
                        {showEmailSettings && (
                                <EmailSettings
                                    emailData={emailData}
                                    setEmailData={setEmailData}
                                    handleEmailChange={handleEmailChange}
                                    userData={userData}
                                />
                        )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
