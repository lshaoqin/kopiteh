"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RoleSelectionPage() {
  return (
    <main className="relative min-h-screen w-full bg-slate-50 overflow-hidden flex flex-col items-center justify-center font-sans text-slate-600">
      
      {/* Back to Module Selection */}
      <Link href="/" className="absolute top-6 left-6 z-20 p-2 rounded-full hover:bg-white/50 transition-colors">
        <ArrowLeft className="w-6 h-6 text-slate-600" />
      </Link>

      {/* --- Background Decorative Elements --- */}
      <div className="absolute -top-[15%] -right-[30%] w-[600px] h-[600px] bg-gray-200 rounded-full z-0 pointer-events-none" />
      <div className="absolute -bottom-[15%] -left-[30%] w-[500px] h-[500px] bg-gray-200 rounded-full z-0 pointer-events-none" />
      <div className="absolute top-[12%] left-[15%] w-12 h-10 bg-slate-500 rounded-[50%] z-0 rotate-12 opacity-80 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-10 h-8 bg-slate-500 rounded-[50%] z-0 -rotate-12 opacity-80 pointer-events-none" />

      {/* --- Main Content --- */}
      <div className="z-10 w-full max-w-sm px-8 flex flex-col gap-10">
        
        {/* Divider text */}
        <div className="flex items-center w-full gap-3">
          <div className="h-[2px] bg-slate-400 flex-1"></div>
          <h1 className="text-3xl font-bold text-slate-600 pb-1">Ordering as</h1>
          <div className="h-[2px] bg-slate-400 flex-1"></div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-6 w-full">
          {/* Companion -> Goes to Table Selection */}
          <Link href="/ordering/table" className="w-full">
            <Button 
              className="w-full h-24 text-lg font-semibold bg-slate-600 hover:bg-slate-700 text-white shadow-xl rounded-md"
            >
              Companion Volunteer
            </Button>
          </Link>

          {/* Runner -> Exits Ordering flow to Runner flow */}
          <Link href="/ordering/table" className="w-full">
            <Button 
              className="w-full h-24 text-lg font-semibold bg-slate-600 hover:bg-slate-700 text-white shadow-xl rounded-md"
            >
              Runner
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}