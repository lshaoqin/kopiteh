import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react";

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

function EmailInput({className, ...props}) {
  return (
    <div className={className}>
      <input
      type="email"
      inputMode="email"
      autoComplete="email"
      className="focus:outline-none text-grey-primary w-full"
      {...props} />
    </div>
  )
}

function TextInput({className, ...props}) {
  return (
    <div className={className}>
      <input
      type="text"
      inputMode="text"
      className="focus:outline-none text-grey-primary w-full"
      {...props} />
    </div>
  )
}

function NumberInput({className, ...props}) {
  return (
    <div className={className}>
      <input
      type="number"
      inputMode="decimal"
      className="focus:outline-none text-grey-primary w-full"
      {...props} />
    </div>
  )
}

function PasswordInput({className, autoComplete = "current-password", ...props}) {
  const [show, setShow] = useState(false)
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <input
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      className="focus:outline-none w-full"
      {...props} />

      <button onClick={() => setShow(!show)} className="text-grey-primary">
        {show ? <EyeOff /> : <Eye />}
      </button>
    </div>
    
  )
}

export { Input, EmailInput, PasswordInput, TextInput, NumberInput }
