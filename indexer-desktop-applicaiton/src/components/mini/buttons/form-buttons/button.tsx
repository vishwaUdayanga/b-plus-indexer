import React from "react";
import { ButtonProps } from "./button.type";
import buttonLoadingAnimation from '../../../../../public/animations/button-loading.json';
import dynamic from "next/dynamic";
import clsx from "clsx";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Button: React.FC<ButtonProps> = ({
    text,
    icon,
    loading,
    disabled,
    buttonType,
    ...props
}) => {
    return (
        <button
            className={clsx(
                "w-full flex items-center justify-center cursor-pointe p-2 mt-5 rounded-lg border border-transparent",
                {
                    'bg-black': buttonType == 'submit',
                    'bg-[#E54A3B]': buttonType == 'logout',
                    'border-[#E54A3B]': buttonType == 'error',
                    'border-[#3A72F8]': buttonType == 'info',
                    'opacity-70 cursor-default': loading,
                })
            }
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
                    <span className={clsx(
                        {
                            'text-white': buttonType == 'submit' || 'logout',
                            'text-[#E54A3B]': buttonType == 'error',
                            'text-[#3A72F8]': buttonType == 'info',
                        }
                    )}>
                        {text}
                    </span>
                </>
            )}
        </button>
    );
}

export default Button;