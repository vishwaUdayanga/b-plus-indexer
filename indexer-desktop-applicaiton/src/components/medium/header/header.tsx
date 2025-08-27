'use client'

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSearch } from "@/app-state/indexer_slice";

export default function Header() {
    const [searchInput, setSearchInput] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();

    const handleSearch = () => {
        // Save search query in Redux
        dispatch(setSearch(searchInput));

        // Navigate if not already on manual-labor
        if (pathname !== "/dashboard/manual-labor") {
            router.push("/dashboard/manual-labor");
        }
    };

    return (
        <header className="w-full py-6 pr-2 flex items-center justify-between">
            <div className="flex items-center justify-between w-2/5 rounded-md bg-[#F6F9FC] p-2 gap-2">
                <Image
                    src={'/logos/search.png'}
                    alt="Indexer|Search Icon"
                    width={24}
                    height={24}
                />
                <input
                    type="text"
                    placeholder="Search time-consuming queries"
                    className="w-full bg-transparent outline-none text-[#828282]"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
            </div>
            <div className="flex items-center justify-center">
                <Link
                    href="/dashboard"
                    className="w-fit h-9 p-4 bg-[#00897A] text-white flex items-center rounded-md"
                >
                    <span>Documentation</span>
                </Link>
                {/* <button className="w-9 h-9 ml-2 flex items-center justify-center bg-[#EEEEEE] rounded-md">
                    <Image
                        src={'/logos/settings.png'}
                        alt="Indexer|Settings Icon"
                        width={15}
                        height={15}
                    />
                </button> */}
            </div>
        </header>
    );
}