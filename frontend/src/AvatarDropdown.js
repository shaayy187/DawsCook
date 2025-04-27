import { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { useNavigate } from "react-router-dom";

function AvatarDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleLogout = () =>{
    sessionStorage.removeItem("token");
    closeDropdown();
    navigate("/");
  };

  return (
    <div className="avatar-dropdown" onBlur={closeDropdown} tabIndex="0">
      {(
        <div className="default-avatar" onClick={toggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#ccc"/>
          </svg>
        </div>
      )}

      {dropdownOpen && (
        <div className="dropdown-menu">
          <Link to="/profile" onClick={closeDropdown}>Profile</Link>
          <Link to="/settings" onClick={closeDropdown}>Settings</Link>
          <div onClick={handleLogout} className="dropdown-item">Log out</div>
        </div>
      )}
    </div>
  );
}

export default AvatarDropdown;
