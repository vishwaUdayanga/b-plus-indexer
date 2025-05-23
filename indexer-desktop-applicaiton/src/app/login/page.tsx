'use client';

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/mini/text-fields/input";
import Button from "@/components/mini/buttons/form-buttons/button";
import { LoginRequest } from "@/api-calls/auth/login.type";
import { login } from "@/api-calls/auth/login";
import { useDispatch } from "react-redux";
import { setDba } from "@/app-state/indexer_slice";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleLogin = async () => {
        setLoading(true);

        if (!username || !password) {
            setError("Please enter both username and password");
            setLoading(false);
            return;
        }

        const loginRequest: LoginRequest = {
            username,
            password,
        };

        try {
            const response = await login(loginRequest);
            // Get the data if returned and store in the redux store
            if (response) {
                dispatch(setDba(response));
                router.push("/trainer");
            }
            // Handle the case where login fails
            else {
                setError("Invalid username or password");
            }
        } catch (error) {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col items-center md:w-96 w-full text-center'>
            <Image 
                src="/logos/main.png"
                alt="Logo"
                width={100}
                height={100}
                className="mb-7"
            />
            <h1 className="text-2xl font-bold" style={{color: '#00897A'}}>Enter credentials</h1>
            <p className='text-sm text-slate-900'>Enter you credentials assigned by the admin</p>

            <Input
                placeholder="vishwa@bindex.com"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={error}
            />

            <Input
                placeholder="********"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
                text="Sign in"
                loading={loading}
                disabled={loading}
                onClick={handleLogin}
            />
            
            <p className='text-sm text-[#828282] mt-4'><Link href={'#'} style={{color: '#00897A'}}>Read more </Link>about how you can set authentication based on your <span className='text-black'>organization.</span></p>
        </div>
    )
}