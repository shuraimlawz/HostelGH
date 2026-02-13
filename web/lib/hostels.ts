import { api } from "./api";

export type Room = {
    id: string;
    name: string;
    description?: string | null;
    capacity: number;
    totalUnits: number;
    pricePerTerm: number; // minor units (pesewas)
    isActive: boolean;
};

export type HostelDetails = {
    id: string;
    name: string;
    description?: string | null;
    addressLine: string;
    city: string;
    region: string;
    country: string;
    rooms: Room[];
};

export async function fetchPublicHostelById(id: string): Promise<HostelDetails> {
    const res = await api.get(`/hostels/public/${id}`);
    return res.data;
}

export function formatGhs(minor: number) {
    return `GH₵ ${(minor / 100).toFixed(2)}`;
}
