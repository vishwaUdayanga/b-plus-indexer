import React from "react";
import { MessageBoxContentProps } from "./message-box-content.type";
import { clsx } from 'clsx';
import Image from "next/image";

export default function MessageBoxContent({messageBoxContent, children}: {messageBoxContent: MessageBoxContentProps, children: React.ReactNode}) {
    const { title, type, icon, onCancel } = messageBoxContent;

    return (
        <div className={clsx(
            "p-4 rounded-lg shadow-md w-full border border-transparent bg-white",
            {
                "border-l-[#E54A3B] border-l-8": type === "error",
                "border-l-[#00897A]": type === "info",
            })}>
                <div className="flex items-center w-full justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Image
                            src={`/logos/${icon}.png`}
                            alt={`${type} icon`}
                            width={20}
                            height={20}
                        />
                        <span className="text-lg font-bold">{title}</span>
                    </div>
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[#EEEEEE] cursor-pointer" onClick={onCancel}>
                        <Image
                            src="/logos/close.png"
                            alt="Close icon"
                            width={10}
                            height={10}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    {children}
                </div>
        </div>
    );
}