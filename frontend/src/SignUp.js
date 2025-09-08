import { useState, useEffect, useRef } from "react";
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
  const GOOGLE_CLIENT_ID = "497818986084-afhl3t4g51cj805un5dmm5ugcn84abnk.apps.googleusercontent.com";

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  function loadGoogleScript() {
    if (window.__googleScriptLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client?hl=en";
      s.async = true;
      s.defer = true;
      s.onload = () => { window.__googleScriptLoaded = true; resolve(); };
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function GoogleSignUpButton() {
    const btnRef = useRef(null);

    useEffect(() => {
      let cancelled = false;
      loadGoogleScript().then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try {
              const r = await fetch("http://localhost:8000/api/auth/google/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: resp.credential }),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.detail || "Google auth failed");
              localStorage.setItem("access", data.access);
              localStorage.setItem("refresh", data.refresh);
              sessionStorage.setItem("access", data.access);
              sessionStorage.setItem("refresh", data.refresh);
              window.location.href = "/";
            } catch (e) {
              console.error(e);
              alert("Google sign-up failed.");
            }
          },
        });
        if (btnRef.current) {
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            text: "signup_with",
          });
        }
      });
      return () => { cancelled = true; };
    }, []);

    return <div ref={btnRef} />;
  }

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
      <div className="google-register-button">
        <div style={{ color: "#888" }}>or</div>
        <div className="google-button">
          <GoogleSignUpButton />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
