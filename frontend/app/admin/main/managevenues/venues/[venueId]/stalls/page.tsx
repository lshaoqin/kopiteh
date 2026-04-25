'use client'

import type { Stall } from "../../../../../../../../types/stall"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { CardHolder } from "@/components/ui/cardholder"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation";
import { CirclePlus, Download } from "lucide-react"
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
    const [exporting, setExporting] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    async function fetchJsonOrThrow(res: Response, fallbackMessage: string) {
        const data = await res.json();
        if (!res.ok || data?.success === false) {
            throw new Error(data?.payload?.message ?? fallbackMessage);
        }
        return data;
    }

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

    const handleToggleRemarks = async (stallId: number, next: boolean) => {
        if (next === undefined || next === null) return; // add this guard
        const prev = stalls;
        setStalls(curr =>
            curr.map(s => (s.stall_id === stallId ? { ...s, allow_remarks: next } : s))
        );
        try {
            const token = useAuthStore.getState().accessToken;
            const res = await fetch(`${API_URL}/stalls/update/${stallId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ allow_remarks: next }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data?.payload?.message);
        } catch {
            setStalls(prev);
        }
    };

    const handleCreate = async ({ name, imageUrl }: { name: string; imageUrl: string }) => {
        try {
            setCreateError(null);
            const trimmedName = name.trim();
            if (!trimmedName) { setCreateError("Stall name is required."); return; }
            setCreating(true);

            let finalImageUrl = imageUrl.trim() || null;
            if (finalImageUrl?.startsWith('data:')) {
                const uploadRes = await fetch(`${API_URL}/upload/base64`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ dataUri: finalImageUrl, folder: 'stalls' }),
                });
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.payload?.data?.imageUrl ?? null;
            }

            const res = await fetch(`${API_URL}/stalls/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ venue_id: Number(venueId), name: trimmedName, stall_image: finalImageUrl }),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false) throw new Error(data?.payload?.message ?? "Failed to create stall");

            setStalls((curr) => [...curr, data.payload?.data]);
            setShowCreateModal(false);
        } catch (err: any) {
            setCreateError(err?.message ?? "Failed to create stall");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async ({ name, imageUrl }: { name: string; imageUrl: string }) => {
        try {
            setUpdateError(null);
            if (!editingStall) { setUpdateError("No stall selected to update."); return; }
            const trimmedName = name.trim();
            if (!trimmedName) { setUpdateError("Stall name is required."); return; }
            setUpdating(true);

            let finalImageUrl = imageUrl.trim() || null;
            if (finalImageUrl?.startsWith('data:')) {
                const uploadRes = await fetch(`${API_URL}/upload/base64`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ dataUri: finalImageUrl, folder: 'stalls' }),
                });
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.payload?.data?.imageUrl ?? null;
            }

            const stallId = editingStall.stall_id;
            const res = await fetch(`${API_URL}/stalls/update/${stallId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ name: trimmedName, stall_image: finalImageUrl }),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false) throw new Error(data?.payload?.message ?? "Failed to update stall");

            setStalls((curr) => curr.map((s) => (s.stall_id === stallId ? { ...s, ...data.payload?.data } : s)));
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

    const handleExportVenueMenu = async () => {
        if (!API_URL) {
            setError("NEXT_PUBLIC_API_URL is not set");
            return;
        }

        const numericVenueId = Number(venueId);
        if (Number.isNaN(numericVenueId)) {
            setError("Invalid venue ID");
            return;
        }

        try {
            setExporting(true);
            setError(null);

            const XLSX = require("xlsx");

            const stallsRes = await fetch(`${API_URL}/stalls/venue/${numericVenueId}`);
            const stallsJson = await fetchJsonOrThrow(stallsRes, "Failed to fetch stalls");
            const venueStalls: Stall[] = stallsJson.payload?.data ?? [];

            const itemRows: any[] = [];
            const variantRows: any[] = [];

            for (const stall of venueStalls) {
                const itemRes = await fetch(`${API_URL}/items/stalls/${stall.stall_id}`);
                const itemJson = await fetchJsonOrThrow(itemRes, `Failed to fetch items for stall ${stall.name}`);
                const stallItems = itemJson.payload?.data ?? [];

                for (const item of stallItems) {
                    itemRows.push([
                        numericVenueId,
                        stall.stall_id,
                        stall.name,
                        item.item_id,
                        item.name,
                        item.category_id ?? "",
                        Number(item.price ?? 0),
                        Boolean(item.is_available),
                        item.prep_time ?? "",
                        item.description ?? "",
                    ]);

                    const sectionsRes = await fetch(`${API_URL}/item-sections/items/${item.item_id}`);
                    const sectionsJson = await fetchJsonOrThrow(
                        sectionsRes,
                        `Failed to fetch variants for item ${item.name}`
                    );
                    const sections = sectionsJson.payload?.data ?? [];

                    for (const section of sections) {
                        const optionsRes = await fetch(`${API_URL}/modifiers/sections/${section.section_id}`);
                        const optionsJson = await fetchJsonOrThrow(
                            optionsRes,
                            `Failed to fetch variant options for section ${section.name}`
                        );
                        const options = optionsJson.payload?.data ?? [];

                        if (options.length === 0) {
                            variantRows.push([
                                numericVenueId,
                                stall.stall_id,
                                stall.name,
                                item.item_id,
                                item.name,
                                section.section_id,
                                section.name,
                                section.min_selections ?? 0,
                                section.max_selections ?? 0,
                                "",
                                "",
                                "",
                                "",
                            ]);
                            continue;
                        }

                        for (const option of options) {
                            variantRows.push([
                                numericVenueId,
                                stall.stall_id,
                                stall.name,
                                item.item_id,
                                item.name,
                                section.section_id,
                                section.name,
                                section.min_selections ?? 0,
                                section.max_selections ?? 0,
                                option.option_id,
                                option.name,
                                Number(option.price_modifier ?? 0),
                                Boolean(option.is_available),
                            ]);
                        }
                    }
                }
            }

            const stallSheet = [
                ["Venue ID", "Stall ID", "Stall Name", "Description", "Image", "Is Open", "Allow Remarks", "Waiting Time"],
                ...venueStalls.map((stall) => [
                    numericVenueId,
                    stall.stall_id,
                    stall.name,
                    stall.description ?? "",
                    stall.stall_image ?? "",
                    Boolean(stall.is_open),
                    Boolean(stall.allow_remarks),
                    stall.waiting_time ?? "",
                ]),
            ];

            const itemSheet = [
                ["Venue ID", "Stall ID", "Stall Name", "Item ID", "Item Name", "Category ID", "Price", "Is Available", "Prep Time", "Description"],
                ...itemRows,
            ];

            const variantSheet = [
                ["Venue ID", "Stall ID", "Stall Name", "Item ID", "Item Name", "Section ID", "Section Name", "Min Selections", "Max Selections", "Option ID", "Option Name", "Price Modifier", "Option Is Available"],
                ...variantRows,
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(stallSheet), "Stalls");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(itemSheet), "Items");
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(variantSheet), "Variants");

            const dateLabel = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `venue_${numericVenueId}_menu_export_${dateLabel}.xlsx`);
        } catch (err: any) {
            setError(err?.message ?? "Failed to export venue menu");
        } finally {
            setExporting(false);
        }
    };

    return (
        <main className="min-h-screen px-6 py-10 flex w-full">
            <div className="flex-1 w-full">
                <div className="flex justify-between">
                    <h1 className="font-bold text-2xl">Stalls</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="py-2 rounded-xl"
                            onClick={handleExportVenueMenu}
                            disabled={exporting || loading}
                        >
                            <Download className="h-4 w-4" />
                            {exporting ? "Exporting..." : "Export Stalls and Items"}
                        </Button>
                        <Button variant="addstall" onClick={() => setShowCreateModal(true)}>
                            <CirclePlus />
                            Add
                        </Button>
                    </div>
                </div>

                {loading && <div className="flex-1 grid place-items-center">
                    <p className="text-primary1">Loading…</p>
                </div>}

                {!loading && !error && stalls.length === 0 && (
                    <p className="mt-4">No stalls found.</p>
                )}

                {!loading && !error && stalls.length > 0 && (
                    <ul className="mt-4 grid grid-cols-1 custom:grid-cols-2 xl:grid-cols-3 gap-10">
                        {stalls.map((s) => (
                            <li key={s.stall_id}>
                                <Link href={`/admin/main/managevenues/venues/${venueId}/stalls/${s.stall_id}/items`}>
                                    <CardHolder
                                        name={s.name}
                                        img={s.stall_image}
                                        variant="default"
                                        isActive={s.is_open}
                                        onActiveChange={(next) => handleToggle(s.stall_id, next)}
                                        allowRemarks={s.allow_remarks}
                                        onRemarksChange={(next) => handleToggleRemarks(s.stall_id, next)}
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