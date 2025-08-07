import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SignIn from './SignIn';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successmessage, setSuccessMessage] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const handleSubmit = (e) => {
  e.preventDefault();
  setError(""); 
  setSuccessMessage("");

  if (!validateEmail(email)) {
    setError("Invalid email address.");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters long.");
    return;
  }

  if (password !== confirmpassword) {
    setError("Passwords do not match.");
    return;
  }

  if (!privacyAccepted) {
    setError("You must accept the privacy policy.");
    return;
  }

  fetch("http://localhost:8000/api/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setError("");
        setSuccessMessage(data.message);
      } else {
        setError(data.error || "Error registering. Please try again.");
      }
    })
    .catch(err => {
        console.error("Error while loggin in: ", err);
        setError(err);
      });
};


  return (
    <div className="signup-form">
       <h2>The secret ingredient is always <span>love</span> .</h2> 
    <div className="register-form">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {successmessage && <div className="success">{successmessage}</div>}
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
            className="confirm-password"
            value={confirmpassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        <div id="privacy">
          <input
            type="checkbox"
            id="privacyPolicy"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
          />
          <label htmlFor="privacyPolicy" className="privacyPolicy">
            Accept our {' '}
            <a href="https://www.w3schools.com" target="_blank" rel="noopener noreferrer">
              privacy policy.                  
            </a>
          </label>
        </div>
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
