export interface Host {
    _id: string;
    fullName?: string;
    username?: string;
    email?: string;
    avatar?: string;
}

export interface TripLocation {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    coordinates?: number[];
}

export interface ItineraryDay {
    day: number;
    title?: string;
    description?: string[];
}

export interface PricingTier {
    label: string;
    description?: string;
    pricePerPerson: number;
    maxQuantity?: number;
    bookedQuantity?: number;
}

export interface AddOn {
    label: string;
    category?: string;
    pricePerPerson: number;
    maxQuantity?: number;
    bookedQuantity?: number;
}

export interface Pricing {
    currency: string;
    isAdvanceBookingAllowed?: boolean;
    advanceBookingPrice?: number;
    pricings?: PricingTier[];
    addOns?: AddOn[];
}

export interface Faq {
    question: string;
    answer: string;
}

export interface RefundTier {
    daysBeforeCancellation: number;
    refundPercentage: number;
}

export interface CancellationPolicy {
    refundTiers?: RefundTier[];
}

export interface MeetingPointLocation {
    name?: string;
}

export interface MeetingPoint {
    location?: MeetingPointLocation;
    pickupPrice?: number;
}

export interface DropPoint {
    _id: string;
    name?: string;
}

export interface TripBatch {
    _id: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    totalSeats: number;
    bookedSeats?: number;
    externalBookedSeats?: number;
    isCompleted?: boolean;
    meetingPoint?: MeetingPoint[];
    dropPoint?: DropPoint[];
}

export interface Review {
    _id: string;
    username: string;
    rating: number;
    review: string;
    createdAt: string;
}

export interface Hotel {
    _id: string;
    name: string;
    city: string;
    state: string;
    images: string[];
}

export interface Highlight {
    title?: string;
    image?: string;
}

export interface Accommodation {
    name?: string;
    address?: string;
    images?: string[];
}

export interface Trip {
    _id: string;
    title: string;
    description?: string;
    additionalInfo?: string;
    status: string;
    type?: string;
    difficulty?: string;
    rating?: number;
    totalReviews?: number;
    isFeatured?: boolean;
    isFemaleOnly?: boolean;
    bestTimeToVisit?: string;
    slug?: string;
    createdAt: string;
    location?: TripLocation;
    host?: Host;
    tags?: string[];
    category?: string[];
    inclusions?: string[];
    exclusions?: string[];
    thingsToCarry?: string[];
    highlights?: Highlight[];
    accommodation?: Accommodation[];
    tripImages?: string[];
    itinerary?: ItineraryDay[];
    batches?: TripBatch[];
    pricing?: Pricing;
    faqs?: Faq[];
    cancellationPolicy?: CancellationPolicy;
    metaTitle?: string;
    metaDescription?: string;
    views?: Record<string, number>;
    shares?: Record<string, number>;
    hasAdminReview?: boolean;
    itineraryDaysCount?: number;
}

export const INDIAN_STATES = [
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'CG', name: 'Chhattisgarh' },
    { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu' },
    { code: 'DL', name: 'Delhi' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JK', name: 'Jammu & Kashmir' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OD', name: 'Odisha' },
    { code: 'PY', name: 'Puducherry' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UK', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
];
