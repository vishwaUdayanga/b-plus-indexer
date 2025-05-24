import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    buttonType?: "submit" | "info" | "error" | "logout";           
}