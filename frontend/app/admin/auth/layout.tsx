// app/admin/auth/layout.tsx

import { AuthSidebar } from "@/components/ui/authsidebar";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      
      <AuthSidebar />

      {/* Right side: individual auth pages */}
      <div className="flex-1 flex items-center justify-center bg-white">
        {children}
      </div>
    </div>
  );
}
