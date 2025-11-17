'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"

export default function Home() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
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
                        <FormField className="flex flex-col space-y-1" variant="email" label="Email" inputProps={{ value: email, onChange: (e) => setEmail(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" variant="password" label="Password" inputProps={{ value: password, onChange: (e) => setPassword(e.target.value) }} />
                    </div>
                    <Button onClick={() => {
                        console.log("Email:", email)
                        console.log("Password:", password)
                    }} variant="signin">
                        Sign In
                    </Button>
                    <div className="mt-2 w-full flex justify-center">
                        <text className="underline text-sm">Forgot password?</text>
                    </div>
                </div>
            </div>
        </main>
    )
}