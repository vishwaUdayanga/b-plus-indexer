'use client';

import { getBaseUrl } from "@/lib/electron/base-url";

export async function getBaseUrlFromElectron() {
    const baseUrl = await getBaseUrl();
    if (!baseUrl) {
        throw new Error('Base URL is not set');
    }
    return baseUrl;
}

