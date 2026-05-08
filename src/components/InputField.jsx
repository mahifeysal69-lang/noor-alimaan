import React from 'react';

const InputField = ({ 
  primaryLabel, 
  secondaryLabel, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  error,
  name 
}) => {
  return (
    <div className={`input-field-group ${error ? 'error' : ''}`}>
      <div className="field-label">
        <span className="primary-label font-latin">{primaryLabel}</span>
        <span className="secondary-label font-ethiopic">{secondaryLabel}</span>
      </div>
      <input
        type={type}
        className="underlined-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default InputField;
