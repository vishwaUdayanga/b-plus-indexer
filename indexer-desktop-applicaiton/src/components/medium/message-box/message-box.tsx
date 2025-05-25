import React from "react";
import { MessageBoxProps } from "./message-box.type";

export default function MessageBox({ messageBoxProps, children }: {messageBoxProps: MessageBoxProps, children: React.ReactNode}) {
    const { visible, onClose } = messageBoxProps;
    if (!visible) {
        return null;
    }
    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <div className="z-10 w-full h-full absolute top-0 left-0 backdrop-blur-sm bg-black/75 opacity-95" onClick={handleClose}></div>
            <div className="z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/6">
                {children}
            </div>
        </>
    );
}