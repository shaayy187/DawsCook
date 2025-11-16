import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api").replace(/\/+$/, "");

export default function EmailIngredientsButton({
  recipeId,
  portion = 1,
  className = "",
  label = "Email ingredients",
  title = "Email the ingredient list to me",
  onSuccess,
  onError,
}) {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(async () => {
    const token = sessionStorage.getItem("access");
    if (!token) {
      navigate("/signin");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/recipes/${recipeId}/email_ingredients/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ portion: Number(portion || 1) }),
      });

      if (!res.ok) {
        let msg = "Failed to send the email.";
        try {
          const err = await res.json();
          msg = err.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      onSuccess?.();
      alert("I’ve emailed the ingredients to you ✅");
    } catch (e) {
      onError?.(e);
      alert(e.message || "Something went wrong while sending the email.");
    } finally {
      setSending(false);
    }
  }, [recipeId, portion, navigate, onSuccess, onError]);

  return (
    <button
      onClick={handleClick}
      className={`pushable-xs ${className}`}
      title={title}
      disabled={sending}
      aria-busy={sending ? "true" : "false"}
    >
      <span className="shadow-xs"></span>
      <span className="edge-xs"></span>
      <span className="front-xs">{sending ? "Sending…" : label}</span>
    </button>
  );
}
