'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"
import { UserRole, User, CreateAccountPayload } from "../../../types/auth"

export default function Home() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [userName, setUserName] = useState("")
    const [role, setRole] = useState<UserRole | "">("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [user, setUser] = useState<User | "">("")
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const handleSignup = async () => {
        if (!API_URL) {
            console.log("API not yet set")
            return
        } 

        if (!userName || !email || !password || !role) {
            setError("Please fill in all fields")
            return
        }

        try {
            setLoading(true)
            const createAccountPayLoad: CreateAccountPayload = {
                name: userName,
                email: email,
                password: password,
                role: role,
            }

            const res = await fetch(`${API_URL}/auth/create-account`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(createAccountPayLoad),
            })

            const data = await res.json()
            if (!res.ok) {
                // handle errorResponse shape
                const msg = data?.message || "Failed to create account";

                setError(msg);
                return;
            }

            // If success
            const message = data.payload.data.message; // Account has been created, verification code has been sent through email
            setSuccess(message);
            
            const user: User = {
                name: data.payload.data.name,
                user_id: data.payload.data.user_id,
                email: data.payload.data.email,
                role: data.payload.data.role,
                created_at: data.payload.data.created_at
            }

            setUser(user);

            
        } catch {
            
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg ">
                <div className="p-5 flex flex-col w-full h-full text-grey-primary">
                    <div>
                        <h1 className="font-bold text-2xl">Create an Account</h1>
                        <div className="flex flex-row space-x-1 mt-1">
                            <text>Enter your account details below or</text>
                            <text className="font-semibold underline">log in</text>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-5 my-6">
                        <FormField className="flex flex-col space-y-1" variant="text" label="User Name" inputProps={{ value: userName, onChange: (e) => setUserName(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="text" label="Role" inputProps={{ value: role, onChange: (e) => setRole(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="email" label="Email" inputProps={{ value: email, onChange: (e) => setEmail(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="password" label="Password" inputProps={{ value: password, onChange: (e) => setPassword(e.target.value) }} />
                    </div>
                    <Button onClick={() => {
                        console.log("Email:", email)
                        console.log("Password:", password)
                    }} variant="signin">
                        {loading ? "Sign In" : "Loading..."}
                    </Button>
                    <div className="mt-2 w-full flex justify-center">
                        <text className="underline text-sm">Forgot password?</text>
                    </div>
                </div>
            </div>
        </main>
    )
}