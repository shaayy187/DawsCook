import React, { useState, useEffect } from "react";
import "./App.css";

const AllergensSettings = ({
  userAllergyInfo,
  setUserAllergyInfo,
  token
}) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editPower, setEditPower] = useState("");
  const [editSymptoms, setEditSymptoms] = useState("");
  const [editTreatment, setEditTreatment] = useState("");

  const startEdit = (row) => {
    setEditRowId(row.id);
    setEditPower(row.power || "");
    setEditSymptoms(row.symptoms || "");
    setEditTreatment(row.treatment || "");
  };

  const cancelEdit = () => {
    setEditRowId(null);
    setEditPower("");
    setEditSymptoms("");
    setEditTreatment("");
  };

  const saveEdit = async (row) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/user_allergies/${row.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            power: editPower,
            symptoms: editSymptoms,
            treatment: editTreatment,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        console.error("PATCH error:", err);
        throw new Error("Couldn't save the changes");
      }
      const updated = await res.json();

      setUserAllergyInfo((prev) =>
        prev.map((r) => (r.id === row.id ? updated : r))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Couldn't save the changes.");
    }
  };

  const deleteRow = async (rowId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete your allergy?"
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/user_allergies/${rowId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 204) {
        setUserAllergyInfo((prev) =>
          prev.filter((r) => r.id !== rowId)
        );
      } else {
        const err = await res.json();
        console.error("DELETE error:", err);
        throw new Error("Couldn't delete.");
      }
    } catch (err) {
      console.error(err);
      alert("Couldn't delete.");
    }
  };

  const [allAvailableAllergies, setAllAvailableAllergies] = useState([]);
  const [newAllergyId, setNewAllergyId] = useState("");
  const [newPower, setNewPower] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newTreatment, setNewTreatment] = useState("");

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/allergies/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAllAvailableAllergies(data);
        } else {
          console.error(
            "Couldn't fetch existing allergies.",
            await res.json()
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGlobal();
  }, [token]);

  const addNew = async () => {
    if (!newAllergyId) {
      alert("Choose allergy from given list");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/user_allergies/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allergy_id: Number(newAllergyId),
          power: newPower,
          symptoms: newSymptoms,
          treatment: newTreatment,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("POST error:", err);
        throw new Error("Couldn't create new allergy.");
      }
      const created = await res.json();
      setUserAllergyInfo((prev) => [...prev, created]);
      setNewAllergyId("");
      setNewPower("");
      setNewSymptoms("");
      setNewTreatment("");
    } catch (err) {
      console.error(err);
      alert("Couldn't create new allergy.");
    }
  };

  return (
    <div className="allergens-settings-box">
      <h3>My Allergies &amp; Details</h3>
      <div className="table-container">
        <table className="allergens-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Power</th>
              <th>Symptoms</th>
              <th>Treatment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userAllergyInfo.map((row) => (
              <tr key={row.id}>
                <td>{row.allergy}</td>
                <td>
                  {editRowId === row.id ? (
                    <input
                      type="text"
                      value={editPower}
                      onChange={(e) => setEditPower(e.target.value)}
                      className="allergens-input-inline"
                    />
                  ) : (
                    row.power || <i>(none)</i>
                  )}
                </td>
                <td>
                  {editRowId === row.id ? (
                    <input
                      type="text"
                      value={editSymptoms}
                      onChange={(e) => setEditSymptoms(e.target.value)}
                      className="allergens-input-inline"
                    />
                  ) : (
                    row.symptoms || <i>(none)</i>
                  )}
                </td>
                <td>
                  {editRowId === row.id ? (
                    <input
                      type="text"
                      value={editTreatment}
                      onChange={(e) => setEditTreatment(e.target.value)}
                      className="allergens-input-inline"
                    />
                  ) : (
                    row.treatment || <i>(none)</i>
                  )}
                </td>
                <td>
                  {editRowId === row.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(row)}
                        className="allergens-btn-inline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="allergens-btn-inline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(row)}
                        className="allergens-btn-inline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="allergens-btn-inline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {userAllergyInfo.length === 0 && (
          <p className="allergens-empty-msg">
            You have no allergy details added yet.
          </p>
        )}
      </div>
      <hr className="hr-margin-20" />
      <div className="add-container">
        <select
          value={newAllergyId}
          onChange={(e) => setNewAllergyId(e.target.value)}
          className="add-select"
        >
          <option value="">-- select allergy --</option>
          {allAvailableAllergies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Power (e.g. mild)"
          value={newPower}
          onChange={(e) => setNewPower(e.target.value)}
          className="add-input"
        />
        <input
          type="text"
          placeholder="Symptoms"
          value={newSymptoms}
          onChange={(e) => setNewSymptoms(e.target.value)}
          className="add-input symptoms-input"
        />
        <input
          type="text"
          placeholder="Treatment"
          value={newTreatment}
          onChange={(e) => setNewTreatment(e.target.value)}
          className="add-input treatment-input"
        />
        <button onClick={addNew} className="add-button">
          Add
        </button>
      </div>
    </div>
  );
};

export default AllergensSettings;
