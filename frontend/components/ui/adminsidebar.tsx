"use client";

import { useAuthStore } from "@/stores/auth.store"
import { HomeIcon, ChartNoAxesCombined, SettingsIcon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"

function AdminSideBar() {
    const { user, isHydrated, logout } = useAuthStore();
    const router = useRouter();
    if (!isHydrated || !user) {
        return null;
    }
    const menuItems = [
        {
            name: "Home",
            href: "/admin",
            icon: <HomeIcon className="w-6 h-6" />,
        },
        {
            name: "View Analytics",
            href: "/admin/viewanalytics",
            icon: <ChartNoAxesCombined className="w-6 h-6" />,
        },
        {
            name: "Manage Stalls",
            href: "/admin/managestalls",
            icon: <SettingsIcon className="w-6 h-6" />,
        },
    ];

    const handleLogout = async () => {
        try {
            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                logout();
                router.push("/login");
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refresh_token: refreshToken,
                }),
            });

            await res.json();
            logout();

            router.push("/admin/auth/login");
        } catch (err) {
            useAuthStore.getState().logout();
            router.push("/login");
        }
    };
    return (
        <div className="h-screen w-[352px] bg-primary1 rounded-r-xl">
            <div className="flex justify-between flex-col h-full py-7">
                <div className="w-full flex justify-center flex-col">
                    <h1 className="text-white font-bold text-5xl text-center">VSB</h1>
                    <div className="space-y-2">
                        <div>

                        </div>
                        <label className="text-white text-xl">{user.name}</label>
                    </div>
                </div>

                <div className="w-full pl-[32px] pr-[57px]">
                    <ul className="mt-6 space-y-6">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <a
                                    href={item.href}
                                    className="flex items-center gap-3 text-white hover:opacity-80"
                                >
                                    {item.icon}
                                    <span className="text-lg">{item.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="pl-[32px] pr-[57px]">
                    <Button onClick={handleLogout} variant="logout">
                        <LogOut className="size-[32px]"/>
                        <label>Log Out</label>
                    </Button>
                </div>


            </div>
        </div>
    )
}

export { AdminSideBar }