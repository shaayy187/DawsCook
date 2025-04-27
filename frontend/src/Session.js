import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SessionChecker({ setIsLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        if (expiry < now) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setIsLoggedIn(false);
          navigate("/signin"); 
          window.location.reload();
          alert(" Session has expired, please log in.");
        } else {
          setIsLoggedIn(true);
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
