'use client'

import { FC } from "react";
import Image from "next/image";
import { useState } from "react";
import { SideBarManualList, SideBarMonitorList, SideBarTrainList } from './side-bar.type';
import List from "@/components/mini/lists/side-bar-list/list";
import MessageBox from "@/components/medium/message-box/message-box";
import MessageBoxContent from "@/components/mini/message-box-content/message-box-content";
import Link from "next/link";
import Button from "@/components/mini/buttons/form-buttons/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearDba } from "@/app-state/indexer_slice";

const SideBar:FC = () => {
    //State to track the navigation
    const [currentTab, setCurrentTab] = useState("Analyse")

    //State to track the message box visibility
    const [messageBox, setMessageBox] = useState(false)

    //State to track loading for the logout button
    const [loading, setLoading] = useState(false)

    ///Method to change the currentTab
    const changeTab = ({tab}: {tab: string}) => {
        setCurrentTab(tab)
    }

    const router = useRouter();
    const dispatch = useDispatch();

    //Method to logout the user
    const logout = () => {
        //Logout the user
        setMessageBox(true)
    }

    //Method to handle the logout confirmation
    const handleLogout = () => {
        //Set loading to true
        setLoading(true);
        //Clear the user data from the redux store
        dispatch(clearDba());

        //Redirect to the login page
        router.push("/");
    }

    return (
        <div className="w-full flex flex-col h-full bg-white p-3">
            <h1 className="text-xl text-black mb-5 font-bold">B+ Indexer</h1>
            <div className="flex flex-col justify-between h-full">
                <nav>
                    <ul className="mt-6">
                        <h1 className="text-base font-bold ml-5">Monitor</h1>
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
                    <ul className="mt-6">
                        <h1 className="text-base font-bold ml-5">Train</h1>
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
                    <ul className="mt-6">
                        <h1 className="text-base font-bold ml-5">Manual</h1>
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
                                alt={`Indexer|Logout|Logo`}
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
                <MessageBoxContent
                    messageBoxContent={{
                        title: "Logout",
                        type: "error",
                        icon: "logout",
                        onCancel: () => setMessageBox(false)
                    }}
                >
                    <p className="text-sm w-11/12">You are about to logout. Make sure your manual configurations and model outputs are saved in the database as desired. The session will not be saved after logout due to security concerns thus requires re <Link href={'#'} style={{color: '#00897A'}}>Read more.</Link></p>

                    <Button
                        text="Logout"
                        loading={loading}
                        disabled={loading}
                        buttonType="logout"
                        onClick={handleLogout}
                    />

                </MessageBoxContent>
            </MessageBox>
        </div>
    )
}

export default SideBar