import { InputHTMLAttributes } from "react";

export type TextFieldProps = {
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;
