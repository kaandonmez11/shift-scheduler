import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, className = '', ...props }, ref) => {
  return (
    <div className="glass-input-wrapper">
      {label && <label htmlFor={id} className="glass-input-label">{label}</label>}
      <input
        id={id}
        ref={ref}
        className={`glass-input ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
