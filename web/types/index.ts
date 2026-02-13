export interface Room {
    id: string;
    name: string;
    images?: string[];
    capacity: number;
    pricePerTerm: number;
    isActive?: boolean;
}

export interface Hostel {
    id: string;
    name: string;
    city: string;
    addressLine: string;
    description?: string;
    images?: string[];
    amenities?: string[];
    university?: string;
    isPublished?: boolean;
    rooms?: Room[];
    owner?: {
        firstName?: string;
        lastName?: string;
        email: string;
    };
}

export interface Booking {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    tenant: {
        firstName?: string;
        lastName?: string;
        email: string;
    };
    hostel: Hostel;
    items?: {
        id: string;
        roomId: string;
        quantity: number;
        unitPrice: number;
        room: Room;
    }[];
}
