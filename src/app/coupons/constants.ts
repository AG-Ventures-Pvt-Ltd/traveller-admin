export interface Coupon {
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed' | 'people_count';
    discountValue: number;
    numberOfPeople?: number;
    maxUsageCount: number | null;
    currentUsageCount: number;
    maxUsagePerUser: number;
    createdByType: 'admin' | 'host';
    tripApplicable: string | null;
    trip?: { _id: string; title: string };
    startDate: string;
    endDate: string;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CouponUsage {
    _id: string;
    couponId: string;
    userId: string;
    user?: {
        _id: string;
        fullName: string;
        email: string;
        username: string;
        avatar?: string;
    };
    bookingId: string;
    discountApplied: number;
    orderAmount: number;
    createdAt: string;
}

export const DISCOUNT_TYPES = [
    { label: 'Percentage (%)', value: 'percentage' },
    { label: 'Fixed Amount (₹)', value: 'fixed' },
    { label: 'Per Person (₹/person)', value: 'people_count' },
];

export const COUPON_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export const CREATED_BY_OPTIONS = [
    { label: 'Admin', value: 'admin' },
    { label: 'Host', value: 'host' },
];
