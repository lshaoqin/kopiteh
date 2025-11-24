'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"
import { LoginPayload } from "../../../../../types/auth"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter();

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setUser = useAuthStore((state) => state.setUser);
  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const payload: LoginPayload = {
        email,
        password
      };

      const res = await fetch(`${API_URL}/auth/account-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response from server.");
      }

      console.log(data)

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
      setSuccess(message);

      setTimeout(() => {
        router.push("/admin/main/home");
      }, 1500);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

  }
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg ">
        <div className="p-5 flex flex-col w-full h-full text-grey-primary">
          <div>
            <h1 className="font-bold text-2xl">Welcome Back!</h1>
            <div className="flex flex-row space-x-1 mt-1">
              <label>Login below or</label>
              <Link href="/admin/auth/signup">
                <label className="font-semibold underline">create an account</label>
              </Link>
            </div>
          </div>
          <div className="flex flex-col space-y-5 my-6">
            <FormField className="flex flex-col space-y-1" variant="email" label="Email" inputProps={{ value: email, onChange: (e) => setEmail(e.target.value) }} />
            <FormField className="flex flex-col space-y-1" variant="password" label="Password" inputProps={{ value: password, onChange: (e) => setPassword(e.target.value) }} />
          </div>
          <Button
            onClick={handleLogin}
            variant="signin"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Log In"
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
          <Link href="/admin/auth/forgotpassword">
            <div className="mt-2 w-full flex justify-center">
              <label className="underline text-sm">Forgot password?</label>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}