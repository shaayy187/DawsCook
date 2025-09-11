import React, { useEffect, useState, useCallback } from "react";

const RecipeGallery = ({ recipeId, isAdmin = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [rawBase64, setRawBase64] = useState(null);
  const [previewImgId, setPreviewImgId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const token = sessionStorage.getItem("access");
  const isLoggedIn = !!token;

  const fetchGallery = useCallback(() => {
    if (!recipeId) return;

    setLoading(true);
    fetch(`http://localhost:8000/api/recipes/${recipeId}/gallery/`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch gallery");
        return r.json();
      })
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.images || [];
        setImages(arr);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [recipeId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const raw = String(dataUrl).split(",")[1];
      setRawBase64(raw || null);
    };
    reader.readAsDataURL(f);
  };

  const upload = () => {
    if (!isLoggedIn) {
      alert("Sign in required.");
      return;
    }
    if (!rawBase64) {
      alert("Pick a file first.");
      return;
    }

    fetch(`http://localhost:8000/api/recipes/${recipeId}/gallery/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_upload: rawBase64,
        caption: caption || "",
        content_type: "image/jpeg",
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to add image");
        return r.json();
      })
      .then(() => {
        setCaption("");
        setRawBase64(null);
        const el = document.getElementById("gallery-file-input");
        if (el) el.value = "";
        fetchGallery();
      })
      .catch((e) => setError(e.message));
  };

  const remove = (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this photo?")) return;

    fetch(`http://localhost:8000/api/gallery/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status !== 204) throw new Error("Failed to delete image");
        setImages((prev) => prev.filter((x) => x.id !== id));
        if (previewImgId === id) setPreviewImgId(null);
      })
      .catch((e) => setError(e.message));
  };

  const openPreview = (id) => setPreviewImgId(id);
  const closePreview = useCallback(() => setPreviewImgId(null), []);

  const currentIndex = images.findIndex((x) => x.id === previewImgId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < images.length - 1;

  const prevImage = useCallback(() => {
    if (currentIndex > 0) {
      setPreviewImgId(images[currentIndex - 1].id);
    }
  }, [currentIndex, images]);

  const nextImage = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < images.length - 1) {
      setPreviewImgId(images[currentIndex + 1].id);
    }
  }, [currentIndex, images]);

  useEffect(() => {
    if (!previewImgId) return;

    const onKey = (e) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewImgId, closePreview, prevImage, nextImage]);

  const gridSide = images.length <= 1 ? 1 : images.length <= 4 ? 2 : 3;

  if (loading) return <div className="loading">Loading gallery…</div>;
  if (error) return <div className="error">{error}</div>;

  const currentImg = currentIndex >= 0 ? images[currentIndex] : null;
  const currentSrc =
    currentImg && currentImg.image
      ? `data:${currentImg.content_type};base64,${currentImg.image}`
      : null;

  return (
    <section className="recipe-gallery-section">
      <h3>Gallery</h3>
      {isLoggedIn && (
        <div className="gallery-uploader">
          <input
            id="gallery-file-input"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="input-file-hidden"
          />
          <label
            htmlFor="gallery-file-input"
            className="pushable-xs pushable-xs--light btn-gap-xs"
          >
            <span className="shadow-xs"></span>
            <span className="edge-xs"></span>
            <span className="front-xs">Choose file</span>
          </label>
          <button className="pushable-xs" onClick={upload}>
            <span className="shadow-xs"></span>
            <span className="edge-xs"></span>
            <span className="front-xs">Upload image</span>
          </button>
        </div>
      )}
      <div className="gallery-container" style={{ "--cols": gridSide }}>
        {images.slice(0, 9).map((img) => {
          const bg = img.image
            ? `url(data:${img.content_type};base64,${img.image})`
            : "none";
          return (
            <div
              key={img.id}
              className="gallery-tile"
              style={{ backgroundImage: bg }}
              onClick={() => openPreview(img.id)}
              title={img.caption || ""}
              role="button"
            >
              <div className="gallery-caption">
                <span>{img.caption}</span>
                <span className="gallery-meta">
                  {new Date(img.created).toLocaleDateString()}
                  {img.username ? ` · ${img.username}` : ""}
                </span>
              </div>
              {isAdmin && (
                <button
                  className="gallery-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(img.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      {previewImgId && currentImg && (
        <div
          className="modal-overlay gallery-lightbox-overlay"
          onClick={closePreview}
          role="dialog"
        >
          <div
            className="gallery-lightbox"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="gallery-lightbox-close" onClick={closePreview}>
              ×
            </button>
            {hasPrev && (
              <button
                className="gallery-lightbox-nav gallery-lightbox-prev"
                onClick={prevImage}
              >
                ‹
              </button>
            )}
            {currentSrc && (
              <img
                src={currentSrc}
                alt={currentImg.caption || "Preview"}
                className="gallery-lightbox-image"
              />
            )}
            {hasNext && (
              <button
                className="gallery-lightbox-nav gallery-lightbox-next"
                onClick={nextImage}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
      {images.length > 9 && (
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <button className="pushable-xs" onClick={() => setShowAll(true)}>
            <span className="shadow-xs"></span>
            <span className="edge-xs"></span>
            <span className="front-xs">More photos</span>
          </button>
        </div>
      )}
      {showAll && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAll(false)}
        >
          <div
            className="modal-content gallery-all-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-all-header">
              <h4>All photos ({images.length})</h4>
              <button
                className="gallery-lightbox-close"
                onClick={() => setShowAll(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="gallery-all-grid">
              {images.map((img) => {
                const bg = img.image
                  ? `url(data:${img.content_type};base64,${img.image})`
                  : "none";
                return (
                  <div
                    key={img.id}
                    className="gallery-all-tile"
                    style={{ backgroundImage: bg }}
                    title={img.caption || ""}
                    role="button"
                    onClick={() => {
                      setShowAll(false);
                      openPreview(img.id);
                    }}
                  >
                    <div className="gallery-caption">
                      <span>{img.caption}</span>
                      <span className="gallery-meta">
                        {new Date(img.created).toLocaleDateString()}
                        {img.username ? ` · ${img.username}` : ""}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        className="gallery-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(img.id);
                        }}
                        aria-label="Delete image"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecipeGallery;
