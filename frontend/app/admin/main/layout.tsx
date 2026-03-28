import { AdminSideBar } from "@/components/ui/adminsidebar";

export default function AdminAuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            <AdminSideBar />
            <div className="md:ml-[352px] flex-1 flex bg-white pt-14 md:pt-0 overflow-hidden min-w-0">
                {children}
            </div>
        </div>
    );
}