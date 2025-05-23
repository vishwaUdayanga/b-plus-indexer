import React from "react";
import { ButtonProps } from "./button.type";
import buttonLoadingAnimation from '../../../../../public/animations/button-loading.json';
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Button: React.FC<ButtonProps> = ({
    text,
    icon,
    loading,
    disabled,
    ...props
}) => {
    return (
        <button
            className={`w-full flex items-center justify-center bg-black cursor-pointer text-white p-2 mt-5 rounded-lg ${loading ? 'opacity-70 cursor-default' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Lottie
                    animationData={buttonLoadingAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: 22, height: 22 }}
                />
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