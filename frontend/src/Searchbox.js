import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function SearchBox({
  apiUrl = "http://localhost:8000/api/recipes/search/",
  allergiesApi = "http://localhost:8000/api/allergies/",
  placeholder = "Search for recipe..."
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [excludeAllergies, setExcludeAllergies] = useState([]);
  const [ingredient, setIngredient] = useState("");

  const wrapperRef = useRef(null);

  useEffect(() => {
    fetch(allergiesApi).then(r => r.json()).then(setAllergies).catch(() => setAllergies([]));
  }, [allergiesApi]);

  const fetchNow = async () => {
    if (!ingredient.trim() && !excludeAllergies.length) return;
    setLoading(true);
    try {
      const r = await fetch(buildUrl(""));
      const data = await r.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const buildUrl = (value) => {
    const p = new URLSearchParams();
    if (value?.trim()) p.set("q", value.trim());
    if (ingredient.trim()) p.set("ingredient", ingredient.trim());
    if (excludeAllergies.length) p.set("exclude_allergies", excludeAllergies.join(","));
    p.set("limit","10");
    return `${apiUrl}?${p.toString()}`;
  };

  const doSearch = useMemo(() => {
    let t = null;
    return (val) => {
      clearTimeout(t);
      t = setTimeout(async () => {
        if (!val.trim() && !ingredient.trim()) { setResults([]); return; }
        setLoading(true);
        try {
          const r = await fetch(buildUrl(val));
          const data = await r.json();
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 250);
    };
  }, [apiUrl, ingredient, excludeAllergies]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (q || ingredient) doSearch(q || " ");
  }, [excludeAllergies, ingredient]);

  const toggleAllergy = (id) => {
    setExcludeAllergies((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (q) {
      doSearch(q);
    } else {
      fetchNow();
    }
  }, [ingredient, excludeAllergies]);

  return (
    <div className="search" ref={wrapperRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          className="search-input"
          placeholder={placeholder}
          value={q}
          onChange={(e) => { const val = e.target.value; setQ(val); doSearch(val); }}
        />
        <button type="button" className="search-filter-btn" onClick={() => setShowFilters(v => !v)}>
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="search-filters">
          <div className="filter-row">
            <label>Exclude allergies:</label>
            <div className="filter-checks">
              {allergies.map(a => (
                <label key={a.id} className="filter-check">
                  <input
                    type="checkbox"
                    checked={excludeAllergies.includes(a.id)}
                    onChange={() => toggleAllergy(a.id)}
                  />
                  <span>{a.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="search-loading">⏳</div>}

      {(q || ingredient) && results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={r.id} className="search-item">
              <Link
                className="search-link"
                to={`/recipe/${r.id}`}
                onClick={() => { setQ(""); setIngredient(""); setResults([]); }}
              >
                {r.recipe} ({(r.rating ?? 0).toFixed(1)}★, {r.ratings_count ?? 0} votes)
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
