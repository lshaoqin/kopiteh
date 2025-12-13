"use client";

import { useAuthStore } from "@/stores/auth.store"
import { HomeIcon, ChartNoAxesCombined, SettingsIcon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


function AdminSideBar() {
    const { user, isHydrated, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    if (!isHydrated || !user) {
        return null;
    }
    const menuItems = [
        {
            name: "Home",
            href: "/admin/main/home",
            icon: <HomeIcon className="w-6 h-6" />,
        },
        {
            name: "View Analytics",
            href: "/admin/main/viewanalytics",
            icon: <ChartNoAxesCombined className="w-6 h-6" />,
        },
        {
            name: "Manage Stalls",
            href: "/admin/main/managestalls",
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
            <div className="flex justify-between flex-col h-full py-5">
                <div className="w-full flex justify-center flex-col">
                    <h1 className="text-white font-extrabold text-5xl text-center">VSB</h1>
                    <div className="space-y-2 mt-9 flex flex-row">
                        <div>

                        </div>
                        <label className="text-white text-xl pl-[32px] pr-[57px] font-bold">{user.name}</label>
                    </div>
                </div>

                <div className="w-full">
                    <ul className="mt-6 space-y-6 ">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <div key={item.name} className={cn("w-full", isActive ? "bg-white rounded-r-[32px] shadow-sm" : "bg-transparent")}>
                                    <li key={item.name} className="w-[263px] h-[70px] ml-[32px] mr-[57px]">
                                        <a
                                            href={item.href}
                                            className={cn(
                                                "flex h-full items-center gap-2 px-4 text-white transition-all",
                                                isActive
                                                    ? "text-[#048442] rounded-r-[32px] font-bold"
                                                    : "hover:opacity-80"
                                            )}
                                        >
                                            {React.cloneElement(item.icon, { className: "h-[55px] w-[47px]", strokeWidth: 0.8 })}
                                            <span className="font-bold text-xl">{item.name}</span>
                                        </a>
                                    </li>
                                </div>
                            );
                        })}
                    </ul>
                </div>
                <div className="pl-[32px] pr-[57px]">
                    <Button onClick={handleLogout} variant="logout">
                        <LogOut className="h-[55px] w-[47px]" strokeWidth={0.8} />
                        <label>Log Out</label>
                    </Button>
                </div>


            </div>
        </div>
    )
}

export { AdminSideBar }