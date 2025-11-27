// app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthContext>{children}</AuthContext>;
}
