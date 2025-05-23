"use client";

import React from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import SideBar from "@/components/large/side-bar/side_bar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row w-full h-full relative">
            <AuthWrapper>
                <div className="w-1/6 h-full">
                    <SideBar />
                </div>
                <div className="w-5/6 h-full flex justify-center items-center">
                    {children}
                </div>
            </AuthWrapper>
        </div>
    );
}