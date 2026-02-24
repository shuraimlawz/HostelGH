// Auth
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'TENANT' | 'OWNER' | 'ADMIN';
    profileImage?: string;
    createdAt: Date;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Hostel
export interface Hostel {
    id: string;
    name: string;
    description: string;
    city: string;
    region: string;
    whatsappNumber?: string;
    distanceToCampus?: number;
    priceRange: {
        min: number;
        max: number;
    };
    rating: number;
    reviewCount: number;
    imageUrl: string;
    isPublished: boolean;
}

export interface Room {
    id: string;
    hostelId: string;
    name: string;
    capacity: number;
    pricePerTerm: number;
    gender?: string;
    hasAC: boolean;
    totalUnits: number;
    availableSlots: number;
    utilities?: string[];
    images?: string[];
}

export interface HostelDetail extends Hostel {
    images: string[];
    rooms: Room[];
    facilities: Facility[];
    policies: string;
    owner: {
        id: string;
        name: string;
        whatsappNumber?: string;
        rating: number;
    };
}

export interface Facility {
    id: string;
    name: string;
    type: 'FREE' | 'PAID';
}

// Booking
export interface Booking {
    id: string;
    hostelId: string;
    roomId: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    quantity: number;
    levelOfStudy?: string;
    guardianName?: string;
    guardianPhone?: string;
    admissionDocUrl?: string;
    passportPhotoUrl?: string;
    createdAt: Date;
}

export interface BookingDetail extends Booking {
    hostel: Hostel;
    room: Room;
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
}

// Payment
export interface Payment {
    id: string;
    bookingId: string;
    provider: 'PAYSTACK' | 'MOBILE_MONEY';
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    amount: number;
    platformFee: number;
    reference: string;
    authorizationUrl?: string;
    paidAt?: Date;
}

export interface PaystackInitResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}

// Search/Filter
export interface SearchParams {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    amenities?: string[];
    rating?: number;
    distanceToCampus?: number;
    sortBy?: 'price' | 'rating' | 'distance';
}
