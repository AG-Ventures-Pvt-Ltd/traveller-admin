'use client';
import React, { useState, useCallback, useRef } from 'react';
import {
  Card, Form, Input, Button, Typography, ConfigProvider, theme,
  Tag, message, Radio, AutoComplete, Modal, Spin, Tooltip,
} from 'antd';
import type { InputRef } from 'antd';
import { Send, Users, User, MapPin, X, Plus, ImageOff, Clock, UsersRound, Ticket } from 'lucide-react';
import { usePostData } from '@/services/usePostData';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';

const { Title, Text } = Typography;

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserOption {
  _id: string;
  email: string;
  username: string;
}

interface TripSummary {
  slug: string;
  name: string;
  imageUrl: string | null;
  price: string | null;
  duration: string | null;
  groupSize: string | null;
  tripUrl: string;
  // user-editable overrides
  discount?: string;
}

interface TemplateField {
  name: string;
  label: string;
  group: string;
  placeholder?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  apiUrl: string;
  // trip-based templates set this to true; field-based templates leave it unset
  tripBased?: boolean;
  fields: TemplateField[];   // non-trip fields (General section etc.)
  groups: string[];
}

// ─── Template Registry ────────────────────────────────────────────────────────

const USER_ENGAGEMENT_GENERAL_FIELDS: TemplateField[] = [
  { name: 'offerExpiryDate', label: 'Offer Expiry Date', group: 'General', placeholder: 'e.g. 31 May 2026' },
  // exploreAllTripsUrl / travelExpertsUrl / unsubscribeUrl are defaulted server-side
];

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'user_engagement_with_trips',
    name: 'User Engagement with Trips',
    description: 'Showcase up to 3 featured trips with pricing, duration, and group size to re-engage travellers.',
    icon: <MapPin size={20} />,
    apiUrl: api.sendEngagementEmail,
    tripBased: true,
    fields: USER_ENGAGEMENT_GENERAL_FIELDS,
    groups: ['General'],
  },
  // Add future templates here
];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
};

// ─── Trip Preview Card ────────────────────────────────────────────────────────

interface TripCardProps {
  trip: TripSummary;
  index: number;
  onRemove: (slug: string) => void;
  onDiscountChange: (slug: string, value: string) => void;
}

function TripPreviewCard({ trip, index, onRemove, onDiscountChange }: TripCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Image */}
        <div
          style={{
            width: 100,
            minHeight: 100,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {trip.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.imageUrl}
              alt={trip.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageOff size={20} color="#555" />
          )}
        </div>

        {/* Details */}
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
              <Button
                type="text"
                size="small"
                icon={<X size={14} />}
                onClick={() => onRemove(trip.slug)}
                style={{ color: '#ff4d4f', padding: 4, marginLeft: 8 }}
              />
            </Tooltip>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 8 }}>
            {trip.price && (
              <span style={{ color: '#52c41a', fontSize: 13 }}>
                <Ticket size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {trip.price}
              </span>
            )}
            {trip.duration && (
              <span style={{ color: '#aaa', fontSize: 13 }}>
                <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {trip.duration}
              </span>
            )}
            {trip.groupSize && (
              <span style={{ color: '#aaa', fontSize: 13 }}>
                <UsersRound size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {trip.groupSize}
              </span>
            )}
          </div>

          {/* Editable discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>Discount (optional):</Text>
            <Input
              size="small"
              placeholder="e.g. 15% off"
              value={trip.discount ?? ''}
              onChange={e => onDiscountChange(trip.slug, e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.07)',
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 12,
                maxWidth: 140,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Send Modal ───────────────────────────────────────────────────────────────

interface SendModalProps {
  template: EmailTemplate | null;
  onClose: () => void;
}

function SendTemplateModal({ template, onClose }: SendModalProps) {
  const [form] = Form.useForm();
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [fetchingSlug, setFetchingSlug] = useState(false);
  const [addedTrips, setAddedTrips] = useState<TripSummary[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const slugInputRef = useRef<InputRef>(null);

  const { data: searchData, isLoading: searching } = useGetData({
    key: ['user-email-search', searchEmail],
    url: api.getClientUsers,
    params: searchEmail.length >= 2 ? { search: searchEmail, limit: 8, page: 1 } : {},
  });

  const searchOptions: { value: string; label: React.ReactNode; user: UserOption }[] =
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
      : [];

  const { mutate: sendEmail, isPending } = usePostData<
    unknown,
    { templateFields: Record<string, string>; recipients: 'all' | string[] }
  >(template?.apiUrl ?? '', {
    onSuccess: (data: unknown) => {
      const res = data as { data?: { queued?: number } };
      messageApi.success(`Emails queued for ${res?.data?.queued ?? '?'} user(s)!`);
      handleClose();
    },
    onError: () => {
      messageApi.error('Failed to send emails. Please try again.');
    },
  });

  const handleAddTrip = async () => {
    const slug = slugInput.trim().toLowerCase();
    if (!slug) return;
    if (addedTrips.length >= 3) {
      messageApi.warning('You can add at most 3 trips.');
      return;
    }
    if (addedTrips.find(t => t.slug === slug)) {
      messageApi.warning('This trip is already added.');
      return;
    }
    setFetchingSlug(true);
    try {
      const res = await baseAPI.get(api.getTripSummaryBySlug(slug));
      const summary: TripSummary = res.data?.data;
      setAddedTrips(prev => [...prev, summary]);
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

  const handleClose = () => {
    form.resetFields();
    setSelectedUsers([]);
    setRecipientMode('all');
    setSearchEmail('');
    setAddedTrips([]);
    setSlugInput('');
    onClose();
  };

  const handleSubmit = (values: Record<string, string>) => {
    if (!template) return;

    if (template.tripBased && addedTrips.length === 0) {
      messageApi.warning('Please add at least one trip.');
      return;
    }
    if (recipientMode === 'selected' && selectedUsers.length === 0) {
      messageApi.warning('Please add at least one recipient or switch to "All Travellers".');
      return;
    }

    const templateFields: Record<string, string> = {};

    // Build trip fields from fetched data
    if (template.tripBased) {
      addedTrips.forEach((trip, i) => {
        const n = i + 1;
        templateFields[`trip${n}Name`] = trip.name;
        if (trip.imageUrl) templateFields[`trip${n}ImageUrl`] = trip.imageUrl;
        if (trip.price) templateFields[`trip${n}Price`] = trip.price;
        if (trip.duration) templateFields[`trip${n}Duration`] = trip.duration;
        if (trip.groupSize) templateFields[`trip${n}GroupSize`] = trip.groupSize;
        if (trip.discount) templateFields[`trip${n}Discount`] = trip.discount;
        templateFields[`trip${n}Url`] = trip.tripUrl;
      });
    }

    // Remaining manual fields (General section)
    template.fields.forEach(f => {
      if (values[f.name]) templateFields[f.name] = values[f.name];
    });

    const recipients: 'all' | string[] =
      recipientMode === 'all' ? 'all' : selectedUsers.map(u => u._id);

    sendEmail({ templateFields, recipients });
  };

  return (
    <Modal
      open={!!template}
      title={<span style={{ color: '#fff', fontSize: 16 }}>{template?.name}</span>}
      onCancel={handleClose}
      footer={null}
      width="80%"
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: '78vh', overflowY: 'auto', padding: '16px 0' },
        header: { background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)' },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ padding: '0 24px' }}>

        {/* Trip selector (trip-based templates only) */}
        {template?.tripBased && (
          <Card style={{ ...cardStyle, marginBottom: 20 }}>
            <Title level={5} style={{ color: '#fff', marginBottom: 4 }}>
              <MapPin size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Trips
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 14 }}>
              Enter a trip slug to look it up. Add up to 3 trips.
            </Text>

            {/* Slug input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Input
                ref={slugInputRef}
                placeholder="e.g. kedarkantha-winter-trek"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                onPressEnter={handleAddTrip}
                disabled={addedTrips.length >= 3 || fetchingSlug}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  flex: 1,
                  maxWidth: 400,
                }}
              />
              <Button
                type="primary"
                icon={fetchingSlug ? <Spin size="small" /> : <Plus size={14} />}
                onClick={handleAddTrip}
                disabled={!slugInput.trim() || addedTrips.length >= 3 || fetchingSlug}
              >
                Add Trip
              </Button>
            </div>

            {/* Added trips */}
            {addedTrips.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addedTrips.map((trip, i) => (
                  <TripPreviewCard
                    key={trip.slug}
                    trip={trip}
                    index={i}
                    onRemove={handleRemoveTrip}
                    onDiscountChange={handleDiscountChange}
                  />
                ))}
              </div>
            )}

            {addedTrips.length === 0 && (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#555',
                }}
              >
                No trips added yet
              </div>
            )}
          </Card>
        )}

        {/* General fields (manual inputs — non-trip fields) */}
        {template?.fields && template.fields.length > 0 && (
          <Card style={{ ...cardStyle, marginBottom: 20 }}>
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>General</Title>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0 16px',
              }}
            >
              {template.fields.map(field => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={<span style={{ color: '#8c8c8c', fontSize: 13 }}>{field.label}</span>}
                >
                  <Input
                    placeholder={field.placeholder ?? field.label}
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  />
                </Form.Item>
              ))}
            </div>
          </Card>
        )}

        {/* Recipients */}
        <Card style={{ ...cardStyle, marginBottom: 20 }}>
          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
            <Users size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Recipients
          </Title>
          <Radio.Group
            value={recipientMode}
            onChange={e => setRecipientMode(e.target.value)}
            style={{ marginBottom: 16 }}
          >
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
                style={{ width: '100%', maxWidth: 420 }}
                notFoundContent={
                  searching ? 'Searching…' : searchEmail.length >= 2 ? 'No users found' : null
                }
                placeholder="Type email address to search…"
                allowClear
              />
              {selectedUsers.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedUsers.map(u => (
                    <Tag
                      key={u._id}
                      closable
                      onClose={() => handleRemoveUser(u._id)}
                      icon={<User size={11} style={{ marginRight: 4 }} />}
                      color="blue"
                    >
                      {u.email}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
          <Button onClick={handleClose} style={{ marginRight: 12 }}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            size="large"
            icon={<Send size={16} />}
            style={{ minWidth: 160 }}
          >
            {isPending ? 'Sending…' : 'Send Emails'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  return (
    <ConfigProvider
      theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#1890ff', borderRadius: 8 } }}
    >
      <div
        style={{
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
          Emails
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
          Select a template to compose and send to travellers.
        </Text>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {EMAIL_TEMPLATES.map(template => (
            <Card
              key={template.id}
              hoverable
              style={cardStyle}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(24,144,255,0.15)',
                    border: '1px solid rgba(24,144,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#1890ff',
                  }}
                >
                  {template.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ color: '#fff', fontSize: 15, display: 'block', marginBottom: 4 }}>
                    {template.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13, lineHeight: '1.5' }}>
                    {template.description}
                  </Text>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  block
                  icon={<Send size={14} />}
                  onClick={() => setSelectedTemplate(template)}
                  style={{ borderRadius: 8 }}
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <SendTemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      </div>
    </ConfigProvider>
  );
}
