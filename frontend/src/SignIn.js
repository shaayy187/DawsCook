import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import SignUp from './SignUp';

const SignIn = ({onLogin}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = "497818986084-afhl3t4g51cj805un5dmm5ugcn84abnk.apps.googleusercontent.com";


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

  function GoogleSignInButton() {
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
              alert("Google sign-in failed.");
            }
          },
        });
        if (btnRef.current) {
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            locale: "pl",
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

    if(username===""){
      setError("Please fill in the username.");
      return;
    }

    if(password===""){
      setError("Please fill in the password.");
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
          setError(data.error || "Invalid credentials.");
        }
      })
      .catch(err => {
        console.error("Error while loggin in: ", err);
        setError(err);
      });
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
      <div className="google-register-button">
        <div style={{ color: "#888" }}>or</div>
        <div className="google-button">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
