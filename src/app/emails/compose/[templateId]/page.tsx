'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Card, Form, Input, Button, Typography, ConfigProvider, theme,
    Tag, message, Radio, AutoComplete, Spin, Tooltip, Skeleton,
} from 'antd';
import type { InputRef } from 'antd';
import { ArrowLeft, Send, Users, User, MapPin, X, Plus, ImageOff, Clock, UsersRound, Ticket } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useGetData } from '@/services/useGetData';
import { usePostData } from '@/services/usePostData';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';

const CF = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? '';
const cfUrl = (path: string | null | undefined) =>
    path ? (path.startsWith('http') ? path : `${CF}${path}`) : '';

import {
    EMAIL_TEMPLATES, PREVIEW_DEFAULTS, substituteTemplate,
    cardStyle, type TripSummary, type UserOption,
} from '../../_shared';

const { Title, Text } = Typography;

// ─── Trip preview card ────────────────────────────────────────────────────────

function TripPreviewCard({
    trip, index, onRemove, onDiscountChange,
}: {
    trip: TripSummary;
    index: number;
    onRemove: (slug: string) => void;
    onDiscountChange: (slug: string, value: string) => void;
}) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, overflow: 'hidden',
        }}>
            <div style={{ display: 'flex' }}>
                <div style={{
                    width: 100, minHeight: 100, flexShrink: 0,
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                    {trip.imageUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={cfUrl(trip.imageUrl)} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ImageOff size={20} color="#555" />
                    }
                </div>
                <div style={{ flex: 1, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Text style={{ color: '#a0a0a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Trip {index + 1}
                            </Text>
                            <Text strong style={{ color: '#fff', display: 'block', fontSize: 14, marginBottom: 6 }}>
                                {trip.name}
                            </Text>
                        </div>
                        <Tooltip title="Remove trip">
                            <Button type="text" size="small" icon={<X size={14} />}
                                onClick={() => onRemove(trip.slug)}
                                style={{ color: '#ff4d4f', padding: 4, marginLeft: 8 }} />
                        </Tooltip>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 8 }}>
                        {trip.price && <span style={{ color: '#52c41a', fontSize: 13 }}><Ticket size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{trip.price}</span>}
                        {trip.duration && <span style={{ color: '#aaa', fontSize: 13 }}><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{trip.duration}</span>}
                        {trip.groupSize && <span style={{ color: '#aaa', fontSize: 13 }}><UsersRound size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{trip.groupSize}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>Discount (optional):</Text>
                        <Input
                            size="small"
                            placeholder="e.g. 15% off"
                            value={trip.discount ?? ''}
                            onChange={e => onDiscountChange(trip.slug, e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, maxWidth: 140 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Compose + Preview page ───────────────────────────────────────────────────

export default function ComposePage() {
    const router = useRouter();
    const params = useParams<{ templateId: string }>();
    const templateId = params?.templateId ?? '';

    const template = EMAIL_TEMPLATES.find(t => t.id === templateId) ?? null;

    const [form] = Form.useForm();
    const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
    const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [slugInput, setSlugInput] = useState('');
    const [fetchingSlug, setFetchingSlug] = useState(false);
    const [addedTrips, setAddedTrips] = useState<TripSummary[]>([]);
    const [previewName, setPreviewName] = useState('Riya Sharma');
    const [rawHtml, setRawHtml] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const slugInputRef = useRef<InputRef>(null);

    // Load template HTML
    useEffect(() => {
        if (!template?.htmlFile) return;
        fetch(`/email-templates/${template.htmlFile}`)
            .then(r => r.text())
            .then(setRawHtml)
            .catch(() => messageApi.error('Failed to load email template preview.'));
    }, [template?.htmlFile, messageApi]);

    // Watch form field changes to trigger preview recompute
    const formValues = Form.useWatch([], form) as Record<string, string> | undefined;

    // Build substitution values from current state
    const previewValues = useMemo<Record<string, string>>(() => {
        const vals: Record<string, string> = {
            ...PREVIEW_DEFAULTS,
            userName: previewName || 'Preview User',
        };

        // Inject trip data
        addedTrips.forEach((trip, i) => {
            const n = i + 1;
            vals[`trip${n}Name`] = trip.name ?? '';
            vals[`trip${n}ImageUrl`] = cfUrl(trip.imageUrl);
            vals[`trip${n}Price`] = trip.price ?? '';
            vals[`trip${n}Duration`] = trip.duration ?? '';
            vals[`trip${n}GroupSize`] = trip.groupSize ?? '';
            vals[`trip${n}Discount`] = trip.discount ?? '';
            vals[`trip${n}Url`] = trip.tripUrl ?? '#';
        });

        // Inject manual form fields
        if (formValues) {
            Object.entries(formValues).forEach(([k, v]) => {
                if (v) vals[k] = v;
            });
        }

        return vals;
    }, [addedTrips, formValues, previewName]);

    const previewHtml = useMemo(
        () => rawHtml ? substituteTemplate(rawHtml, previewValues) : null,
        [rawHtml, previewValues]
    );

    // User search
    const { data: searchData, isLoading: searching } = useGetData({
        key: ['user-email-search', searchEmail],
        url: api.getClientUsers,
        params: searchEmail.length >= 2 ? { search: searchEmail, limit: 8, page: 1 } : {},
    });

    const searchOptions = useMemo(() =>
        searchEmail.length >= 2
            ? ((searchData?.data?.data ?? []) as UserOption[])
                .filter((u: UserOption) => !selectedUsers.find(s => s._id === u._id))
                .map((u: UserOption) => ({
                    value: u.email,
                    label: (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 13 }}>{u.email}</span>
                            <span style={{ color: '#8c8c8c', fontSize: 11 }}>@{u.username}</span>
                        </div>
                    ),
                    user: u,
                }))
            : [],
        [searchData, searchEmail, selectedUsers]
    );

    const { mutate: sendEmail, isPending } = usePostData<
        unknown,
        { templateFields: Record<string, string>; recipients: 'all' | string[] }
    >(template?.apiUrl ?? '', {
        onSuccess: (data: unknown) => {
            const res = data as { data?: { queued?: number } };
            messageApi.success(`Emails queued for ${res?.data?.queued ?? '?'} user(s)!`);
            router.push('/emails');
        },
        onError: () => {
            messageApi.error('Failed to send emails. Please try again.');
        },
    });

    const handleAddTrip = async () => {
        const slug = slugInput.trim().toLowerCase();
        if (!slug) return;
        if (addedTrips.length >= 3) { messageApi.warning('You can add at most 3 trips.'); return; }
        if (addedTrips.find(t => t.slug === slug)) { messageApi.warning('This trip is already added.'); return; }
        setFetchingSlug(true);
        try {
            const res = await baseAPI.get(api.getTripSummaryBySlug(slug));
            setAddedTrips(prev => [...prev, res.data?.data as TripSummary]);
            setSlugInput('');
        } catch {
            messageApi.error(`Trip "${slug}" not found or not published.`);
        } finally {
            setFetchingSlug(false);
        }
    };

    const handleRemoveTrip = useCallback((slug: string) => {
        setAddedTrips(prev => prev.filter(t => t.slug !== slug));
    }, []);

    const handleDiscountChange = useCallback((slug: string, value: string) => {
        setAddedTrips(prev => prev.map(t => t.slug === slug ? { ...t, discount: value } : t));
    }, []);

    const handleSelectUser = useCallback((_value: string, option: { user: UserOption }) => {
        setSelectedUsers(prev => [...prev, option.user]);
        setSearchEmail('');
    }, []);

    const handleRemoveUser = useCallback((id: string) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== id));
    }, []);

    const handleSubmit = (values: Record<string, string>) => {
        if (!template) return;
        if (template.tripBased && addedTrips.length === 0) { messageApi.warning('Please add at least one trip.'); return; }
        if (recipientMode === 'selected' && selectedUsers.length === 0) {
            messageApi.warning('Please add at least one recipient or switch to "All Travellers".');
            return;
        }

        const templateFields: Record<string, string> = {};
        if (template.tripBased) {
            addedTrips.forEach((trip, i) => {
                const n = i + 1;
                templateFields[`trip${n}Name`] = trip.name;
                if (trip.imageUrl) templateFields[`trip${n}ImageUrl`] = cfUrl(trip.imageUrl);
                if (trip.price) templateFields[`trip${n}Price`] = trip.price;
                if (trip.duration) templateFields[`trip${n}Duration`] = trip.duration;
                if (trip.groupSize) templateFields[`trip${n}GroupSize`] = trip.groupSize;
                if (trip.discount) templateFields[`trip${n}Discount`] = trip.discount;
                templateFields[`trip${n}Url`] = trip.tripUrl;
            });
        }
        template.fields.forEach(f => { if (values[f.name]) templateFields[f.name] = values[f.name]; });

        sendEmail({
            templateFields,
            recipients: recipientMode === 'all' ? 'all' : selectedUsers.map(u => u._id),
        });
    };

    if (!template) {
        return (
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <Text type="secondary">Template not found.</Text>
                    <Button type="link" onClick={() => router.push('/emails')}>← Back to templates</Button>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
            {contextHolder}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
                }}>
                    <Button
                        icon={<ArrowLeft size={16} />}
                        onClick={() => router.push('/emails')}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                    >
                        Back
                    </Button>
                    <div style={{ flex: 1 }}>
                        <Title level={4} style={{ color: '#fff', margin: 0 }}>{template.name}</Title>
                    </div>
                    <Button
                        type="primary"
                        icon={<Send size={15} />}
                        loading={isPending}
                        onClick={() => form.submit()}
                        size="large"
                        style={{ minWidth: 140 }}
                    >
                        {isPending ? 'Sending…' : 'Send Emails'}
                    </Button>
                </div>

                {/* Split layout */}
                <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0, paddingTop: 16, alignItems: 'flex-start' }}>

                    {/* ── Left: form ─────────────────────────────────────── */}
                    <div style={{ width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Preview name */}
                        <Card style={cardStyle} styles={{ body: { padding: '14px 16px' } }}>
                            <Text style={{ color: '#8c8c8c', fontSize: 12, display: 'block', marginBottom: 6 }}>
                                Preview as (sample user name)
                            </Text>
                            <Input
                                value={previewName}
                                onChange={e => setPreviewName(e.target.value)}
                                placeholder="e.g. Riya Sharma"
                                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                            />
                        </Card>

                        <Form form={form} layout="vertical" onFinish={handleSubmit}>

                            {/* Trips */}
                            {template.tripBased && (
                                <Card style={{ ...cardStyle, marginBottom: 16 }}>
                                    <Title level={5} style={{ color: '#fff', marginBottom: 4 }}>
                                        <MapPin size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                        Trips
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 14 }}>
                                        Enter a trip slug to look it up. Add up to 3 trips.
                                    </Text>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                        <Input
                                            ref={slugInputRef}
                                            placeholder="e.g. kedarkantha-winter-trek"
                                            value={slugInput}
                                            onChange={e => setSlugInput(e.target.value)}
                                            onPressEnter={handleAddTrip}
                                            disabled={addedTrips.length >= 3 || fetchingSlug}
                                            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', flex: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={fetchingSlug ? <Spin size="small" /> : <Plus size={14} />}
                                            onClick={handleAddTrip}
                                            disabled={!slugInput.trim() || addedTrips.length >= 3 || fetchingSlug}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {addedTrips.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {addedTrips.map((trip, i) => (
                                                <TripPreviewCard
                                                    key={trip.slug} trip={trip} index={i}
                                                    onRemove={handleRemoveTrip} onDiscountChange={handleDiscountChange}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: 20, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, color: '#555' }}>
                                            No trips added yet
                                        </div>
                                    )}
                                </Card>
                            )}

                            {/* General fields */}
                            {template.fields.length > 0 && (
                                <Card style={{ ...cardStyle, marginBottom: 16 }}>
                                    <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>General</Title>
                                    {template.fields.map(field => (
                                        <Form.Item
                                            key={field.name}
                                            name={field.name}
                                            label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>{field.label}</span>}
                                        >
                                            <Input
                                                placeholder={field.placeholder ?? field.label}
                                                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                                            />
                                        </Form.Item>
                                    ))}
                                </Card>
                            )}

                            {/* Recipients */}
                            <Card style={cardStyle}>
                                <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                                    <Users size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                    Recipients
                                </Title>
                                <Radio.Group value={recipientMode} onChange={e => setRecipientMode(e.target.value)} style={{ marginBottom: 16 }}>
                                    <Radio value="all" style={{ color: '#fff' }}>All Travellers</Radio>
                                    <Radio value="selected" style={{ color: '#fff' }}>Select specific users</Radio>
                                </Radio.Group>
                                {recipientMode === 'selected' && (
                                    <div>
                                        <AutoComplete
                                            options={searchOptions}
                                            onSelect={handleSelectUser}
                                            onSearch={setSearchEmail}
                                            value={searchEmail}
                                            style={{ width: '100%' }}
                                            notFoundContent={searching ? 'Searching…' : searchEmail.length >= 2 ? 'No users found' : null}
                                            placeholder="Type email address to search…"
                                            allowClear
                                        />
                                        {selectedUsers.length > 0 && (
                                            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {selectedUsers.map(u => (
                                                    <Tag key={u._id} closable onClose={() => handleRemoveUser(u._id)}
                                                        icon={<User size={11} style={{ marginRight: 4 }} />} color="blue">
                                                        {u.email}
                                                    </Tag>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </Form>
                    </div>

                    {/* ── Right: live preview ─────────────────────────────── */}
                    <div style={{
                        flex: 1, minWidth: 0,
                        position: 'sticky', top: 0,
                        height: 'calc(100vh - 130px)',
                        display: 'flex', flexDirection: 'column',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '10px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                        }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                            <Text style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>Email Preview</Text>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', background: '#e5e5e5' }}>
                            {previewHtml ? (
                                <iframe
                                    srcDoc={previewHtml}
                                    style={{ width: '100%', height: '100%', minHeight: 600, border: 'none', display: 'block' }}
                                    sandbox="allow-same-origin"
                                    title="Email Preview"
                                />
                            ) : (
                                <div style={{ padding: 24 }}>
                                    <Skeleton active paragraph={{ rows: 12 }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}
