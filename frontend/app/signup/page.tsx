'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"
import { UserRole, User, CreateAccountPayload } from "../../../types/auth"
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
                setError("Server returned an invalid response.");
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

            router.push(`/verifyemail?email=${encodeURIComponent(email)}`)
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg ">
                <div className="p-5 flex flex-col w-full h-full text-grey-primary">
                    <div>
                        <h1 className="font-bold text-2xl">Create an Account</h1>
                        <div className="flex flex-row space-x-1 mt-1">
                            <label>Enter your account details below or</label>
                            <Link href="/login">
                                <label className="font-semibold underline">log in</label>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-5 my-6">
                        <FormField className="flex flex-col space-y-1" variant="text" label="User Name" inputProps={{ value: userName, onChange: (e) => setUserName(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="email" label="Email" inputProps={{ value: email, onChange: (e) => setEmail(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="password" label="Password" inputProps={{ value: password, onChange: (e) => setPassword(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="password" label="Access Code" inputProps={{ value: secretCode, onChange: (e) => setSecretCode(e.target.value) }} />
                    </div>
                    <Button onClick={handleSignup} variant="signin">
                        {loading ? "Loading..." : "Sign Up"}
                    </Button>
                    {error && (
                        <div className="w-full flex justify-center">
                            <p className="text-red-500 text-sm mt-2">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}