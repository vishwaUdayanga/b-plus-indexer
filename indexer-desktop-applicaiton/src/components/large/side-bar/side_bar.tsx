'use client'

import { FC } from "react";
import Image from "next/image";
import { useState } from "react";
import { SideBarManualList, SideBarMonitorList, SideBarTrainList } from './side-bar.type';
import List from "@/components/mini/lists/side-bar-list/list";
import MessageBox from "@/components/medium/message-box/message-box";

const SideBar:FC = () => {
    //State to track the navigation
    const [currentTab, setCurrentTab] = useState("Analyse")

    //State to track the message box visibility
    const [messageBox, setMessageBox] = useState(false)

    ///Method to change the currentTab
    const changeTab = ({tab}: {tab: string}) => {
        setCurrentTab(tab)
    }

    //Method to logout the user
    const logout = () => {
        //Logout the user
        setMessageBox(true)
    }

    return (
        <div className="w-full flex flex-col h-full bg-white p-3">
            <h1 className="text-xl text-black mb-5 font-bold">B+ Indexer</h1>
            <div className="flex flex-col justify-between h-full">
                <nav>
                    <ul>
                        <h1 className="text-base font-bold">Monitor</h1>
                        {SideBarMonitorList.map((item, index) => (
                            <List
                                key={index}
                                currentTab={currentTab}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                onClick={changeTab}
                            />
                        ))}
                    </ul>
                    <ul>
                        <h1 className="text-base">Train</h1>
                        {SideBarTrainList.map((item, index) => (
                            <List
                                key={index}
                                currentTab={currentTab}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                onClick={changeTab}
                            />
                        ))}
                    </ul>
                    <ul>
                        <h1 className="text-base">Manual</h1>
                        {SideBarManualList.map((item, index) => (
                            <List
                                key={index}
                                currentTab={currentTab}
                                title={item.title}
                                icon={item.icon}
                                link={item.link}
                                onClick={changeTab}
                            />
                        ))}
                    </ul>
                </nav>
                <div className="w-full border border-transparent border-t-slate-300">
                    <button className="mt-3 w-full" onClick={logout}>
                        <div className="flex items-center gap-3">
                            <Image 
                                src={`/logos/logout.png`}
                                width={20}
                                height={20}
                                alt={`B+ Indexer|Logout|Logo`}
                            />
                            <p className="text-sm">Logout</p>
                        </div>
                    </button>
                </div>
            </div>
            <MessageBox 
                messageBoxProps={{
                    visible: messageBox,
                    onClose: () => setMessageBox(false)
                }}
            >
                <div className="w-96 h-56 bg-white">
                    <p>Message box</p>
                </div>
            </MessageBox>
        </div>
    )
}

export default SideBar