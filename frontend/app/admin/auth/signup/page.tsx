'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"
import { UserRole, User, CreateAccountPayload } from "../../../../../types/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Home() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [userName, setUserName] = useState("")
    const [secretCode, setSecretCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const router = useRouter();

    const handleSignup = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        if (!API_URL) {
            setError("API URL is not configured.");
            setLoading(false);
            return;
        }

        if (!userName || !email || !password || !secretCode) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const payload: CreateAccountPayload = {
                name: userName,
                email,
                password,
                secretCode
            };

            const res = await fetch(`${API_URL}/auth/create-account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Attempt to parse JSON, but safely
            // Read raw text so we ALWAYS see something
            const raw = await res.text();

            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.log("Non-JSON response:", raw);
                setError("Please make sure that your password contains at least 6 characters and your secret code is correct.");
                setLoading(false);
                return;
            }

            // Backend validation error case (status 400)
            if (!data.success) {
                const msg =
                    data?.payload?.details ||
                    `Request failed: ${res.status}`;
                setError(msg);
                return;
            }
            // Success response
            const message = data.payload?.data?.message ?? "Account created.";
            setSuccess(message);

            setTimeout(() => {
                router.push(`/admin/auth/verifyemail?email=${encodeURIComponent(email)}`)
            }, 2000);
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center">
                <div className="p-5 flex flex-col w-full h-full space-y-[79px] items-center">
                    <div className="flex items-center flex-col">
                        <h1 className="font-extrabold text-4xl text-center">Create an Account</h1>
                        <div className="flex flex-row space-x-1 mt-2 text-grey-primary">
                            <label className="text-grey-primary/70">Enter your account details below or</label>
                            <Link href="/admin/auth/login">
                                <label className="font-semibold underline">log in</label>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-[41px] w-full">
                        <FormField 
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" 
                            variant="text" 
                            label="" 
                            inputProps={{ value: userName, placeholder: "User Name", onChange: (e) => {setUserName(e.target.value); setError(null);} }} />
                        <FormField 
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" 
                            variant="email" 
                            label="" 
                            inputProps={{ value: email, placeholder: "Email", onChange: (e) => {setEmail(e.target.value); setError(null);}}} />
                        <FormField 
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" 
                            variant="password" 
                            label="" 
                            inputProps={{ value: password, placeholder: "Password", onChange: (e) => {setPassword(e.target.value); setError(null);} }} />
                        <FormField 
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" 
                            variant="password" 
                            label="" 
                            inputProps={{ value: secretCode, placeholder: "Secret Code", onChange: (e) => {setSecretCode(e.target.value); setError(null);} }} />
                    </div>
                    <div className="flex flex-col justify-center items-center w-full space-y-2">
                        <Button
                            onClick={handleSignup}
                            variant="signin"
                            disabled={loading || !email || !password || !userName || !secretCode}
                            className="flex w-1/3 items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Signing up...</span>
                                </div>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                        {error && (
                            <div className="flex justify-center w-full">
                                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex justify-center w-full">
                                <p className="text-green-600 text-sm mt-2 text-center">{success}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    )
}