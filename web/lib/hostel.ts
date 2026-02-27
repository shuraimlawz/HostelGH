import { api } from "./api";

export type Hostel = {
    id: string;
    name: string;
    city: string;
    addressLine: string;
    description?: string | null;
};

export async function fetchPublicHostels(city?: string, sort: string = "relevance"): Promise<Hostel[]> {
    const params: any = {};
    if (city) params.city = city;
    if (sort) params.sort = sort;
    const res = await api.get("/hostels/public", { params });
    return res.data;
}
