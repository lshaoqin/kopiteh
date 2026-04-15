'use client'

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/formfield"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRunnerStore } from "@/stores/runner.store"

async function validateRunnerPassword(password: string): Promise<{ success: boolean; error?: string }> {
  
  if (!password) {
    return { success: false, error: "Password is required." }
  }

  const expectedPassword = process.env.NEXT_PUBLIC_RUNNER_CODE

  if (!expectedPassword) {
    return { success: false, error: "Runner password is not configured on the server." }
  }

  if (password !== expectedPassword) {
    return { success: false, error: "Incorrect password." }
  }

  return { success: true }
}

export default function Home() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter();
  const setRunnerName = useRunnerStore((state) => state.setRunnerName)
  const setAuthenticated = useRunnerStore((state) => state.setAuthenticated)

  const handleLogin = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true);

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      const result = await validateRunnerPassword(password)

      if (!result.success) {
        setError(result.error || "Incorrect password")
        return
      }

      setAuthenticated(true)
      setRunnerName(name.trim())
      setSuccess("Login successful")
      router.push("/runner/venue/selectvenue")
    } catch (err: any) {
      setError(err?.message || "Unable to log in right now")
    } finally {
      setLoading(false)
    }

  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setError(null)
    setSuccess(null)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      void handleLogin()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] items-center flex flex-col justify-center">
        <div className="p-5 flex flex-col w-full h-full space-y-20 items-center">
          <div className="flex items-center flex-col">
            <h1 className=" font-extrabold text-4xl text-center">Login</h1>
          </div>
          <div className="w-full">
            <div className="flex flex-col space-y-10 w-full">
              <FormField
                className="flex flex-col space-y-1"
                classNameOut={`p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                  ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                `}
                classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                variant="email"
                label=""
                inputProps={{ value: name, placeholder: "Volunteer Name", onChange: (e) => { setName(e.target.value); setError(null); } }} />
              <FormField
                className="flex flex-col space-y-1"
                classNameOut={`p-3 bg-white rounded-2xl transition-all duration-200 ease-out
                  ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                `}
                classNameIn="focus:outline-none text-grey-primary placeholder-center w-full text-left focus:placeholder-transparent"
                variant="password"
                label=""
                inputProps={{ value: password, placeholder: "Password", onChange: (e) => handlePasswordChange(e.target.value), onKeyDown }} />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center w-full space-y-3">
            <Button
              onClick={() => void handleLogin()}
              variant="signin"
              disabled={loading || !password}
              className="flex w-1/3 items-center justify-center"
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

          </div>


        </div>
      </div>
    </main>
  )
}