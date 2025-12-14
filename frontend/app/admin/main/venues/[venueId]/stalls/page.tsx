'use client'

import type { Stall } from "../../../../../../../types/stall"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { CardHolder } from "@/components/ui/cardholder"
import { useParams } from "next/navigation";

export default function Stalls() {
    const { venueId } = useParams<{ venueId: string }>();
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user, isHydrated, logout } = useAuthStore();
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        const loadStall = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/stalls/venue/${venueId}`);
                const data = await res.json();
                if (!res.ok || data.success === false) {
                    throw new Error(data?.payload?.message ?? "Failed to fetch venues");
                }
                setStalls(data.payload?.data ?? []);
            } catch (err: any) {
                setError(err.message ?? "There is an error in our server, please try again later.");
                setStalls([]);
            } finally {
                setLoading(false);
            }
        }
        if (venueId) loadStall();
    }, [API_URL, venueId]);

    const handleToggle = (stallId: string, next: boolean) => {
        setStalls(prev =>
            prev.map(s => (s.stall_id === stallId ? { ...s, is_open: next } : s))
        );
    };
    return (
        <main className="min-h-screen px-6 py-10 flex">
            <div className="flex-1 w-full ">
                <h1 className="font-bold text-2xl">Stalls</h1>
                {loading && <div className="flex-1 grid place-items-center">
                    <p className="text-primary1">No stalls yet…</p>
                </div>}

                {!loading && !error && stalls.length === 0 && (
                    <p className="mt-4">No stalls found.</p>
                )}

                {!loading && !error && stalls.length > 0 && (
                    <ul className="mt-4 grid grid-cols-3">
                        {stalls.map((s) => (
                            <li key={s.stall_id}>
                                <CardHolder name={s.name} img={s.image_url} variant="stall" isActive={s.is_open} onActiveChange={(next) => handleToggle(s.stall_id, next)} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    )
}