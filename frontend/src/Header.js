import { Link } from "react-router-dom";
import logo from "../logo.png";

const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h3>Daws'Cook</h3>
      <nav>
        <Link to="/signin">Login</Link>
        <Link to="/signup">Register</Link>
      </nav>
    </header>
  );
};

export default Header;
