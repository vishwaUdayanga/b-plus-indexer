import React from "react";
import { ButtonProps } from "./button.type";

const Button: React.FC<ButtonProps> = ({
    text,
    icon,
    loading,
    disabled,
    ...props
}) => {
    return (
        <button
            className={`w-full flex items-center justify-center bg-black cursor-pointer text-white p-2 mt-5 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="loader"></span>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    {text}
                </>
            )}
        </button>
    );
}

export default Button;