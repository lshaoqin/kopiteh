import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-slate-200 text-[10px] px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}