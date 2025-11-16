import React, { useEffect, useState } from "react";
import "./App.css";
import AllergensSettings from "./Allergens";
import { useNavigate } from "react-router-dom";

const PasswordSettings = ({ passwordData, setPasswordData, handlePasswordChange }) => (
  <div className="settings-panel">
    <div className="panel-header">
      <h3>Change Password</h3>
      <p>Set a strong, unique password to keep your account safe.</p>
    </div>

    <div className="panel-body form-grid">
      <label className="field">
        <span className="field-label">Old password</span>
        <input
          className="text-input"
          type="password"
          placeholder="Enter old password"
          value={passwordData.old_password}
          onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
        />
      </label>

      <label className="field">
        <span className="field-label">New password</span>
        <input
          className="text-input"
          type="password"
          placeholder="Enter new password"
          value={passwordData.new_password}
          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
        />
      </label>

      <label className="field">
        <span className="field-label">Confirm new password</span>
        <input
          className="text-input"
          type="password"
          placeholder="Confirm new password"
          value={passwordData.confirm_password}
          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
        />
      </label>
    </div>

    <div className="panel-actions">
      <button className="btn-primary" onClick={handlePasswordChange}>Save password</button>
      <button className="btn-ghost" onClick={() => setPasswordData({ old_password:'', new_password:'', confirm_password:'' })}>Clear</button>
    </div>
  </div>
);

const EmailSettings = ({ emailData, setEmailData, handleEmailChange, userData }) => (
  <div className="settings-panel">
    <div className="panel-header">
      <h3>Email</h3>
      <p>View your current email and update it if needed.</p>
    </div>

    <div className="panel-body email-grid">
      <div className="email-card">
        <h4>Current Email</h4>
        <input className="text-input" type="email" value={userData.email || ''} disabled />
      </div>

      <div className="email-card">
        <h4>Change Email</h4>
        <label className="field">
          <span className="field-label">New email</span>
          <input
            className="text-input"
            type="email"
            placeholder="Enter new email"
            value={emailData.email}
            onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
          />
        </label>

        <label className="field">
          <span className="field-label">Confirm new email</span>
          <input
            className="text-input"
            type="email"
            placeholder="Confirm new email"
            value={emailData.confirm_email}
            onChange={(e) => setEmailData(prev => ({ ...prev, confirm_email: e.target.value }))}
          />
        </label>
      </div>
    </div>

    <div className="panel-actions">
      <button className="btn-primary" onClick={handleEmailChange}>Save email</button>
      <button className="btn-ghost" onClick={() => setEmailData({ email:'', confirm_email:'' })}>Clear</button>
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
  const [userAllergyInfo, setUserAllergyInfo] = useState([]);
  const navigate = useNavigate();

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
        if (data.avatar) {
          setPreview(`data:image/jpeg;base64,${data.avatar}`);
        }
        setIsAuthorized(true);

        const resExtra = await fetch("http://localhost:8000/api/user_allergies/", {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (resExtra.status === 200) {
          const extraData = await resExtra.json();
          setUserAllergyInfo(extraData);
        } else {
          setUserAllergyInfo([]);
        }
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

  const handleLogout = () => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthorized(false);
    navigate("/signin");
    window.location.reload();
  };

  if (!isAuthorized) return null;

  const renderRightPanel = () => {
    if (activeTab === 'password') {
      return (
        <PasswordSettings
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          handlePasswordChange={handlePasswordChange}
        />
      );
    }
    if (activeTab === 'email') {
      return (
        <EmailSettings
          emailData={emailData}
          setEmailData={setEmailData}
          handleEmailChange={handleEmailChange}
          userData={userData}
        />
      );
    }
    if (activeTab === 'allergens') {
      return (
        <div className="settings-panel">
          <div className="panel-header">
            <h3>My Allergies & Details</h3>
            <p>Track allergens that affect you and how to respond.</p>
          </div>
          <div className="panel-body">
            <AllergensSettings
              userAllergyInfo={userAllergyInfo}
              setUserAllergyInfo={setUserAllergyInfo}
              token={token}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="data">
        <div className="user-data">
          {["username", "email", "first_name", "last_name", "age", "pronouns"].map((field, index) => (
            <div className="user-data-row" key={index}>
              <span className="user-data-label">
                {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
              </span>
              <span className="user-data-value">{userData[field]}</span>
              <input
                type="text"
                className="user-input-data"
                placeholder={`Enter new ${field.replace("_", " ")}`}
                value={editData[field] || ""}
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
    );
  };

  return (
    <div className="main">
      <div className="left-column">
        <div className="settings">
          <p>Account Settings</p>

          <div
            className={`general-settings ${activeTab === "general" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </div>

          <div
            className={`password-settings ${activeTab === "password" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            Password
          </div>

          <div
            className={`email-settings ${activeTab === "email" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            Email
          </div>

          <div
            className={`allergens-settings ${activeTab === "allergens" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("allergens")}
          >
            Allergens
          </div>

          <div className="sign-out" onClick={handleLogout}>
            Sign Out
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="right-grid">
          <div className="profile-picture-text">
            <h3>Profile Picture</h3>

            <div className="profile-picture">
              {preview ? (
                <img src={preview} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder" />
              )}
            </div>

            <div className="avatar-actions">
              <label htmlFor="avatar-upload" className="edit-button">Edit</label>
              <input id="avatar-upload" type="file" onChange={handleEdit} style={{ display: "none" }} />
              <button className="remove-button" onClick={handleRemove}>Remove</button>
            </div>
          </div>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
