import { api } from "./api";

export type Hostel = {
    id: string;
    name: string;
    city: string;
    addressLine: string;
    description?: string | null;
};

export async function fetchPublicHostels(city?: string): Promise<Hostel[]> {
    const res = await api.get("/hostels/public", { params: city ? { city } : {} });
    return res.data;
}
