import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>Oopsie... this webpage doesn't exist.</p>
      <Link className="btn404" to="/">Go back to main page</Link>
    </div>
  );
}
