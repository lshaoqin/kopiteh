'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/formfield";
import { ForgotPasswordPayload } from "../../../../../types/auth";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleForgotPassword = async () => {
        setError(null);
        setSuccess(null);

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        if (!API_URL) {
            setError("API URL is not configured.");
            return;
        }

        setLoading(true);

        try {
            const payload: ForgotPasswordPayload = { email };

            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let data: any;
            try {
                data = await res.json();
                console.log(data)
            } catch {
                throw new Error("Invalid JSON response from server.");
            }

            console.log("forgot-password response:", data);

            // Server ALWAYS returns success (even if email not found)
            // so we treat ANY ok response as success.
            if (!res.ok || data?.success === false) {
                const msg =
                    data?.payload?.message ||
                    data?.message ||
                    "Something went wrong. Please try again.";
                setError(msg);
                return;
            }

            // Show success message
            setSuccess("If an account exists, we've sent a reset code to your email.");

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push(`/admin/auth/resetpassword?email=${encodeURIComponent(email)}`);
            }, 2000);

        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg">
                <div className="p-5 flex flex-col w-full h-full text-grey-primary">
                    <div>
                        <h1 className="font-bold text-2xl">Forgot your password?</h1>
                        <p className="text-sm mt-1">
                            Enter your email and we’ll send you a 6-digit reset code.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-5 my-6">
                        <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="email" label="" inputProps={{ value: email, placeholder: "Email", onChange: (e) => setEmail(e.target.value) }} />
                    </div>

                    <Button
                        onClick={handleForgotPassword}
                        variant="signin"
                        disabled={loading || !email}
                        className="w-full flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            "Send Reset Code"
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
        </main>
    );
}
