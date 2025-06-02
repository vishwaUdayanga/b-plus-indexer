"use client";

import React from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SideBar from "@/components/large/side-bar/side_bar";
import Header from "@/components/medium/header/header";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row w-full h-full relative">
            <AuthWrapper>
                <div className="w-1/6 h-full overflow-hidden">
                    <SideBar />
                </div>
                <div className="w-5/6 h-full flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex h-full bg-[#F6F9FC] overflow-auto p-3 items-center justify-center">
                        {children}
                    </div>
                </div>
            </AuthWrapper>
        </div>
    );
}