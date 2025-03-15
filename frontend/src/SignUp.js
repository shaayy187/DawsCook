import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Routes, Route, Link } from "react-router-dom";
import SignIn from './SignIn';
const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8000/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          sessionStorage.setItem("token", data.token);
          navigate("/");
        } else {
          setError("Error registering. Please try again.");
        }
      })
      .catch(() => setError("An error occurred. Please try again."));
  };

  return (
    <div className="signup-form">
       <h2>The secret ingredient is always <span>love</span> .</h2> 
    <div className="register-form">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <div className="username">Username</div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
         <div className="email">Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password">Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
         <div className="confirm-password">Confirm password</div>
        <input
          type="password"
          value={confirmpassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">SUBMIT</button>
      </form>
      </div>
      <div className="login-route">
        You do have an account? <Link to="/signin">Sign in now.</Link>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
        </Routes>
        </div>
    </div>
  );
};

export default SignUp;
