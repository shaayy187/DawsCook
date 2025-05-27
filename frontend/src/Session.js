import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SessionChecker({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const refreshToken = async () => {
    const refresh = sessionStorage.getItem("refresh");
    if (!refresh) return false;

    const response = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("access", data.access);
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = sessionStorage.getItem("access");

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp;
          const now = Math.floor(Date.now() / 1000);

          if (expiry < now) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              sessionStorage.removeItem("access");
              sessionStorage.removeItem("refresh");
              setIsLoggedIn(false);
              navigate("/signin");
              alert("Session expired. Please log in again.");
            }
          } else {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          sessionStorage.removeItem("access");
          sessionStorage.removeItem("refresh");
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    const interval = setInterval(checkToken, 60 * 1000);
    checkToken();

    return () => clearInterval(interval);
  }, [navigate, setIsLoggedIn]);

  return null;
}

export default SessionChecker;
