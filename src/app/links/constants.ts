export interface Link {
    _id: string;
    shortCode: string;
    destinationUrl: string;
    label: string;
    clickCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const REDIRECT_BASE_URL = 'https://wondrr.in/r/';

export const LINK_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];
