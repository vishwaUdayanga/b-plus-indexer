import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder: string;
    type: string;
    error?: string;
}