"use client";

import React from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SideBar from "@/components/large/side-bar/side_bar";
import Header from "@/components/medium/header/header";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row w-full h-screen relative">
            <AuthWrapper>
                <div className="w-1/6 h-full overflow-hidden">
                    <SideBar />
                </div>
                <div className="w-5/6 h-full flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 bg-[#F6F9FC] overflow-auto p-3">
                        {children}
                    </div>
                </div>
            </AuthWrapper>
        </div>
    );
}