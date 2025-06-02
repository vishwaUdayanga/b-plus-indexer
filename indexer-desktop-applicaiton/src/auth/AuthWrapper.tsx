"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/utils/token";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const token = useSelector((state: RootState) => state.indexer.dba.access_token);
    
    useEffect(() => {
        const checkToken = () => {
        if (token && !isTokenExpired(token)) {
            setLoading(false);
        } else {
            router.push("/login");
        }
        };
        checkToken();
    }, [token, router]);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return <>{children}</>;
}