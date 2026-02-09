export interface Host {
    name: string;
    avatar: string;
}

export interface Trip {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    address: string;
    host: Host;
    isCompleted: boolean;
    maxCapacity: number;
    tags: string[];
    price: number;
    cancellationPolicy: string;
    previewImages: string[];
    joinedUsers: string[];
    onShowPolicyModal?: () => void;
}

export const HOSTS: Host[] = [
    { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1890ff&color=fff' },
    { name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=1890ff&color=fff' },
    { name: 'Mike Brown', avatar: 'https://ui-avatars.com/api/?name=Mike+Brown&background=1890ff&color=fff' },
    { name: 'Emily White', avatar: 'https://ui-avatars.com/api/?name=Emily+White&background=1890ff&color=fff' },
    { name: 'Chris Green', avatar: 'https://ui-avatars.com/api/?name=Chris+Green&background=1890ff&color=fff' },
];

export const TAGS_LIST = [
    ['Adventure', 'Nature'],
    ['Culture', 'History'],
    ['Beach', 'Relax'],
    ['Hiking', 'Mountains'],
    ['City', 'Nightlife'],
    ['Wildlife'],
    ['Photography'],
    ['Food', 'Local'],
    ['Luxury'],
    ['Budget'],
];

export const ADDRESSES = [
    '123 Main St, New York, USA',
    '456 Beach Rd, Miami, USA',
    '789 Hilltop, Denver, USA',
    '321 Lakeview, Toronto, Canada',
    '654 Old Town, Rome, Italy',
    '987 Sakura St, Tokyo, Japan',
    '111 Champs Elysees, Paris, France',
    '222 Harbour, Sydney, Australia',
    '333 Amazon Ave, Manaus, Brazil',
    '444 Safari Rd, Nairobi, Kenya',
];

export const CANCELLATION_POLICIES = [
    'Flexible',
    'Moderate',
    'Strict',
    'Super Strict',
];

export const PREVIEW_IMAGES = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
];

export const JOINED_USERS = [
    ['Alice', 'Bob'],
    ['Charlie', 'Diana', 'Eve'],
    ['Frank'],
    ['Grace', 'Heidi', 'Ivan', 'Judy'],
    ['Mallory'],
    ['Oscar', 'Peggy'],
    ['Sybil', 'Trent'],
    ['Victor', 'Walter'],
    ['Xavier'],
    ['Yvonne', 'Zack'],
];

export const POLICY_DETAILS: Record<string, string[]> = {
    'Flexible': [
        'Full refund 1 day prior to arrival',
        'Partial refund after that',
        'No refund after trip starts'
    ],
    'Moderate': [
        'Full refund 5 days prior to arrival',
        'Partial refund after that',
        'No refund after trip starts'
    ],
    'Strict': [
        '50% refund up to 1 week before arrival',
        'No refund after that'
    ],
    'Super Strict': [
        'No refund after booking',
        'Special cases may apply'
    ]
};
