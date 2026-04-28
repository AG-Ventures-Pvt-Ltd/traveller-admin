'use client';

import React, { useState, useEffect } from 'react';
import {
    Modal, Tabs, Descriptions, Tag, Image, Space, Avatar, Typography,
    Button, Spin, List, Table, Collapse, Empty, Row, Col, Alert, message,
    Statistic, Form, Input, InputNumber, Select, DatePicker, Switch, Popconfirm, Rate,
} from 'antd';
import type { CollapseProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { CheckCircle, MapPin, Star, PlusCircle, Eye, Share2, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '../utils';
import { usePostData } from '@/services/usePostData';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';
import {
    Trip, TripBatch, Review, Faq, CancellationPolicy, Pricing, ItineraryDay,
} from '../constant';

const { Text, Paragraph } = Typography;

const STATUS_COLORS: Record<string, string> = { in_review: 'orange', published: 'green' };
const DIFFICULTY_COLORS: Record<string, string> = { easy: 'green', moderate: 'gold', challenging: 'red' };
const BATCH_STATUS_COLORS: Record<string, string> = {
    available: 'green', 'filling-fast': 'orange', 'sold-out': 'red',
    closed: 'default', cancelled: 'error', draft: 'default',
};

const BATCH_STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'available', label: 'Available' },
    { value: 'filling-fast', label: 'Filling Fast' },
    { value: 'sold-out', label: 'Sold Out' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const INDIAN_STATES = [
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

// ---------- SuggestedCategories ----------

interface SuggestedCategoriesProps {
    trip: Trip;
    onTripUpdate?: (updated: Trip) => void;
}

const SuggestedCategories: React.FC<SuggestedCategoriesProps> = ({ trip, onTripUpdate }) => {
    const queryClient = useQueryClient();
    const [dismissed, setDismissed] = useState(false);
    const [excluded, setExcluded] = useState<Set<string>>(new Set());

    const { data: configData, isLoading: catsLoading } = useQuery({
        queryKey: ['trip-categories'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getTripCategories);
            return (data as { data: { categories?: string[] } }).data;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const dbCategories: string[] = configData?.categories || [];
    const knownSet = new Set(dbCategories.map((c: string) => c.toLowerCase()));
    const newCategories = (trip.category || []).filter(c => !knownSet.has(c.toLowerCase()));

    const { mutate: addCategories, isPending: addPending } = usePostData<unknown, { categories: string[] }>(
        api.addTripCategories,
        {
            onSuccess: () => {
                message.success('Categories added to database!');
                queryClient.invalidateQueries({ queryKey: ['trip-categories'] });
            },
            onError: () => message.error('Failed to add categories.'),
        }
    );

    const { mutate: updateCategories, isPending: updatePending } = useMutation({
        mutationFn: async (updatedList: string[]) => {
            const { data } = await baseAPI.patch(api.updateTripCategories(trip._id), { categories: updatedList });
            return data as { data: { category: string[] } };
        },
        onSuccess: (data) => {
            onTripUpdate?.({ ...trip, category: data.data.category });
            setDismissed(true);
        },
        onError: () => message.error('Failed to update trip categories'),
    });

    if (catsLoading || !newCategories.length || dismissed) return null;

    const toAdd = newCategories.filter(c => !excluded.has(c));

    const toggleExclude = (cat: string) => {
        setExcluded(prev => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };

    const handleConfirm = () => {
        const keep = (trip.category || []).filter(c => !excluded.has(c));
        if (toAdd.length) addCategories({ categories: toAdd });
        if (excluded.size > 0) updateCategories(keep);
        else setDismissed(true);
    };

    const isPending = addPending || updatePending;

    return (
        <Alert
            type="warning"
            showIcon
            style={{ marginTop: 4 }}
            message={
                <Space style={{ width: '100%' }} direction="vertical" size={8}>
                    <Text strong>New Suggested Categories</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Click a tag to cross it out — crossed-out categories won&apos;t be added to the DB and will be removed from this trip.
                    </Text>
                    <Space wrap>
                        {newCategories.map(c => {
                            const isExcluded = excluded.has(c);
                            return (
                                <Tag
                                    key={c}
                                    color={isExcluded ? 'default' : 'orange'}
                                    onClick={() => toggleExclude(c)}
                                    style={{
                                        textTransform: 'capitalize',
                                        cursor: 'pointer',
                                        textDecoration: isExcluded ? 'line-through' : 'none',
                                        opacity: isExcluded ? 0.5 : 1,
                                        userSelect: 'none',
                                    }}
                                >
                                    {c}
                                </Tag>
                            );
                        })}
                    </Space>
                    <Button
                        size="small"
                        type="primary"
                        icon={<PlusCircle size={14} />}
                        loading={isPending}
                        onClick={handleConfirm}
                    >
                        {toAdd.length > 0 ? `Add ${toAdd.length} to database` : 'Remove crossed-out from trip'}
                    </Button>
                </Space>
            }
        />
    );
};

// ---------- SuggestedLocation ----------

interface CityFormData {
    name: string;
    stateCode: string;
    pincode?: string;
    aliases?: string;
    lat: number;
    lng: number;
}

interface SuggestedLocationProps {
    trip: Trip;
    onTripUpdate?: (updated: Trip) => void;
}

const SuggestedLocation: React.FC<SuggestedLocationProps> = ({ trip, onTripUpdate }) => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [added, setAdded] = useState(false);
    const [form] = Form.useForm<CityFormData>();

    const city = trip?.location?.city;

    const { data: citiesData, isLoading: citiesLoading } = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getCities);
            return (data as { data: { cities?: { name: string }[] } }).data;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const cities: { name: string }[] = citiesData?.cities || [];
    const knownCityNames = new Set(cities.map(c => c.name.toLowerCase()));
    const isUnknown = city && !knownCityNames.has(city.toLowerCase());

    const { mutate: updateTripLocation, isPending: locationUpdating } = useMutation({
        mutationFn: async ({ city: cityName, state, coordinates }: { city: string; state: string; coordinates: number[] }) => {
            const { data } = await baseAPI.patch(api.updateTripLocation(trip._id), { city: cityName, state, coordinates });
            return data as { data: { location: Trip['location'] } };
        },
        onSuccess: (data) => {
            onTripUpdate?.({ ...trip, location: data.data.location });
        },
        onError: () => message.error('City saved to DB but failed to update the trip location.'),
    });

    const { mutate: addCity, isPending: cityAdding } = usePostData<unknown, {
        name: string;
        stateCode: string;
        pincode: string | null;
        aliases: string[];
        location: { coordinates: [number, number] };
    }>(api.addCity, {
        onSuccess: (_, variables) => {
            message.success(`City "${variables.name}" added to the database and trip updated!`);
            queryClient.invalidateQueries({ queryKey: ['cities'] });
            const stateName = INDIAN_STATES.find(s => s.code === variables.stateCode)?.name || variables.stateCode;
            updateTripLocation({
                city: variables.name,
                state: stateName,
                coordinates: variables.location.coordinates,
            });
            setAdded(true);
            setModalOpen(false);
        },
        onError: (err) => {
            const msg = (err.response?.data as { message?: string })?.message;
            message.error(msg || 'Failed to add city.');
        },
    });

    const isPending = cityAdding || locationUpdating;

    if (!city || citiesLoading || !isUnknown || added) return null;

    const handleSubmit = (values: CityFormData) => {
        addCity({
            name: values.name,
            stateCode: values.stateCode,
            pincode: values.pincode || null,
            aliases: values.aliases ? values.aliases.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            location: { coordinates: [values.lng, values.lat] },
        });
    };

    return (
        <>
            <Alert
                type="warning"
                showIcon
                style={{ marginTop: 4 }}
                message={
                    <Space style={{ width: '100%' }} direction="vertical" size={8}>
                        <Text strong>Unrecognised City</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            &quot;<b>{city}</b>&quot; is not in the city database.
                        </Text>
                        <Button
                            size="small"
                            type="primary"
                            icon={<MapPin size={14} />}
                            onClick={() => {
                                form.setFieldsValue({ name: city, stateCode: trip?.location?.state || undefined });
                                setModalOpen(true);
                            }}
                        >
                            Add to city database
                        </Button>
                    </Space>
                }
            />
            <Modal
                title={`Add "${city}" to City Database`}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="City Name" rules={[{ required: true, message: 'City name is required' }]}>
                        <Input placeholder="e.g. Manali" />
                    </Form.Item>
                    <Form.Item name="stateCode" label="State" rules={[{ required: true, message: 'State is required' }]}>
                        <Select
                            showSearch
                            disabled
                            placeholder="Select a state"
                            optionFilterProp="label"
                            options={INDIAN_STATES.map(s => ({ value: s.code, label: `${s.name} (${s.code})` }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="pincode"
                        label="Pincode (optional)"
                        rules={[{ pattern: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' }]}
                    >
                        <Input placeholder="e.g. 175131" maxLength={6} />
                    </Form.Item>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="lat" label="Latitude" rules={[{ required: true, message: 'Latitude is required' }]}>
                                <InputNumber placeholder="e.g. 32.2432" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lng" label="Longitude" rules={[{ required: true, message: 'Longitude is required' }]}>
                                <InputNumber placeholder="e.g. 77.1892" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="aliases" label="Aliases (optional)" extra="Comma-separated alternate names">
                        <Input placeholder="e.g. Manāli, Manalı" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>Add City</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// ---------- OverviewTab ----------

interface OverviewTabProps {
    trip: Trip;
    onTripUpdate?: (updated: Trip) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ trip, onTripUpdate }) => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
        {trip.tripImages?.length ? (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Images</Text>
                <Space wrap>
                    {trip.tripImages.map((img, i) => (
                        <Image key={i} src={`https://d1hjk5b7z017su.cloudfront.net${img}`} width={120} height={80} style={{ objectFit: 'cover', borderRadius: 6 }} alt="" />
                    ))}
                </Space>
            </div>
        ) : null}

        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Status" span={1}>
                <Tag color={STATUS_COLORS[trip.status]}>{trip.status?.replace('_', ' ').toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Type">{trip.type?.replace('_', ' ') || '—'}</Descriptions.Item>
            <Descriptions.Item label="Difficulty">
                <Tag color={DIFFICULTY_COLORS[trip.difficulty || '']}>{trip.difficulty?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Rating">
                <Space><Star size={14} style={{ color: '#faad14' }} />{trip.rating?.toFixed(1)} ({trip.totalReviews} reviews)</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Featured">{trip.isFeatured ? <Tag color="blue">Yes</Tag> : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Female Only">{trip.isFemaleOnly ? <Tag color="pink">Yes</Tag> : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Best Time to Visit">{trip.bestTimeToVisit || '—'}</Descriptions.Item>
            <Descriptions.Item label="Slug">{trip.slug || '—'}</Descriptions.Item>
            <Descriptions.Item label="Created">{formatDate(trip.createdAt)}</Descriptions.Item>
        </Descriptions>

        <Descriptions bordered column={1} size="small" title="Description">
            <Descriptions.Item label="Description">
                <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{trip.description || '—'}</Paragraph>
            </Descriptions.Item>
            {trip.additionalInfo && (
                <Descriptions.Item label="Additional Info">
                    <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{trip.additionalInfo}</Paragraph>
                </Descriptions.Item>
            )}
        </Descriptions>

        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" title="Location">
            <Descriptions.Item label="City">{trip.location?.city || '—'}</Descriptions.Item>
            <Descriptions.Item label="State">{trip.location?.state || '—'}</Descriptions.Item>
            <Descriptions.Item label="Country">{trip.location?.country || '—'}</Descriptions.Item>
            <Descriptions.Item label="Address">{trip.location?.address || '—'}</Descriptions.Item>
        </Descriptions>
        <SuggestedLocation trip={trip} onTripUpdate={onTripUpdate} />

        <Descriptions bordered column={1} size="small" title="Host">
            <Descriptions.Item label="Host">
                <Space>
                    <Avatar src={trip.host?.avatar} size={32} style={{ backgroundColor: '#1890ff' }}>
                        {trip.host?.fullName?.[0]}
                    </Avatar>
                    <span>{trip.host?.fullName || trip.host?.username || '—'}</span>
                    <Text type="secondary">{trip.host?.email}</Text>
                </Space>
            </Descriptions.Item>
        </Descriptions>

        {trip.tags?.length ? (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>Tags</Text>
                <Space wrap>{trip.tags.map(t => <Tag key={t}>{t}</Tag>)}</Space>
            </div>
        ) : null}
        {trip.category?.length ? (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>Categories</Text>
                <Space wrap>{trip.category.map(c => <Tag key={c} color="blue">{c}</Tag>)}</Space>
                <SuggestedCategories trip={trip} onTripUpdate={onTripUpdate} />
            </div>
        ) : null}

        <Row gutter={[16, 16]}>
            {trip.inclusions?.length ? (
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 6, color: '#52c41a' }}>✓ Inclusions</Text>
                    <List
                        size="small"
                        dataSource={trip.inclusions}
                        renderItem={item => <List.Item style={{ padding: '4px 0' }}><Text>{item}</Text></List.Item>}
                    />
                </Col>
            ) : null}
            {trip.exclusions?.length ? (
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 6, color: '#ff4d4f' }}>✗ Exclusions</Text>
                    <List
                        size="small"
                        dataSource={trip.exclusions}
                        renderItem={item => <List.Item style={{ padding: '4px 0' }}><Text>{item}</Text></List.Item>}
                    />
                </Col>
            ) : null}
            {trip.thingsToCarry?.length ? (
                <Col xs={24} md={8}>
                    <Text strong style={{ display: 'block', marginBottom: 6, color: '#1890ff' }}>🎒 Things to Carry</Text>
                    <List
                        size="small"
                        dataSource={trip.thingsToCarry}
                        renderItem={item => <List.Item style={{ padding: '4px 0' }}><Text>{item}</Text></List.Item>}
                    />
                </Col>
            ) : null}
        </Row>

        {trip.highlights?.length ? (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Highlights</Text>
                <Row gutter={[12, 12]}>
                    {trip.highlights.map((h, i) => (
                        <Col key={i} xs={12} sm={8} md={6}>
                            {h.image && <Image src={`https://d1hjk5b7z017su.cloudfront.net${h.image}`} width="100%" height={80} style={{ objectFit: 'cover', borderRadius: 6 }} alt="" />}
                            <Text style={{ display: 'block', marginTop: 4, fontSize: 12 }}>{h.title}</Text>
                        </Col>
                    ))}
                </Row>
            </div>
        ) : null}

        {trip.accommodation?.length ? (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Accommodation</Text>
                {trip.accommodation.map((acc, i) => (
                    <Descriptions key={i} bordered size="small" column={1} style={{ marginBottom: 8 }}>
                        <Descriptions.Item label="Name">{acc.name || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Address">{acc.address || '—'}</Descriptions.Item>
                        {acc.images?.length ? (
                            <Descriptions.Item label="Images">
                                <Space wrap>
                                    {acc.images.map((img, j) => (
                                        <Image key={j} src={img} width={80} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} alt="" />
                                    ))}
                                </Space>
                            </Descriptions.Item>
                        ) : null}
                    </Descriptions>
                ))}
            </div>
        ) : null}

        {trip.metaTitle && (
            <Descriptions bordered column={1} size="small" title="SEO">
                <Descriptions.Item label="Meta Title">{trip.metaTitle}</Descriptions.Item>
                {trip.metaDescription && (
                    <Descriptions.Item label="Meta Description">{trip.metaDescription}</Descriptions.Item>
                )}
            </Descriptions>
        )}

        {trip.views && (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    <Eye size={14} style={{ marginRight: 4 }} />Views by Source
                </Text>
                <Row gutter={[8, 8]}>
                    {Object.entries(trip.views).map(([source, count]) => (
                        <Col key={source} xs={12} sm={8} md={4}>
                            <Statistic title={source} value={count || 0} valueStyle={{ fontSize: 16 }} />
                        </Col>
                    ))}
                </Row>
            </div>
        )}

        {trip.shares && (
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    <Share2 size={14} style={{ marginRight: 4 }} />Shares by Platform
                </Text>
                <Row gutter={[8, 8]}>
                    {Object.entries(trip.shares).map(([platform, count]) => (
                        <Col key={platform} xs={12} sm={8} md={4}>
                            <Statistic title={platform} value={count || 0} valueStyle={{ fontSize: 16 }} />
                        </Col>
                    ))}
                </Row>
            </div>
        )}
    </Space>
);

// ---------- ItineraryTab ----------

const ItineraryTab: React.FC<{ itinerary?: ItineraryDay[] }> = ({ itinerary }) => {
    if (!itinerary?.length) return <Empty description="No itinerary added yet" />;

    const items: CollapseProps['items'] = itinerary.map((day) => ({
        key: String(day.day),
        label: `Day ${day.day}${day.title ? ` — ${day.title}` : ''}`,
        children: day.description?.length ? (
            <List
                size="small"
                dataSource={day.description}
                renderItem={(item, i) => (
                    <List.Item style={{ padding: '4px 0' }}>
                        <Text>{i + 1}. {item}</Text>
                    </List.Item>
                )}
            />
        ) : <Text type="secondary">No details provided</Text>,
    }));

    return <Collapse accordion items={items} />;
};

// ---------- BatchEditModal ----------

interface BatchEditModalProps {
    batch: TripBatch | null;
    tripId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

interface BatchEditValues {
    status: string;
    externalBookedSeats: number;
    isCompleted: boolean;
}

const BatchEditModal: React.FC<BatchEditModalProps> = ({ batch, tripId, onClose, onSuccess }) => {
    const [form] = Form.useForm<BatchEditValues>();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (batch) {
            form.setFieldsValue({
                status: batch.status,
                externalBookedSeats: batch.externalBookedSeats ?? 0,
                isCompleted: batch.isCompleted ?? false,
            });
        }
    }, [batch, form]);

    const mutation = useMutation({
        mutationFn: (values: BatchEditValues) => baseAPI.patch(api.updateBatch(tripId, batch!._id), values),
        onSuccess: () => {
            message.success('Batch updated');
            queryClient.invalidateQueries({ queryKey: ['trip-batches', tripId] });
            onSuccess?.();
            onClose();
        },
        onError: (err: unknown) => {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message.error(axiosErr.response?.data?.message || 'Update failed');
        },
    });

    return (
        <Modal
            open={!!batch}
            title={`Edit Batch — ${batch ? formatDate(batch.startDateTime) : ''}`}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            okText="Save"
        >
            <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                <Form.Item label="Status" name="status">
                    <Select options={BATCH_STATUS_OPTIONS} />
                </Form.Item>
                <Form.Item label="External Booked Seats" name="externalBookedSeats">
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Mark as Completed" name="isCompleted" valuePropName="checked">
                    <Switch />
                </Form.Item>

                {batch?.meetingPoint && batch.meetingPoint.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Meeting Points</Text>
                        {batch.meetingPoint.map((mp, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <Text>{mp.location?.name || '—'}</Text>
                                <Text type="secondary">₹{mp.pickupPrice ?? 0}</Text>
                            </div>
                        ))}
                    </div>
                )}

                {batch?.dropPoint && batch.dropPoint.length > 0 && (
                    <div>
                        <Text strong>Drop Points</Text>
                        <Space wrap style={{ marginTop: 4 }}>
                            {batch.dropPoint.map((dp) => (
                                <Tag key={dp._id}>{dp.name || dp._id}</Tag>
                            ))}
                        </Space>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

// ---------- BatchesTab ----------

interface BatchesResponse {
    data: {
        batches: TripBatch[];
    };
}

const BatchesTab: React.FC<{ tripId: string }> = ({ tripId }) => {
    const [editingBatch, setEditingBatch] = useState<TripBatch | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading } = useQuery({
        queryKey: ['trip-batches', tripId, statusFilter, dateRange, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams({ sortOrder });
            if (statusFilter) params.append('status', statusFilter);
            if (dateRange?.[0]) params.append('dateFrom', dateRange[0].toISOString());
            if (dateRange?.[1]) params.append('dateTo', dateRange[1].toISOString());
            const res = await baseAPI.get(`${api.getTripBatches(tripId)}?${params.toString()}`);
            return res.data as BatchesResponse;
        },
        enabled: !!tripId,
    });

    const batches: TripBatch[] = data?.data?.batches || [];

    const batchColumns = [
        {
            title: 'Start Date', dataIndex: 'startDateTime', key: 'startDate',
            render: (v: string) => formatDate(v),
        },
        {
            title: 'End Date', dataIndex: 'endDateTime', key: 'endDate',
            render: (v: string) => formatDate(v),
        },
        {
            title: 'Status', dataIndex: 'status', key: 'status',
            render: (s: string) => <Tag color={BATCH_STATUS_COLORS[s]}>{s}</Tag>,
        },
        {
            title: 'Seats', key: 'seats',
            render: (_: unknown, r: TripBatch) => `${(r.bookedSeats || 0) + (r.externalBookedSeats || 0)} / ${r.totalSeats}`,
        },
        {
            title: 'Ext. Booked', dataIndex: 'externalBookedSeats', key: 'ext',
            render: (v: number) => v ?? 0,
        },
        {
            title: 'Completed', dataIndex: 'isCompleted', key: 'done',
            render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
        },
        {
            title: '', key: 'actions',
            render: (_: unknown, record: TripBatch) => (
                <Button size="small" icon={<Pencil size={12} />} onClick={() => setEditingBatch(record)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={8} align="middle">
                <Col>
                    <Select
                        allowClear
                        placeholder="Filter by status"
                        style={{ width: 160 }}
                        options={BATCH_STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </Col>
                <Col>
                    <DatePicker.RangePicker
                        onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0].toDate(), dates[1].toDate()]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                    />
                </Col>
                <Col>
                    <Select
                        style={{ width: 130 }}
                        value={sortOrder}
                        onChange={setSortOrder}
                        options={[
                            { value: 'asc', label: 'Date ↑ Asc' },
                            { value: 'desc', label: 'Date ↓ Desc' },
                        ]}
                    />
                </Col>
            </Row>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : batches.length === 0 ? (
                <Empty description="No batches found" />
            ) : (
                <Table
                    columns={batchColumns}
                    dataSource={batches}
                    rowKey="_id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 700 }}
                />
            )}

            {editingBatch && (
                <BatchEditModal
                    batch={editingBatch}
                    tripId={tripId}
                    onClose={() => setEditingBatch(null)}
                />
            )}
        </Space>
    );
};

// ---------- PricingTab ----------

const PricingTab: React.FC<{ pricing?: Pricing }> = ({ pricing }) => {
    if (!pricing) return <Empty description="No pricing configured" />;
    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Currency">{pricing.currency}</Descriptions.Item>
                <Descriptions.Item label="Advance Booking">
                    {pricing.isAdvanceBookingAllowed
                        ? `Yes — ₹${pricing.advanceBookingPrice || 0}`
                        : 'No'}
                </Descriptions.Item>
            </Descriptions>

            {pricing.pricings?.length ? (
                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Pricing Tiers</Text>
                    <Table
                        size="small"
                        dataSource={pricing.pricings}
                        rowKey="label"
                        pagination={false}
                        columns={[
                            { title: 'Label', dataIndex: 'label', key: 'label' },
                            { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string) => v || '—' },
                            { title: 'Price / Person', dataIndex: 'pricePerPerson', key: 'price', render: (v: number) => `₹${v?.toLocaleString()}` },
                            { title: 'Max Qty', dataIndex: 'maxQuantity', key: 'max', render: (v: number) => v || '—' },
                            { title: 'Booked', dataIndex: 'bookedQuantity', key: 'booked', render: (v: number) => v || 0 },
                        ]}
                    />
                </div>
            ) : null}

            {pricing.addOns?.length ? (
                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Add-ons</Text>
                    <Table
                        size="small"
                        dataSource={pricing.addOns}
                        rowKey="label"
                        pagination={false}
                        columns={[
                            { title: 'Label', dataIndex: 'label', key: 'label' },
                            { title: 'Category', dataIndex: 'category', key: 'cat', render: (v: string) => v?.replace('_', ' ') },
                            { title: 'Price / Person', dataIndex: 'pricePerPerson', key: 'price', render: (v: number) => `₹${v?.toLocaleString()}` },
                            { title: 'Max Qty', dataIndex: 'maxQuantity', key: 'max', render: (v: number) => v || '—' },
                            { title: 'Booked', dataIndex: 'bookedQuantity', key: 'booked', render: (v: number) => v || 0 },
                        ]}
                    />
                </div>
            ) : null}
        </Space>
    );
};

// ---------- FaqsPolicyTab ----------

interface FaqsPolicyTabProps {
    faqs?: Faq[];
    cancellationPolicy?: CancellationPolicy;
}

const FaqsPolicyTab: React.FC<FaqsPolicyTabProps> = ({ faqs, cancellationPolicy }) => {
    const faqItems: CollapseProps['items'] = (faqs || []).map((faq, i) => ({
        key: String(i),
        label: faq.question,
        children: <Text>{faq.answer}</Text>,
    }));

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>FAQs</Text>
                {faqs?.length ? (
                    <Collapse items={faqItems} />
                ) : <Empty description="No FAQs added" />}
            </div>

            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Cancellation Policy</Text>
                {cancellationPolicy?.refundTiers?.length ? (
                    <Table
                        size="small"
                        dataSource={cancellationPolicy.refundTiers}
                        rowKey="daysBeforeCancellation"
                        pagination={false}
                        columns={[
                            { title: 'Days Before Trip', dataIndex: 'daysBeforeCancellation', key: 'days', render: (v: number) => `${v} days` },
                            { title: 'Refund %', dataIndex: 'refundPercentage', key: 'refund', render: (v: number) => <Tag color={v > 50 ? 'green' : v > 0 ? 'orange' : 'red'}>{v}%</Tag> },
                        ]}
                    />
                ) : <Empty description="No cancellation policy defined" />}
            </div>
        </Space>
    );
};

// ---------- ReviewModal ----------

interface ReviewModalProps {
    tripId: string;
    editing: Review | null;
    onClose: () => void;
}

interface ReviewFormValues {
    username: string;
    rating: number;
    review: string;
    createdAt?: Dayjs;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ tripId, editing, onClose }) => {
    const [form] = Form.useForm<ReviewFormValues>();
    const queryClient = useQueryClient();
    const isEdit = !!editing;

    useEffect(() => {
        if (editing) {
            form.setFieldsValue({
                username: editing.username,
                review: editing.review,
                rating: editing.rating,
            });
        } else {
            form.resetFields();
        }
    }, [editing, form]);

    const mutation = useMutation({
        mutationFn: (values: ReviewFormValues) => isEdit
            ? baseAPI.patch(api.updateReview(tripId, editing!._id), values)
            : baseAPI.post(api.addReview(tripId), values),
        onSuccess: () => {
            message.success(isEdit ? 'Review updated' : 'Review added');
            queryClient.invalidateQueries({ queryKey: ['trip-reviews', tripId] });
            onClose();
        },
        onError: (err: unknown) => {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message.error(axiosErr.response?.data?.message || 'Failed to save review');
        },
    });

    return (
        <Modal
            open
            title={isEdit ? 'Edit Review' : 'Add Review'}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            okText={isEdit ? 'Update' : 'Add'}
            width={500}
        >
            <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. john_doe" />
                </Form.Item>
                <Form.Item label="Rating" name="rating" rules={[{ required: true, message: 'Required' }]}>
                    <Rate allowHalf={false} />
                </Form.Item>
                <Form.Item label="Review" name="review" rules={[{ required: true, message: 'Required' }]}>
                    <Input.TextArea rows={4} placeholder="Write the review..." maxLength={2000} showCount />
                </Form.Item>
                <Form.Item label="Date" name="createdAt">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// ---------- ReviewsTab ----------

interface ReviewsResponse {
    data: {
        reviews: Review[];
        averageRating: number;
        totalReviews: number;
    };
}

const ReviewsTab: React.FC<{ tripId: string }> = ({ tripId }) => {
    const [modalState, setModalState] = useState<null | 'add' | Review>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['trip-reviews', tripId],
        queryFn: async () => {
            const res = await baseAPI.get(api.getTripReviews(tripId));
            return res.data as ReviewsResponse;
        },
        enabled: !!tripId,
    });

    const reviews: Review[] = data?.data?.reviews || [];
    const averageRating: number = data?.data?.averageRating ?? 0;
    const totalReviews: number = data?.data?.totalReviews ?? 0;

    const deleteMutation = useMutation({
        mutationFn: (reviewId: string) => baseAPI.delete(api.deleteReview(tripId, reviewId)),
        onSuccess: () => {
            message.success('Review deleted');
            queryClient.invalidateQueries({ queryKey: ['trip-reviews', tripId] });
        },
        onError: (err: unknown) => {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message.error(axiosErr.response?.data?.message || 'Delete failed');
        },
    });

    const reviewColumns = [
        {
            title: 'Username', dataIndex: 'username', key: 'username',
            render: (v: string) => <Text strong>{v}</Text>,
        },
        {
            title: 'Rating', dataIndex: 'rating', key: 'rating',
            render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} />,
        },
        {
            title: 'Review', dataIndex: 'review', key: 'review',
            render: (v: string) => <Text style={{ maxWidth: 300, display: 'block' }} ellipsis={{ tooltip: v }}>{v}</Text>,
        },
        {
            title: 'Date', dataIndex: 'createdAt', key: 'date',
            render: (v: string) => formatDate(v),
            width: 120,
        },
        {
            title: '', key: 'actions', width: 90,
            render: (_: unknown, record: Review) => (
                <Space>
                    <Button size="small" icon={<Pencil size={12} />} onClick={() => setModalState(record)} />
                    <Popconfirm
                        title="Delete this review?"
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<Trash2 size={12} />} loading={deleteMutation.isPending} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row justify="space-between" align="middle">
                <Col>
                    <Space>
                        <Statistic
                            title="Average Rating"
                            value={averageRating}
                            suffix={`/ 5 (${totalReviews} reviews)`}
                            precision={1}
                        />
                        {averageRating > 0 && <Rate disabled value={averageRating} allowHalf style={{ fontSize: 16 }} />}
                    </Space>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusCircle size={14} />}
                        onClick={() => setModalState('add')}
                    >
                        Add Review
                    </Button>
                </Col>
            </Row>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : reviews.length === 0 ? (
                <Empty description="No reviews yet. Add the first one!" />
            ) : (
                <Table
                    columns={reviewColumns}
                    dataSource={reviews}
                    rowKey="_id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 650 }}
                />
            )}

            {modalState && (
                <ReviewModal
                    tripId={tripId}
                    editing={modalState !== 'add' ? modalState as Review : null}
                    onClose={() => setModalState(null)}
                />
            )}
        </Space>
    );
};

// ---------- TripDetailModal ----------

interface TripDetailModalProps {
    visible: boolean;
    onClose: () => void;
    trip: Trip | null;
    loading: boolean;
    onPublish: (trip: Trip) => void;
    onTripUpdate: (updated: Trip) => void;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ visible, onClose, trip, loading, onPublish, onTripUpdate }) => {
    const tabItems = trip ? [
        { key: 'overview', label: 'Overview', children: <OverviewTab trip={trip} onTripUpdate={onTripUpdate} /> },
        { key: 'itinerary', label: `Itinerary (${trip.itinerary?.length || 0})`, children: <ItineraryTab itinerary={trip.itinerary} /> },
        { key: 'batches', label: `Batches (${trip.batches?.length || 0})`, children: <BatchesTab tripId={trip._id} /> },
        { key: 'pricing', label: 'Pricing', children: <PricingTab pricing={trip.pricing} /> },
        { key: 'faqs', label: 'FAQs & Policy', children: <FaqsPolicyTab faqs={trip.faqs} cancellationPolicy={trip.cancellationPolicy} /> },
        {
            key: 'reviews',
            label: <span><Star size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Reviews</span>,
            children: <ReviewsTab tripId={trip._id} />,
        },
    ] : [];

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            title={
                <Space>
                    <MapPin size={16} />
                    <span>{trip?.title || 'Trip Details'}</span>
                    {trip?.status && (
                        <Tag color={STATUS_COLORS[trip.status]}>{trip.status?.replace('_', ' ').toUpperCase()}</Tag>
                    )}
                </Space>
            }
            width={900}
            styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" tip="Loading trip details..." />
                </div>
            ) : trip ? (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {trip.status === 'in_review' && (
                        <div style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                icon={<CheckCircle size={16} />}
                                onClick={() => onPublish(trip)}
                                size="middle"
                            >
                                Publish Trip
                            </Button>
                        </div>
                    )}
                    <Tabs items={tabItems} defaultActiveKey="overview" />
                </Space>
            ) : null}
        </Modal>
    );
};

export default TripDetailModal;

