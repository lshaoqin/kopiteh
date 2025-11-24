'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/formfield";
import { useAuthStore } from "@/stores/auth.store";
import { ResetPasswordPayload } from "../../../../../types/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // prefill email from query ?email=...
  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);

    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    if (!email || !code || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload: ResetPasswordPayload = {
        email,
        code,
        newPassword,
      };

      const res = await fetch(`${API_URL}/auth/reset-password`, {
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

      console.log("reset-password response:", data);

      if (!res.ok || data?.success === false) {
        const msg =
          data?.payload?.details ||
          data?.payload?.message ||
          data?.message ||
          "Failed to reset password. Please check your code and try again.";
        setError(msg);
        return;
      }

      const payloadData = data?.payload?.data || {};
      const accessToken: string | undefined = payloadData.access_token;
      const user = payloadData.user;

      const message: string =
        payloadData.message ||
        data?.payload?.message ||
        "Password reset successfully.";

      // If your backend auto-logs in on reset and returns tokens:
      if (accessToken && user) {
        setAccessToken(accessToken);
        setUser(user);

        setSuccess(message);

        setTimeout(() => {
          router.push("/admin/home");
        }, 1500);
      } else {
        // If you chose not to auto-login on backend:
        setSuccess(message + " You can now log in with your new password.");
        setTimeout(() => {
          router.push("/admin/auth/login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
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
            <h1 className="font-bold text-2xl">Reset your password</h1>
            <p className="text-sm mt-1">
              Enter the reset code sent to your email and choose a new password.
            </p>
          </div>

          <div className="flex flex-col space-y-5 my-6">

            <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="email" label="" inputProps={{ value: email, placeholder: "Email", onChange: (e) => setEmail(e.target.value) }} />
            <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="password" label="" inputProps={{ value: code, placeholder: "Code", onChange: (e) => setCode(e.target.value), maxLength: 6 }} />
            <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="password" label="" inputProps={{ value: newPassword, placeholder: "New Password", onChange: (e) => setNewPassword(e.target.value) }} />
            <FormField className="flex flex-col space-y-1" classNameOut="p-2 bg-white rounded-sm border-1 transition-all duration-200 ease-out focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80" classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent" variant="password" label="" inputProps={{ value: confirmPassword, placeholder: "Confirm New Password", onChange: (e) => setConfirmPassword(e.target.value) }} />
          </div>

          <Button
            onClick={handleResetPassword}
            variant="signin"
            disabled={loading || !email || !code || !newPassword || !confirmPassword}
            className="w-full flex items-center justify-center"
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
    </main>
  );
}
