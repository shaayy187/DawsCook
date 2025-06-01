import React from "react";
import "./App.css";

const AllergensSettings = ({
  allergens,
  newAllergen,
  setNewAllergen,
  handleAddAllergen,
  handleDeleteAllergen
}) => {
  return (
    <div className="allergens-settings-box">
      <h3>Allergens</h3>
      <div className="table-container">
        <table className="allergens-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allergens.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteAllergen(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="add-container">
          <input
            type="text"
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            placeholder="New allergen"
            className="allergen-input"
          />
          <button className="add-button" onClick={handleAddAllergen}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllergensSettings;
