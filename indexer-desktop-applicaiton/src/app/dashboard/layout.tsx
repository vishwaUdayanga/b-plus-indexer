"use client";

import React from "react";
import AuthWrapper from "@/auth/AuthWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-center h-screen">
            <AuthWrapper>
                {children}
            </AuthWrapper>
        </div>
    );
}