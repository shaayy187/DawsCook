import React from 'react';
import './App.css';

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        {children}
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
