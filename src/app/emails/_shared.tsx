'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { api } from '@/common/constants/api.urls';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserOption {
    _id: string;
    email: string;
    username: string;
}

export interface TripSummary {
    slug: string;
    name: string;
    imageUrl: string | null;
    price: string | null;
    duration: string | null;
    groupSize: string | null;
    tripUrl: string;
    discount?: string;
}

export interface TemplateField {
    name: string;
    label: string;
    group: string;
    placeholder?: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    apiUrl: string;
    tripBased?: boolean;
    fields: TemplateField[];
    groups: string[];
    htmlFile: string;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const USER_ENGAGEMENT_GENERAL_FIELDS: TemplateField[] = [];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'user_engagement_with_trips',
        name: 'User Engagement with Trips',
        description: 'Showcase up to 3 featured trips with pricing, duration, and group size to re-engage travellers.',
        icon: <MapPin size={20} />,
        apiUrl: api.sendEngagementEmail,
        tripBased: true,
        fields: USER_ENGAGEMENT_GENERAL_FIELDS,
        groups: ['General'],
        htmlFile: 're-engagement.html',
    },
];

// ─── Shared Styles ────────────────────────────────────────────────────────────

export const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
};

// ─── Template substitution ────────────────────────────────────────────────────

export const PREVIEW_DEFAULTS: Record<string, string> = {
    ICON_BASE_URL: 'https://d1hjk5b7z017su.cloudfront.net/production/email_images/icons',
    bannerImageUrl: 'https://d1hjk5b7z017su.cloudfront.net/production/email_images/banners/banner1.png',
    privacyUrl: 'https://wondrr.in/privacy-policy',
    instagramUrl: 'https://www.instagram.com/wondrr.in/',
    linkedinUrl: 'https://www.linkedin.com/company/wondrr',
    facebookUrl: 'https://www.instagram.com/wondrr.in/',
    twitterUrl: 'https://twitter.com/wondrr',
    exploreAllTripsUrl: 'https://wondrr.in/trips',
    travelExpertsUrl: 'https://wondrr.in/trips',
    unsubscribeUrl: 'https://wondrr.in/unsubscribe',
    helpCenterUrl: '#',
    termsUrl: '#',
};

export function substituteTemplate(html: string, values: Record<string, string>): string {
    return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}
