import React from 'react';
import { TextFieldProps } from './text-field.type';

const TextField: React.FC<TextFieldProps> = ({ placeholder, type, error, ...props }) => {
  return (
    <div className="flex flex-col w-full text-left mt-5">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border-2 rounded-lg p-2 text-sm focus:outline-none border-[#00897A]"
        {...props}
      />
      {error && <span className="text-red-500 text-sm mb-1">{error}</span>}
    </div>
  );
};

export default TextField;
