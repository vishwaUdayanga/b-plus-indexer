import React, { useRef, useState } from "react";
import { TextFieldProps } from "./text-field.type";

type FileUploadProps = TextFieldProps & {
  onFileDrop?: (file: File) => void;
};

export default function FileUpload({ error, onFileDrop, ...props }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFileName(e.dataTransfer.files[0].name);

            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(e.dataTransfer.files[0]);
                fileInputRef.current.files = dataTransfer.files;
            }

            onFileDrop?.(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            console.log("File name:", e.target.files[0].name);
            setFileName(e.target.files[0].name);
            onFileDrop?.(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <label
                htmlFor="file-upload"
                className={`w-full p-5 border-2 rounded-lg border-dashed transition-colors
                    ${dragOver ? "border-[#004D40] bg-teal-50" : "border-[#00897A]"}
                    ${error ? "border-red-500" : ""}
                    flex flex-col items-center justify-center text-center cursor-pointer`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    hidden
                    ref={fileInputRef}
                    {...props}
                    onChange={handleFileChange}
                />
                <p className="text-gray-700 text-sm mb-2">
                    Drag & drop your file here, or{" "}
                    <span className="text-[#00897A] underline">browse</span>
                </p>
                {fileName && (
                    <p className="text-xs text-gray-600 mt-1">Selected: {fileName}</p>
                )}
            </label>
            {error && (
                <span className="text-red-500 text-sm mt-1 block">{error}</span>
            )}
        </div>
    );
}
