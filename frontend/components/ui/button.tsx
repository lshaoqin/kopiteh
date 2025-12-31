"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation";

// Define button variants with CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary2",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        signin: "bg-primary1 hover:bg-grey-primary/70 text-white py-3 rounded-xl",
        logout: "justify-start text-xl w-full py-4 text-white h-auto hover:opacity-80 font-bold",
        add: "rounded-lg p-2 shadow-sm bg-gray-200 gap-2 hover:bg-gray-300",
        back: "px-0 text-base font-normal gap-2 text-black hover:bg-transparent hover:text-green-600 hover:underline",
        addstall: "rounded-2xl p-2 text-white bg-primary1 font-semibold",
        backcreatestall: "gap-0 bg-transparent hover:bg-transparent",
        editstall: "gap-0 bg-transparent hover:bg-transparent",
        deletestall: "py-2 rounded-2xl font-bold bg-delete text-white hover:bg-delete/70",
        updatestall: "py-2 rounded-2xl font-bold bg-primary1 text-white hover:bg-primary1/70"
      },
      size: {
        default: "px-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        bare: "p-0 h-auto w-auto"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// ✅ Create a prop type that merges VariantProps from CVA + native props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

export function BackButton({ href = "/" }) {
  const router = useRouter();

  return (
    <Button
      variant="back"
      onClick={() => router.push(href)}
    >
      <ArrowLeft className="size-5 text-green-600" />
      Back
    </Button>
  )
}

export function AddButton({ href = "/" }) {
  const router = useRouter();

  return (
    <Button 
      variant="add"
      onClick={() => router.push(href)}
    >
      <Plus className="size-5 text-green-600" />
    </Button>
  )
}



Button.displayName = "Button"

export { Button, buttonVariants }
