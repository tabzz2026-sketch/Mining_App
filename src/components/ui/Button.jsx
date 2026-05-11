import React from 'react';

const Button = ({ children, type = 'button', disabled, className = '', ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;