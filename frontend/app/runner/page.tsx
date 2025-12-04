'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] h-[300px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg">
        <div className="my-2 flex justify-center items-center flex-col w-full">
          <h1 className="font-semibold text-2xl">The Volunteer Switchboard</h1>
          <h2 className="font-semibold text-2xl">Kopi, Teh or Moi</h2>
          <div className="flex flex-col space-y-5 my-5">
            <Button className="bg-primary1 h-11 rounded-md">
              Companion Volunteer
            </Button>
            <Button className="bg-primary1 h-11 rounded-md" onClick={() => router.push('/runner/selectvenue')}>
              Runner
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}