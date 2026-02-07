'use client'

import type { Stall } from "../../../../../../../../types/stall"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { CardHolder } from "@/components/ui/cardholder"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation";
import { CirclePlus } from "lucide-react"
import { AdminStallModal } from "@/components/ui/admin/adminstallmodal"
import Link from "next/link"

export default function Stalls() {
    const { venueId } = useParams<{ venueId: string }>();
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user, isHydrated, logout, accessToken } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [editingStall, setEditingStall] = useState<Stall>(null)
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

    const handleToggle = async (stallId: number, next: boolean) => { // changed stallId type to number
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

            const res = await fetch(`${API_URL}/stalls/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
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
            setShowCreateModal(false);
        } catch (err: any) {
            setCreateError(err?.message ?? "Failed to create stall");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async ({
        name,
        imageUrl,
    }: {
        name: string;
        imageUrl: string;
    }) => {
        try {
            setUpdateError(null);

            if (!editingStall) {
                setUpdateError("No stall selected to update.");
                return;
            }

            const trimmedName = name.trim();
            if (!trimmedName) {
                setUpdateError("Stall name is required.");
                return;
            }

            setUpdating(true);

            const stallId = editingStall.stall_id;

            const res = await fetch(`${API_URL}/stalls/update/${stallId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: trimmedName,
                    stall_image: imageUrl.trim() ? imageUrl.trim() : null,
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to update stall");
            }

            const updated = data.payload?.data;

            setStalls((curr) =>
                curr.map((stall) =>
                    stall.stall_id === stallId ? { ...stall, ...updated } : stall
                )
            );

            setShowUpdateModal(false);
            setEditingStall(null);
        } catch (err: any) {
            setUpdateError(err?.message ?? "Failed to update stall");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteStall = async () => {
        if (!editingStall) return;

        try {
            setUpdateError(null);   
            setUpdating(true);

            const stallId = editingStall.stall_id;

            const res = await fetch(`${API_URL}/stalls/remove/${stallId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to delete stall");
            }

            setStalls((curr) => curr.filter((s) => s.stall_id !== stallId));
            setShowUpdateModal(false);
            setEditingStall(null);
        } catch (err: any) {
            setUpdateError(err?.message ?? "Failed to delete stall");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <main className="min-h-screen px-6 py-10 flex w-full">
            <div className="flex-1 w-full">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">Stalls</h1>
                    <Button variant="addstall" onClick={() => setShowCreateModal(true)}>
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
                    <ul className="mt-4 grid grid-cols-3 gap-10">
                        {stalls.map((s) => (
                            <li key={s.stall_id}>
                                <Link href={`/admin/main/managevenues/venues/${venueId}/stalls/${s.stall_id}/items`}>
                                    <CardHolder
                                        name={s.name}
                                        img={s.stall_image}
                                        variant="default"
                                        isActive={s.is_open}
                                        onActiveChange={(next) => handleToggle(s.stall_id, next)}
                                        onEdit={() => {
                                            setEditingStall(s);
                                            setShowUpdateModal(true);
                                        }}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {showCreateModal && (
                <AdminStallModal
                    open={showCreateModal}
                    title="New Stall"
                    labelName="Stall Name"
                    labelImage="Paste Stall Thumbnail"
                    submitText="Create"
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                />
            )}
            {showUpdateModal && (
                <AdminStallModal
                    open={showUpdateModal}
                    title="Edit Stall"
                    labelName="Stall Name"
                    labelImage="Paste Image URL"
                    submitText="Update"
                    deleteText="Delete"
                    onClose={() => {
                        setShowUpdateModal(false);
                        setEditingStall(null);
                    }}
                    initialName={editingStall.name}
                    initialImageUrl={editingStall.stall_image ?? ""}
                    onSubmit={handleUpdate}
                    onDelete={handleDeleteStall}
                />
            )}
        </main>
    )
}