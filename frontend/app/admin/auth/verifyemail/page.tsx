// app/verify-email/page.tsx
'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/formfield";
import { useAuthStore } from "@/stores/auth.store";
import { VerifyEmailPayload } from "../../../../../types/auth";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // optional: prefill email from query ?email=...
    useEffect(() => {
        const e = searchParams.get("email");
        if (e) setEmail(e);
    }, [searchParams]);

    const handleVerify = async () => {
        setError(null);
        setSuccess(null);

        if (!API_URL) {
            setError("API URL is not configured.");
            return;
        }

        if (!email || !code) {
            setError("Please enter both your email and verification code.");
            return;
        }

        setLoading(true);

        try {
            const payload: VerifyEmailPayload = {
                email,
                code
            };
            const res = await fetch(`${API_URL}/auth/verify-email`, {
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

            if (!res.ok || data?.success === false) {
                const msg =
                    data?.payload?.details ||
                    data?.payload?.message ||
                    data?.message ||
                    "Verification failed. Please check your code and try again.";
                setError(msg);
                return;
            }

            const payloadData = data?.payload?.data || {};
            const accessToken: string | undefined = payloadData.access_token;
            const refreshToken: string | undefined = payloadData.refresh_token;
            const user = payloadData.user;

            const message: string =
                payloadData.message ||            // "Email verified successfully"
                data?.payload?.message ||         // "Request processed successfully."
                "Email verified successfully.";


            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUser(user);
            const role = data.payload.data.user.role
            setSuccess(message);

            setTimeout(() => {
                router.push("/admin/main/home");
            }, 1500);
        } catch (err: any) {
            console.error("Verify email error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-[400px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg">
                <div className="p-5 flex flex-col w-full h-full text-grey-primary">
                    <div>
                        <h1 className="font-bold text-2xl">Verify your email</h1>
                        <p className="text-sm mt-1">
                            We’ve sent a 6-digit code to your email. Enter it below to activate your account.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-5 my-6">
                        <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="email" label="" inputProps={{ value: email, placeholder: "Email", onChange: (e) => setEmail(e.target.value) }} />
                        <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="password" label="" inputProps={{ value: code, placeholder: "Email Verficiation Code", onChange: (e) => setCode(e.target.value), maxLength: 6 }} />
                    </div>

                    <Button
                        onClick={handleVerify}
                        variant="signin"
                        disabled={loading || !email || !code}
                        className="w-full flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            "Verify Email"
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
