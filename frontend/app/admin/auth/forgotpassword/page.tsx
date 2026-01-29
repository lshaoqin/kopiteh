'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/formfield";
import { ForgotPasswordPayload } from "../../../../../types/auth";
import Link from "next/link"

export default function ForgotPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("")
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const e = searchParams.get("email");
        if (e) setEmail(e);
    }, [searchParams]);

    const handleForgotPassword = async () => {
        setError(null);
        setSuccess(null);

        if (!userName?.trim()) {
            setError("Please enter your username");
            return;
        }

        if (!email?.trim()) {
            setError("Please enter your email");
            return;
        }

        if (!newPassword) {
            setError("Please enter your password");
            return;
        }

        if (!confirmPassword) {
            setError("Please enter your password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Make sure your confirm password matches your new password.");
            return;
        }

        if (!API_URL) {
            setError("API URL is not configured.");
            return;
        }

        setLoading(true);

        try {
            const payload: ForgotPasswordPayload = { email, name: userName, newPassword };

            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let data: any;
            try {
                data = await res.json();
            } catch {
                throw new Error("Invalid JSON response from server.");
            }

            if (!data.success) {
                const validationErrors = data?.error?.details?.errors;

                if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                    const msg = validationErrors.map((e: any) => e.msg).join(", ");
                    setError(msg);
                } else {
                    setError(data?.payload?.details || `Request failed: ${res.status}`);
                }
                return;
            }

            // Show success message
            setSuccess("Your password has been successfully reset, please login using your new password.");

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push(`/admin/auth/login`);
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center">
                <div className="p-5 flex flex-col w-full h-full space-y-20 items-center">
                    <div className="flex items-center flex-col">
                        <h1 className=" font-extrabold text-4xl text-center">Forgot Password</h1>
                        <div className="flex flex-row space-x-1 mt-2 text-grey-primary">
                            <label className="text-grey-primary/70">Enter your new password or back to</label>
                            <Link href="/admin/auth/login" className="font-semibold underline cursor-pointer">
                                <span>log in</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-10 w-full">
                        <FormField
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                            variant="text"
                            label=""
                            inputProps={{ value: userName, placeholder: "Username", onChange: (e) => { setUserName(e.target.value); setError(null); } }} />
                        <FormField
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                            variant="email"
                            label=""
                            inputProps={{ value: email, placeholder: "Email", onChange: (e) => { setEmail(e.target.value); setError(null); } }} />
                        <FormField
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                            variant="password"
                            label=""
                            inputProps={{ value: newPassword, placeholder: "New Password", onChange: (e) => { setNewPassword(e.target.value); setError(null); } }} />
                        <FormField
                            className="flex flex-col space-y-1"
                            classNameOut={`
                                p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                            `}
                            classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                            variant="password"
                            label=""
                            inputProps={{ value: confirmPassword, placeholder: "Confirm New Password", onChange: (e) => { setConfirmPassword(e.target.value); setError(null); } }} />
                    </div>
                    <div className="flex flex-col justify-center items-center w-full space-y-2">
                        <Button
                            onClick={handleForgotPassword}
                            variant="signin"
                            disabled={loading || !email}
                            className="flex w-1/2 items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    <span>Resetting...</span>
                                </div>
                            ) : (
                                "Reset Password"
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
    );
}
