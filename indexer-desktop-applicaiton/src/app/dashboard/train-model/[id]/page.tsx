'use client'

import { FC, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const { id } = useParams();

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/trainer');
        }
    }, [id, router]);

    return (
        <div>
            <h1>Page for query {id}</h1>
        </div>
    );
}