import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton({ href = "/" }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="px-0 text-base font-normal hover:bg-transparent gap-2 text-black"
      onClick={() => router.push(href)}
    >
      <ArrowLeft className="size-5 text-green-600" />
      Back
    </Button>
  )
}
