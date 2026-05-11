import React from 'react';

const Input = ({ label, name, type = 'text', required, onChange, value }) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700 ml-1">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        onChange={onChange}
        value={value}
        className="glass-input px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
      />
    </div>
  );
};

export default Input;