'use client'

import { FC } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";

const SideBar:FC = () => {
    //State to track the navigation
    const [currentTab, setCurrentTab] = useState("analyse")

    ///Method to change the currentTab
    const changeTab = ({tab}: {tab: string}) => {
        setCurrentTab(tab)
    }

    return (
        <div className="w-full flex flex-col h-full bg-white">
            <Image 
                src={'/logos/main.png'}
                width={150}
                height={150}
                alt="B+ Indexer|Indexer|Main|Logo"
                className="mt-5 ml-5"
            />
            <div className="mt-7">
                <nav>
                    <ul>
                        <li style={{transition: 'border 0.1s ease-in-out'}} className={clsx("w-full px-2 border-transparent border-l-green-700 mt-3",
                            {
                                "border-l-4": (currentTab === "analyse")
                            }
                        )}>
                            <Link
                                href={'/'}
                                onClick={() => changeTab({tab: 'analyse'})}
                                className="w-full py-3 px-3 flex justify-between items-center bg-slate-100 rounded-md"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <Image 
                                        src={'/logos/analyse.png'}
                                        width={15}
                                        height={15}
                                        alt="B+ Indexer|Analyse|Logo"
                                    />
                                    <p className="text-sm">Analyse</p>
                                </div>
                                <div className="w-5 h-5 rounded-sm bg-slate-200 flex items-center justify-center">
                                    <p className="text-sm">5</p>
                                </div>
                            </Link>
                        </li>
                        <li style={{transition: 'border 0.1s ease-in-out'}} className={clsx("w-full px-2 border-transparent border-l-green-700 mt-3",
                            {
                                "border-l-4": (currentTab === "trainer")
                            }
                        )}>
                            <Link
                                href={'/trainer'}
                                onClick={() => changeTab({tab: 'trainer'})}
                                className="w-full py-3 px-3 flex justify-between items-center bg-slate-100 rounded-md"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <Image 
                                        src={'/logos/trainer.png'}
                                        width={15}
                                        height={15}
                                        alt="B+ Indexer|Trainer|Logo"
                                    />
                                    <p className="text-sm">Trainer</p>
                                </div>
                                <div className="w-5 h-5 rounded-sm bg-slate-200 flex items-center justify-center">
                                    <p className="text-sm">2</p>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default SideBar