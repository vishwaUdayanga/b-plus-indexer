import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full py-6 pr-2 flex items-center justify-between">
            <div className="flex items-center justify-between w-2/5 rounded-md bg-[#F6F9FC] p-2 gap-2">
                <Image
                    src={'/logos/search.png'}
                    alt="Search Icon"
                    width={24}
                    height={24}
                />
                <input
                    type="text"
                    placeholder="Search time-consuming queries"
                    className="w-full bg-transparent outline-none text-[#828282]"
                />
            </div>
            <div className="flex items-center justify-center">
                <Link
                    href="/"
                    className="w-fit h-9 p-4 bg-[#00897A] text-white flex items-center rounded-md"
                >
                    <span>Documentation</span>
                </Link>
                <button className="w-9 h-9 ml-2 flex items-center justify-center bg-[#EEEEEE] rounded-md">
                    <Image
                        src={'/logos/settings.png'}
                        alt="Settings Icon"
                        width={15}
                        height={15}
                    />
                </button>
            </div>
        </header>
    );
}