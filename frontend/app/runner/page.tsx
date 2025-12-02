'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-2">
      <div>
        <Button className="bg-primary1 h-11 rounded-md">
          Companion Volunteer
        </Button>
        <Button className="bg-primary1 h-11 rounded-md" onClick={() => router.push('/runner/selectvenue')}>
          Runner
        </Button>
      </div>
    </main>
  )
}