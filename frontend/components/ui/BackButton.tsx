"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string; // Force the developer to specify where it goes
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Button 
      variant="circle" 
      size="icon-lg" 
      asChild
      className="shrink-0" // Prevents it from getting squished in flex containers
    >
      <Link href={href}>
        <ArrowLeft className="w-5 h-5" />
      </Link>
    </Button>
  );
}