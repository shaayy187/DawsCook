import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function AvatarDropdown({ isLoggedIn, handleLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [userImage, setUserImage] = useState(null);

  const toggleDropdown = () => {
    if (!isLoggedIn) {
      navigate("/signin");
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserImage();
    }
  }, [isLoggedIn]);

  const fetchUserImage = async () => {
    try {
      const token = localStorage.getItem("access") || sessionStorage.getItem("access");
      if (!token) {
        console.error("No token - user not logged in.");
        return;
      }
  
      const response = await fetch("http://localhost:8000/api/user/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        console.error(`Błąd odpowiedzi: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          console.error("No authorization - user not logged in.");
        }
        return;
      }
  
      const data = await response.json();
      if (data.image) {
        setUserImage(`data:image/jpeg;base64,${data.image}`);
      } else {
        setUserImage(null);
      }
    } catch (error) {
      console.error("Couldn't load the profile picture.", error);
    }
  };
  

  return (
    <div className="avatar-dropdown" tabIndex="0">
      <div className="default-avatar" onClick={toggleDropdown}>
        {userImage ? (
          <img src={userImage} alt="User Avatar" className="user-avatar-img" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
            <path
              d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
              fill="#ccc"
            />
          </svg>
        )}
      </div>

      {isLoggedIn && dropdownOpen && (
        <div className="dropdown-menu">
          <Link to="/profile" onClick={closeDropdown}>Profile</Link>
          <Link to="/settings" onClick={closeDropdown}>Settings</Link>
          <div onClick={() => { handleLogout(); closeDropdown(); }} className="dropdown-item">
            Log out
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarDropdown;
