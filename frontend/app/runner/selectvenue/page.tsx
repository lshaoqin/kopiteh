"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="p-2">
      <Button onClick={() => router.push('/runner')}>
        Back
      </Button>
      <div>
        Hey Runner
        Select your venue
      </div>
    </main>
  )
}