import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './App.css';
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          sessionStorage.setItem("token", data.token);
          navigate("/");
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
        <h4>Username</h4>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <h4>Password</h4>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      </div>
    </div>
  );
};

export default SignIn;
