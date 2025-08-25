'use client'

import { useState, useEffect } from "react"
import React from "react";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import ManualConfiguration from "@/components/large/manual-configuration/manual-configuration";

export default function Page() {
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const { id } = useParams();

    // Get the time consuming query details from redux by id
    const queryId = Number(id);

    const timeConsumingQuery = useSelector((state: RootState) =>
        state.indexer.queries.find((q) => q.id === queryId)
    );

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/manual-labor');
        }
    }, [id, router]);

    return (
        <ManualConfiguration props={timeConsumingQuery} />
    );
}