import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import SignUp from './SignUp';
const SignIn = ({onLogin}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); 

    if(username===""){
      setError("Username can't be empty.");
      return;
    }

    if(password===""){
      setError("Password can't be empty.");
      return;
    }
    fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access) {
          sessionStorage.setItem("access", data.access);
          sessionStorage.setItem("refresh", data.refresh);
          onLogin();
          navigate("/");
          window.location.reload();
        } else {
          setError("Invalid credentials.");
        }
      })
      .catch(() => setError("An error occurred. Please try again."));
  };

  return (
    <div className="signin-form">
      <h2>The secret ingredient is always <span>love</span> .</h2> 
      <div className="login-form">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <div className="username">Username</div>
        <input
          type="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="pass">Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">SUBMIT</button>
      </form>
      </div>
      <div className="register-route">
        You don't have account? <Link to="/signup">Sign up now.</Link>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        </div>
    </div>
  );
};

export default SignIn;
