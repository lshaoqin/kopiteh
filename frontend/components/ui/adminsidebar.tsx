"use client";

import { useAuthStore } from "@/stores/auth.store";
import {
    ChartNoAxesCombined,
    SettingsIcon,
    LogOut,
    ClipboardList,
    LayoutGrid,
    Menu,
    X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

function AdminSideBar() {
    const { user, isHydrated, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!isHydrated || !user) return null;

    const menuItems = [
        {
            name: "View Analytics",
            href: "/admin/main/viewanalytics",
            icon: <ChartNoAxesCombined />,
        },
        {
            name: "View Orders",
            href: "/admin/main/vieworders",
            icon: <ClipboardList />,
        },
        {
            name: "Manage Venues",
            href: "/admin/main/managevenues",
            icon: <SettingsIcon />,
        },
        {
            name: "Manage Tables",
            href: "/admin/main/managetables",
            icon: <LayoutGrid />,
        },
    ];

    const handleLogout = async () => {
        try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
                logout();
                router.push("/admin/auth/login");
                return;
            }
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            logout();
            router.push("/admin/auth/login");
        } catch {
            useAuthStore.getState().logout();
            router.push("/admin/auth/login");
        }
    };

    return (
        <>
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-primary1 text-white p-2 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed top-0 left-0 h-screen w-[352px] bg-primary1 rounded-r-xl z-40 transition-transform duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex justify-between flex-col h-full py-5">

                    {/* Logo + username */}
                    <div className="w-full flex justify-center flex-col">
                        <h1 className="text-white font-extrabold text-5xl text-center">VSB</h1>
                        <div className="space-y-2 mt-9">
                            <label className="text-white text-xl pl-[32px] pr-[57px] font-bold">
                                {user.name}
                            </label>
                        </div>
                    </div>

                    {/* Nav items */}
                    <div className="w-full">
                        <ul className="mt-6 space-y-6">
                            {menuItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`);
                                return (
                                    <div
                                        key={item.name}
                                        className={cn(
                                            "w-full",
                                            isActive
                                                ? "bg-white rounded-r-[32px] shadow-sm"
                                                : "bg-transparent"
                                        )}
                                    >
                                        <li className="w-[263px] h-[70px] ml-[32px] mr-[57px]">
                                            <a
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex h-full items-center gap-2 px-4 text-white transition-all",
                                                    isActive
                                                        ? "text-[#048442] rounded-r-[32px] font-bold"
                                                        : "hover:opacity-80"
                                                )}
                                            >
                                                {React.cloneElement(item.icon, {
                                                    className: "h-[55px] w-[47px]",
                                                    strokeWidth: 0.8,
                                                })}
                                                <span className="font-bold text-xl">
                                                    {item.name}
                                                </span>
                                            </a>
                                        </li>
                                    </div>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Logout */}
                    <div className="pl-[32px] pr-[57px]">
                        <Button onClick={handleLogout} variant="logout">
                            <LogOut className="h-[55px] w-[47px]" strokeWidth={0.8} />
                            <label>Log Out</label>
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
}

export { AdminSideBar };