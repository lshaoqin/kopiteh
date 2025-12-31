// app/admin/auth/layout.tsx

import { AdminSideBar } from "@/components/ui/adminsidebar";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      
      <AdminSideBar />

      {/* Right side: individual auth pages */}
      <div className="ml-[352px] flex-1 flex bg-white">
        {children}
      </div>
    </div>
  );
}
