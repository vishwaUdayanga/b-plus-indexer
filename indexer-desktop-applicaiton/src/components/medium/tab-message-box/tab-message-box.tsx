import React from "react";
import { TabMessageBoxProps } from "./tab-message-box.type";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/mini/buttons/form-buttons/button";

export default function TabMessageBox({
    icon,
    title,
    message,
    buttonText,
    loading,
    disabled,
    buttonType,
    url,
    onButtonClick
}: TabMessageBoxProps) {
    return (
        <div className="w-2/5 flex items-center justify-center gap-2 flex-col text-center">
            <Image
                src={`/logos/${icon}.png`}
                alt={`${title} icon`}
                width={50}
                height={50}
            />
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-[#828282]">{message} <Link href={url} className="text-[#00897A]">Read more.</Link></p>
            {buttonText && (
                <div className="w-2/5">
                    <Button
                        text={buttonText}
                        loading={loading}
                        disabled={disabled}
                        buttonType={buttonType}
                        onClick={onButtonClick}
                    />
                </div>
            )}
        </div>
    );
}