import React from "react";
import { ListProps } from "./list.type";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

export default function List({ currentTab, title, icon, link, onClick }: ListProps) {
    return (
        <li style={{transition: 'border 0.1s ease-in-out'}} className={clsx("w-full px-2 border-transparent border-l-black mt-1 ",
            {
                "border-l-4": (currentTab === title)
            }
        )}>
            <Link
                href={link}
                onClick={() => onClick({tab: title})}
                className= {clsx("w-full py-3 px-3 flex justify-between items-center rounded-md hover:bg-[#F7F7F7]",
                    {
                        "bg-[#F7F7F7]": (currentTab === title)
                    }
                )} 
            >
                <div className="flex items-center justify-center gap-3">
                    <Image 
                        src={`/logos/${icon}.png`}
                        width={18}
                        height={18}
                        alt={`Indexer|${title}|Logo`}
                    />
                    <p className="text-sm">{title}</p>
                </div>
            </Link>
        </li>
    );
} 