'use client'


import type { Stall } from "../../types/stall"
import Link from "next/link";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"


export default function Home() {


  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-[400px] h-[300px] items-center flex flex-col justify-center border-1 rounded-md shadow-lg">
        <div className="my-2 flex justify-center items-center flex-col w-full">
          <div>
            <h1 className="font-semibold text-2xl">Choose a Module</h1>
          </div>
          <div className="flex flex-col xl:w-[250px] sm:w-[150px] md:w-[250px] space-y-5 my-5">
            <Button className="bg-primary1 h-11 rounded-md">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button className="bg-primary1 h-11 rounded-md">
              <Link href="/runner">Runner</Link>
            </Button>
            <Button className="bg-primary1 h-11 rounded-md">
              <Link href="/ordering">Ordering</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}