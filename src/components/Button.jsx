import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button className={`glass-btn ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
