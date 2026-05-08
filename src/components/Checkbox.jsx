import React from 'react';

const Checkbox = ({ 
  primaryLabel, 
  secondaryLabel, 
  checked, 
  onChange, 
  name,
  id 
}) => {
  return (
    <div className={`checkbox-group ${checked ? 'checked' : ''}`}>
      <input
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={onChange}
        name={name}
        id={id}
      />
      <div className="checkbox-labels">
        <label htmlFor={id} className="checkbox-primary font-latin">
          {primaryLabel}
        </label>
        <label htmlFor={id} className="checkbox-secondary font-ethiopic">
          {secondaryLabel}
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
