import React from "react";
import { InputProps } from "./input.type";

const Input: React.FC<InputProps> = ({
    placeholder,
    type,
    error,
    ...props}) => {
    return (
        <div className="flex flex-col w-full text-left mt-5">
            {error && <span className="text-red-500 text-sm m-0 p-0">{error}</span>}
            <input
                type={type}
                placeholder={placeholder}
                className='w-full border-2 rounded-lg p-2 text-sm focus:outline-none border-[#00897A]'
                {...props}
            />
        </div>
    );
}

export default Input;