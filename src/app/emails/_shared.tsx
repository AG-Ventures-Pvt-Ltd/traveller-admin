'use client';

import React from 'react';
import { MapPin, Mail } from 'lucide-react';
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

export interface TemplateFieldVariable {
    key: string;
    description: string;
}

export interface TemplateField {
    name: string;
    label: string;
    group: string;
    placeholder?: string;
    type?: 'text' | 'url' | 'textarea';
    variables?: TemplateFieldVariable[];
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

const MARKETING_EMAIL_FIELDS: TemplateField[] = [
    {
        name: 'INNER_CONTENT',
        label: 'Email Content (HTML)',
        group: 'Content',
        type: 'textarea',
        placeholder: '<p style="font-size:16px;color:#1a1a1a;">Hello {{userName}},</p>\n<p>Your message here...</p>',
        variables: [
            { key: '{{userName}}', description: "Recipient's name" },
            { key: '{{userEmail}}', description: "Recipient's email address" },
        ],
    },
];

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
    {
        id: 'marketing_email',
        name: 'Marketing Email',
        description: 'Send a fully custom HTML marketing email to travellers. Write your own content and override footer URLs.',
        icon: <Mail size={20} />,
        apiUrl: api.sendMarketingEmail,
        tripBased: false,
        fields: MARKETING_EMAIL_FIELDS,
        groups: ['Content'],
        htmlFile: 'marketing-email.html',
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
    supportUrl: '#',
    helpCenterUrl: '#',
    termsUrl: '#',
    INNER_CONTENT: '<p style="font-family:Rubik,sans-serif;font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 16px;">Hi <strong>{{userName}}</strong>,</p><p style="font-family:Rubik,sans-serif;font-size:15px;color:#4a5565;line-height:1.7;margin:0;">Your email preview will appear here once you start typing content above.</p>',
};

export function substituteTemplate(html: string, values: Record<string, string>): string {
    return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}
