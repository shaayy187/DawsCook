import "./App.css";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Modal from "./Window";

function AIBubble({ showLlamaForm, setShowLlamaForm }) {
  const [mood, setMood] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAccess = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access") || "";
  const getRefresh = () =>
    localStorage.getItem("refresh") || sessionStorage.getItem("refresh") || "";

  const refreshAccess = useCallback(async () => {
    const refresh = getRefresh();
    if (!refresh) return null;
    try {
      const res = await fetch("http://localhost:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return null;
      const { access } = await res.json();
      if (access) localStorage.setItem("access", access);
      return access || null;
    } catch {
      return null;
    }
  }, []);

  const callSuggest = useCallback(async (token, q) => {
    return fetch(
      `http://localhost:8000/api/recipes/suggest/llama/?mood=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );
  }, []);

  const search = useCallback(async () => {
    const q = mood.trim();
    if (!q) return;

    const token = getAccess();
    if (!token) {
      setError("Please login to use this function.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      let r = await callSuggest(token, q);
      if (r.status === 401) {
        const nt = await refreshAccess();
        if (!nt) {
          setError("Session expired. Please log in again.");
          setLoading(false);
          return;
        }
        r = await callSuggest(nt, q);
      }
      if (!r.ok) {
        setError("Server error. Try again.");
        setLoading(false);
        return;
      }
      const data = await r.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [mood, callSuggest, refreshAccess]);

  const closeAndGo = () => setShowLlamaForm(false);

  return (
    <>
      {showLlamaForm && (
        <Modal title="Find recipe by mood" onClose={() => setShowLlamaForm(false)}>
          <div className="ai-form">
            <input
              className="ai-input"
              placeholder={`e.g. "creamy spicy", "sad", "happy", "quick light"`}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button className="ai-btn" disabled={loading || !mood.trim()} onClick={search}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {loading && <div className="ai-loading">⏳</div>}
          {error && <div className="ai-error">{error}</div>}
          {results.length > 0 && (
            <ul className="ai-results">
              {results.map((r) => (
                <li key={r.id} className="ai-item">
                    <img
                      className="ai-thumb"
                      src={`data:image/jpeg;base64,${r.image}`}
                      alt={r.recipe}
                      loading="lazy"
                    />
                  <Link to={`/recipe/${r.id}`} className="ai-link" onClick={closeAndGo}>
                    {r.recipe} ({(r.rating ?? 0).toFixed(1)}★)
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}

export default AIBubble;
