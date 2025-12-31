'use client'

import type { Stall } from "../../../../../../../../types/stall"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { CardHolder } from "@/components/ui/cardholder"
import { Button, BackButton } from "@/components/ui/button"
import { useParams } from "next/navigation";
import { CirclePlus, ArrowLeft } from "lucide-react"
import { AdminStallModal } from "@/components/ui/admin/adminstallmodal"

export default function Stalls() {
    const { venueId } = useParams<{ venueId: string }>();
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user, isHydrated, logout, accessToken } = useAuthStore();
    const [showCreate, setShowCreate] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
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

    const handleToggle = async (stallId: string, next: boolean) => {
        const prev = stalls;
        setStalls(curr =>
            curr.map(s => (s.stall_id === stallId ? { ...s, is_open: next } : s))
        );

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const token = useAuthStore.getState().accessToken;

            const res = await fetch(`${API_URL}/stalls/update/${stallId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_open: next }),
            });

            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to update stall");
            }

        } catch (err) {
            setStalls(prev);
        }
    };

    const handleCreate = async ({
        name,
        imageUrl,
    }: {
        name: string;
        imageUrl: string;
    }) => {
        try {
            setCreateError(null);

            const trimmedName = name.trim();
            if (!trimmedName) {
                setCreateError("Stall name is required.");
                return;
            }

            setCreating(true);

            const token = useAuthStore.getState().accessToken;

            const res = await fetch(`${API_URL}/stalls/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    venue_id: Number(venueId),
                    name: trimmedName,
                    stall_image: imageUrl.trim() ? imageUrl.trim() : null,
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to create stall");
            }

            const created = data.payload?.data;

            setStalls((curr) => [...curr, created]);
            setShowCreate(false);
        } catch (err: any) {
            setCreateError(err?.message ?? "Failed to create stall");
        } finally {
            setCreating(false);
        }
    };



    return (
        <main className="min-h-screen px-6 py-10 flex w-full">
            <div className="flex-1 w-full">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">Stalls</h1>
                    <Button variant="addstall" onClick={() => setShowCreate(true)}>
                        <CirclePlus />
                        Add
                    </Button>
                </div>

                {loading && <div className="flex-1 grid place-items-center">
                    <p className="text-primary1">Loading…</p>
                </div>}

                {!loading && !error && stalls.length === 0 && (
                    <p className="mt-4">No stalls found.</p>
                )}

                {!loading && !error && stalls.length > 0 && (
                    <ul className="mt-4 grid grid-cols-3 gap-y-10">
                        {stalls.map((s) => (
                            <li key={s.stall_id}>
                                <CardHolder name={s.name} img={s.stall_image} variant="stall" isActive={s.is_open} onActiveChange={(next) => handleToggle(s.stall_id, next)} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {showCreate && (
                <AdminStallModal 
                    open={showCreate}
                    title="New Stall"
                    labelName="Stall name"
                    labelImage="Paste Image URL"
                    submitText="Create"
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreate}
                />
        
            )}
        </main>
    )
}