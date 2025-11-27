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

function EmailInput({classNameOut, classNameIn, ...props}) {
  return (
    <div className={classNameOut}>
      <input
      type="email"
      inputMode="email"
      autoComplete="email"
      className={classNameIn}
      {...props} />
    </div>
  )
}

function TextInput({classNameOut, classNameIn, ...props}) {
  return (
    <div className={classNameOut}>
      <input
      type="text"
      inputMode="text"
      className={classNameIn}
      {...props} />
    </div>
  )
}

function NumberInput({classNameOut, classNameIn, ...props}) {
  return (
    <div className={classNameOut}>
      <input
      type="number"
      inputMode="decimal"
      className={classNameIn}
      {...props} />
    </div>
  )
}

function PasswordInput({
  classNameOut,
  classNameIn,
  autoComplete = "current-password",
  ...props
}) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <div className={cn("flex items-center justify-between", classNameOut)}>
      <input
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className={classNameIn}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {(focused) && (
        <button
          onClick={() => setShow(!show)}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          className="text-grey-primary text-center ml-2"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      )}
    </div>
  )
}

export { Input, EmailInput, PasswordInput, TextInput, NumberInput }
