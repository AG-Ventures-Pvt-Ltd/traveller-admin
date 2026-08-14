'use client'

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Card,
    Typography,
    ConfigProvider,
    theme,
    Tabs,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Select,
    Tooltip,
    Spin,
    Empty,
    Switch,
    Segmented,
    Divider,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusCircle, Pencil, Trash2, MapPin, Tags, Star, Plus, Navigation, Compass, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';

const CityPinsMap = dynamic(() => import('./components/CityPinsMap'), { ssr: false });

const { Title, Text } = Typography;

// ── Types ─────────────────────────────────────────────────────────────────────

interface City {
    _id: string;
    name: string;
    stateCode: string;
    country?: string;
    pincode?: string;
    aliases?: string[];
    location?: { coordinates?: [number, number] };
}

interface FeaturedCategory {
    _id: string;
    title: string;
    isActive: boolean;
    priority: number;
    tripIds: Array<{ _id: string; title: string; location?: { city?: string } }>;
}

interface PublishedTrip {
    _id: string;
    title: string;
    slug?: string;
    location?: { city?: string };
}

interface TravelerStat {
    _id: string;
    count: number;
}

interface TravelerStatsData {
    global: TravelerStat;
    trips: TravelerStat[];
}

// ── Indian States ─────────────────────────────────────────────────────────────

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

// ── Categories Tab ────────────────────────────────────────────────────────────

const CategoriesTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [addForm] = Form.useForm();
    const [addVisible, setAddVisible] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['trip-categories'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getTripCategories);
            return data.data;
        },
        refetchOnWindowFocus: false,
    });

    const categories = ((data?.categories || []) as string[]).map((c, i) => ({
        key: i,
        name: c,
    }));

    const { mutate: addCategories, isPending: adding } = useMutation({
        mutationFn: async (values: { newCategories: string }) => {
            const names = values.newCategories
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            const { data } = await baseAPI.post(api.addTripCategories, { categories: names });
            return data;
        },
        onSuccess: () => {
            message.success('Categories added!');
            queryClient.invalidateQueries({ queryKey: ['trip-categories'] });
            setAddVisible(false);
            addForm.resetFields();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to add categories'),
    });

    const { mutate: deleteCategory, isPending: deleting } = useMutation({
        mutationFn: async (name: string) => {
            const { data } = await baseAPI.delete(api.deleteTripCategory, {
                data: { category: name },
            });
            return data;
        },
        onSuccess: () => {
            message.success('Category deleted');
            queryClient.invalidateQueries({ queryKey: ['trip-categories'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to delete'),
    });

    const columns: TableColumnsType<{ key: number; name: string }> = [
        {
            title: 'Category',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => (
                <Tag color="blue" style={{ textTransform: 'capitalize', fontSize: 13 }}>
                    {name}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Popconfirm
                    title={`Delete "${record.name}"?`}
                    description="Trips with this category will keep it, but it won't appear as an option."
                    onConfirm={() => deleteCategory(record.name)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger size="small" icon={<Trash2 size={14} />} loading={deleting}>
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Text type="secondary">{categories.length} categories in the database</Text>
                <Button
                    type="primary"
                    icon={<PlusCircle size={14} />}
                    onClick={() => setAddVisible(true)}
                >
                    Add Categories
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                loading={isLoading}
                size="small"
                pagination={{ pageSize: 20 }}
                rowKey="key"
            />

            <Modal
                title="Add Categories"
                open={addVisible}
                onCancel={() => {
                    setAddVisible(false);
                    addForm.resetFields();
                }}
                onOk={() => addForm.submit()}
                confirmLoading={adding}
                okText="Add"
            >
                <Form form={addForm} layout="vertical" onFinish={addCategories}>
                    <Form.Item
                        name="newCategories"
                        label="Category Names"
                        extra="Separate multiple categories with commas"
                        rules={[{ required: true, message: 'Enter at least one category' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Adventure, Wellness, Cycling..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// ── City Modal ────────────────────────────────────────────────────────────────

interface CityModalProps {
    open: boolean;
    city: City | null;
    onClose: () => void;
}

const CityModal: React.FC<CityModalProps> = ({ open, city, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (open) {
            if (city) {
                form.setFieldsValue({
                    name: city.name,
                    stateCode: city.stateCode,
                    country: city.country || 'India',
                    pincode: city.pincode || '',
                    aliases: city.aliases?.join(', ') || '',
                    lat: city.location?.coordinates?.[1],
                    lng: city.location?.coordinates?.[0],
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ country: 'India' });
            }
        }
    }, [open, city, form]);

    const { mutate: save, isPending } = useMutation({
        mutationFn: async (values: {
            name: string;
            stateCode: string;
            country?: string;
            pincode?: string;
            aliases?: string;
            lat?: number;
            lng?: number;
        }) => {
            const payload = {
                name: values.name.trim(),
                stateCode: values.stateCode,
                country: values.country?.trim() || 'India',
                pincode: values.pincode ? String(values.pincode).trim() : null,
                aliases: values.aliases
                    ? values.aliases
                        .split(',')
                        .map((a) => a.trim())
                        .filter(Boolean)
                    : [],
                ...(values.lat !== undefined &&
                    values.lng !== undefined && {
                    location: { coordinates: [Number(values.lng), Number(values.lat)] },
                }),
            };
            if (city?._id) {
                const { data } = await baseAPI.put(api.updateCity(city._id), payload);
                return data;
            } else {
                const { data } = await baseAPI.post(api.addCity, payload);
                return data;
            }
        },
        onSuccess: () => {
            message.success(city?._id ? 'City updated!' : 'City added!');
            queryClient.invalidateQueries({ queryKey: ['cities'] });
            onClose();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to save city'),
    });

    return (
        <Modal
            title={city?._id ? `Edit — ${city.name}` : 'Add City'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={isPending}
            okText={city?._id ? 'Update' : 'Add'}
            width={520}
        >
            <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
                <Form.Item
                    name="name"
                    label="City Name"
                    rules={[{ required: true, message: 'City name is required' }]}
                >
                    <Input placeholder="e.g. Manali" />
                </Form.Item>

                <Form.Item
                    name="stateCode"
                    label="State"
                    rules={[{ required: true, message: 'State is required' }]}
                >
                    <Select
                        showSearch
                        placeholder="Select a state"
                        optionFilterProp="label"
                        options={INDIAN_STATES.map((s) => ({
                            value: s.code,
                            label: `${s.name} (${s.code})`,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="country" label="Country" initialValue="India">
                    <Input placeholder="India" />
                </Form.Item>

                <Form.Item
                    name="pincode"
                    label="Pincode"
                    rules={[
                        { pattern: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' },
                    ]}
                >
                    <Input placeholder="e.g. 175131" maxLength={6} />
                </Form.Item>

                <Form.Item
                    name="aliases"
                    label="Aliases"
                    extra="Alternate names separated by commas"
                >
                    <Input placeholder="e.g. Manali Town, Old Manali" />
                </Form.Item>

                <Form.Item label="Coordinates (optional)">
                    <Space>
                        <Form.Item name="lat" noStyle>
                            <InputNumber
                                placeholder="Latitude"
                                style={{ width: 160 }}
                                step={0.0001}
                            />
                        </Form.Item>
                        <Form.Item name="lng" noStyle>
                            <InputNumber
                                placeholder="Longitude"
                                style={{ width: 160 }}
                                step={0.0001}
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

// ── Cities Tab ────────────────────────────────────────────────────────────────

const CitiesTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [view, setView] = useState<'table' | 'map'>('table');

    const { data, isLoading } = useQuery({
        queryKey: ['cities', page, limit, search],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getCities, {
                params: { page, limit, ...(search && { search }) },
            });
            return data.data;
        },
        refetchOnWindowFocus: false,
    });

    const cities: City[] = data?.cities || [];
    const totalItems: number = data?.totalItems ?? 0;

    // Unpaginated fetch (all cities) for pin-drop map view.
    const { data: allCitiesData, isLoading: allCitiesLoading } = useQuery({
        queryKey: ['cities-all'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getCities);
            return data.data;
        },
        enabled: view === 'map',
        refetchOnWindowFocus: false,
    });

    const allCities: City[] = allCitiesData?.cities || [];

    const { mutate: deleteCity } = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await baseAPI.delete(api.deleteCity(id));
            return data;
        },
        onSuccess: () => {
            message.success('City deleted');
            queryClient.invalidateQueries({ queryKey: ['cities'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to delete'),
    });

    const handleEdit = (city: City) => {
        setEditingCity(city);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCity(null);
        setModalOpen(true);
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const columns: TableColumnsType<City> = [
        {
            title: 'City',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'State Code',
            dataIndex: 'stateCode',
            key: 'stateCode',
            width: 110,
            render: (code: string) => <Tag>{code}</Tag>,
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            width: 110,
            render: (country: string) => <Text>{country || 'India'}</Text>,
        },
        {
            title: 'Pincode',
            dataIndex: 'pincode',
            key: 'pincode',
            width: 100,
            render: (pincode: string) =>
                pincode ? <Text>{pincode}</Text> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Aliases',
            dataIndex: 'aliases',
            key: 'aliases',
            render: (aliases: string[]) =>
                aliases?.length ? (
                    <Space wrap size={[4, 4]}>
                        {aliases.map((a) => (
                            <Tag key={a}>{a}</Tag>
                        ))}
                    </Space>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: 'Coordinates',
            key: 'coords',
            width: 200,
            render: (_, record: City) => {
                const coords = record.location?.coordinates;
                if (!coords?.length) return <Text type="secondary">Not set</Text>;
                return (
                    <Tooltip title={`Lat: ${coords[1]}, Lng: ${coords[0]}`}>
                        <Tag icon={<MapPin size={12} />} color="geekblue">
                            {coords[1]?.toFixed(4)}, {coords[0]?.toFixed(4)}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 130,
            render: (_, record: City) => (
                <Space>
                    <Button
                        size="small"
                        icon={<Pencil size={13} />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title={`Delete "${record.name}"?`}
                        onConfirm={() => deleteCity(record._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<Trash2 size={13} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    gap: 12,
                }}
            >
                <Input.Search
                    placeholder="Search by name, state code or alias…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={handleSearch}
                    style={{ maxWidth: 320 }}
                    allowClear
                    onClear={() => handleSearch('')}
                    disabled={view === 'map'}
                />
                <Segmented
                    value={view}
                    onChange={(v) => setView(v as 'table' | 'map')}
                    options={[
                        { label: 'Table', value: 'table' },
                        { label: 'Map', value: 'map' },
                    ]}
                />
                <Text type="secondary">{totalItems} cities</Text>
                <Button type="primary" icon={<PlusCircle size={14} />} onClick={handleAdd}>
                    Add City
                </Button>
            </div>

            {view === 'map' ? (
                <Spin spinning={allCitiesLoading}>
                    <CityPinsMap cities={allCities} />
                </Spin>
            ) : (
                <Table
                    columns={columns}
                    dataSource={cities}
                    loading={isLoading}
                    rowKey="_id"
                    size="small"
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: totalItems,
                        onChange: (p) => setPage(p),
                        showSizeChanger: false,
                        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
                    }}
                    scroll={{ x: 700 }}
                />
            )}

            <CityModal
                open={modalOpen}
                city={editingCity}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};

// ── Featured Trips Tab ────────────────────────────────────────────────────────

const useFeaturedCategories = () =>
    useQuery({
        queryKey: ['featured-categories'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getFeaturedCategories);
            return data.data.categories as FeaturedCategory[];
        },
        refetchOnWindowFocus: false,
    });

const usePublishedTripsDropdown = (search: string) =>
    useQuery({
        queryKey: ['published-trips-dropdown', search],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getPublishedTripsForDropdown, {
                params: search ? { search } : {},
            });
            return data.data.trips as PublishedTrip[];
        },
        refetchOnWindowFocus: false,
        staleTime: 30_000,
    });

interface FeaturedCategoryCardProps {
    category: FeaturedCategory;
    onEdit: (category: FeaturedCategory) => void;
    onDelete: (id: string) => void;
}

const FeaturedCategoryCard: React.FC<FeaturedCategoryCardProps> = ({
    category,
    onEdit,
    onDelete,
}) => {
    const trips = category.tripIds || [];
    return (
        <Card
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                marginBottom: 16,
            }}
            styles={{ body: { padding: '16px 20px' } }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <div style={{ flex: 1 }}>
                    <Space align="center" style={{ marginBottom: 8 }}>
                        <Star size={16} style={{ color: '#faad14' }} />
                        <Text strong style={{ color: '#fff', fontSize: 16 }}>
                            {category.title}
                        </Text>
                        <Tag color={category.isActive ? 'green' : 'default'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                        <Tag color="blue">Priority: {category.priority}</Tag>
                    </Space>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {trips.length === 0 ? (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                No trips added yet
                            </Text>
                        ) : (
                            trips.map((trip) => (
                                <Tag
                                    key={trip._id}
                                    style={{
                                        background: 'rgba(24,144,255,0.1)',
                                        border: '1px solid rgba(24,144,255,0.3)',
                                        color: '#91caff',
                                        borderRadius: 6,
                                        padding: '2px 8px',
                                    }}
                                >
                                    <Space size={4}>
                                        <MapPin size={12} />
                                        {trip.title}
                                        {trip.location?.city && (
                                            <span style={{ opacity: 0.7 }}>({trip.location.city})</span>
                                        )}
                                    </Space>
                                </Tag>
                            ))
                        )}
                    </div>
                </div>
                <Space>
                    <Tooltip title="Edit category">
                        <Button
                            icon={<Pencil size={14} />}
                            size="small"
                            type="text"
                            style={{ color: '#8c8c8c' }}
                            onClick={() => onEdit(category)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this category?"
                        description="This will remove the category and all trip associations."
                        onConfirm={() => onDelete(category._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete category">
                            <Button icon={<Trash2 size={14} />} size="small" type="text" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            </div>
        </Card>
    );
};

interface FeaturedCategoryModalProps {
    open: boolean;
    onClose: () => void;
    initialData: FeaturedCategory | null;
}

const FeaturedCategoryModal: React.FC<FeaturedCategoryModalProps> = ({
    open,
    onClose,
    initialData,
}) => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [tripSearch, setTripSearch] = useState('');

    const { data: publishedTrips = [], isLoading: tripsLoading } =
        usePublishedTripsDropdown(tripSearch);
    const isEdit = !!initialData;

    const mutation = useMutation({
        mutationFn: async (values: {
            title: string;
            tripIds: string[];
            priority: number;
            isActive: boolean;
        }) => {
            if (isEdit && initialData) {
                const { data } = await baseAPI.patch(
                    api.updateFeaturedCategory(initialData._id),
                    values
                );
                return data;
            } else {
                const { data } = await baseAPI.post(api.createFeaturedCategory, values);
                return data;
            }
        },
        onSuccess: () => {
            message.success(`Category ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
            onClose();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err.response?.data?.message || 'Operation failed'),
    });

    React.useEffect(() => {
        if (open) {
            if (initialData) {
                form.setFieldsValue({
                    title: initialData.title,
                    tripIds: (initialData.tripIds || []).map((t) => t._id || t),
                    priority: initialData.priority ?? 0,
                    isActive: initialData.isActive ?? true,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialData, form]);

    const tripOptions = publishedTrips.map((t) => ({
        value: t._id,
        label: `${t.title}${t.location?.city ? ` — ${t.location.city}` : ''}`,
    }));

    return (
        <Modal
            title={isEdit ? 'Edit Category' : 'New Featured Trip Category'}
            open={open}
            onOk={() =>
                form.validateFields().then((values) =>
                    mutation.mutate({
                        title: values.title,
                        tripIds: values.tripIds || [],
                        priority: values.priority ?? 0,
                        isActive: values.isActive ?? true,
                    })
                )
            }
            onCancel={onClose}
            okText={isEdit ? 'Update' : 'Create'}
            confirmLoading={mutation.isPending}
            width={600}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                    name="title"
                    label="Category Title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                >
                    <Input placeholder="e.g. Top Himalayan Treks" maxLength={100} />
                </Form.Item>
                <Form.Item name="tripIds" label="Trips">
                    <Select
                        mode="multiple"
                        placeholder="Search and select trips..."
                        showSearch
                        filterOption={false}
                        onSearch={setTripSearch}
                        loading={tripsLoading}
                        options={tripOptions}
                        style={{ width: '100%' }}
                        notFoundContent={
                            tripsLoading ? (
                                <Spin size="small" />
                            ) : (
                                <Empty description="No trips found" />
                            )
                        }
                        maxTagCount="responsive"
                    />
                </Form.Item>
                <Space size={24}>
                    <Form.Item
                        name="priority"
                        label="Priority (lower = higher on page)"
                        initialValue={0}
                    >
                        <InputNumber min={0} style={{ width: 80 }} />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );
};

const FeaturedTripsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FeaturedCategory | null>(null);

    const { data: categories = [], isLoading, refetch } = useFeaturedCategories();

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await baseAPI.delete(api.deleteFeaturedCategory(id));
        },
        onSuccess: () => {
            message.success('Category deleted');
            queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err.response?.data?.message || 'Failed to delete'),
    });

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingCategory(null);
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Text type="secondary">{categories.length} categories on landing page</Text>
                <Space>
                    <Button onClick={() => refetch()} loading={isLoading}>
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        onClick={() => {
                            setEditingCategory(null);
                            setModalOpen(true);
                        }}
                    >
                        New Category
                    </Button>
                </Space>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                </div>
            ) : categories.length === 0 ? (
                <Card
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center',
                    }}
                    styles={{ body: { padding: '60px 20px' } }}
                >
                    <Star size={40} style={{ color: '#faad14', marginBottom: 16 }} />
                    <div>
                        <Text strong style={{ color: '#fff', display: 'block', fontSize: 16 }}>
                            No categories yet
                        </Text>
                        <Text type="secondary">
                            Create a category to feature trips on the landing page.
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        style={{ marginTop: 24 }}
                        onClick={() => setModalOpen(true)}
                    >
                        Create Category
                    </Button>
                </Card>
            ) : (
                categories.map((cat) => (
                    <FeaturedCategoryCard
                        key={cat._id}
                        category={cat}
                        onEdit={(c) => {
                            setEditingCategory(c);
                            setModalOpen(true);
                        }}
                        onDelete={(id) => deleteMutation.mutate(id)}
                    />
                ))
            )}

            <FeaturedCategoryModal
                open={modalOpen}
                onClose={handleModalClose}
                initialData={editingCategory}
            />
        </div>
    );
};

// ── Active Locations Tab ──────────────────────────────────────────────────────

interface ActiveLocation {
    _id: string;
    location: {
        type: string;
        coordinates: [number, number];
        address?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    isActive: boolean;
}

interface ActiveLocationModalProps {
    open: boolean;
    entry: ActiveLocation | null;
    onClose: () => void;
}

const ActiveLocationModal: React.FC<ActiveLocationModalProps> = ({ open, entry, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (open) {
            if (entry) {
                form.setFieldsValue({
                    lat: entry.location.coordinates[1],
                    lng: entry.location.coordinates[0],
                    address: entry.location.address || '',
                    city: entry.location.city || '',
                    state: entry.location.state || '',
                    country: entry.location.country || 'India',
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ country: 'India' });
            }
        }
    }, [open, entry, form]);

    const { mutate: save, isPending } = useMutation({
        mutationFn: async (values: {
            lat: number;
            lng: number;
            address?: string;
            city?: string;
            state?: string;
            country?: string;
        }) => {
            const payload = {
                coordinates: [Number(values.lng), Number(values.lat)],
                address: values.address?.trim() || undefined,
                city: values.city?.trim() || undefined,
                state: values.state?.trim() || undefined,
                country: values.country?.trim() || 'India',
            };
            if (entry?._id) {
                const { data } = await baseAPI.put(api.updateActiveLocation(entry._id), payload);
                return data;
            } else {
                const { data } = await baseAPI.post(api.addActiveLocation, payload);
                return data;
            }
        },
        onSuccess: () => {
            message.success(entry?._id ? 'Location updated!' : 'Location added!');
            queryClient.invalidateQueries({ queryKey: ['active-locations'] });
            onClose();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to save location'),
    });

    return (
        <Modal
            title={entry?._id ? 'Edit Active Location' : 'Add Active Location'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={isPending}
            okText={entry?._id ? 'Update' : 'Add'}
            width={520}
        >
            <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }}>
                <Form.Item label="Coordinates (required)">
                    <Space>
                        <Form.Item
                            name="lat"
                            noStyle
                            rules={[
                                { required: true, message: 'Latitude is required' },
                                { type: 'number', min: -90, max: 90, message: 'Lat: -90 to 90' },
                            ]}
                        >
                            <InputNumber
                                placeholder="Latitude"
                                style={{ width: 170 }}
                                step={0.0001}
                            />
                        </Form.Item>
                        <Form.Item
                            name="lng"
                            noStyle
                            rules={[
                                { required: true, message: 'Longitude is required' },
                                { type: 'number', min: -180, max: 180, message: 'Lng: -180 to 180' },
                            ]}
                        >
                            <InputNumber
                                placeholder="Longitude"
                                style={{ width: 170 }}
                                step={0.0001}
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>

                <Form.Item name="address" label="Address">
                    <Input placeholder="e.g. Near Mall Road Bus Stand" />
                </Form.Item>

                <Form.Item name="city" label="City">
                    <Input placeholder="e.g. Manali" />
                </Form.Item>

                <Form.Item name="state" label="State">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select a state"
                        optionFilterProp="label"
                        options={INDIAN_STATES.map((s) => ({
                            value: s.name,
                            label: `${s.name} (${s.code})`,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="country" label="Country" initialValue="India">
                    <Input placeholder="India" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ActiveLocationsTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<ActiveLocation | null>(null);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['active-locations'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getActiveLocations);
            return data.data;
        },
        refetchOnWindowFocus: false,
    });

    const locations: ActiveLocation[] = data?.activeLocations || [];

    const filtered = locations.filter(
        (loc) =>
            !search ||
            loc.location.city?.toLowerCase().includes(search.toLowerCase()) ||
            loc.location.state?.toLowerCase().includes(search.toLowerCase()) ||
            loc.location.address?.toLowerCase().includes(search.toLowerCase())
    );

    const { mutate: toggleLocation } = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await baseAPI.patch(api.toggleActiveLocation(id));
            return data;
        },
        onSuccess: () => {
            message.success('Location status updated');
            queryClient.invalidateQueries({ queryKey: ['active-locations'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to toggle'),
    });

    const { mutate: deleteLocation } = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await baseAPI.delete(api.deleteActiveLocation(id));
            return data;
        },
        onSuccess: () => {
            message.success('Location deleted');
            queryClient.invalidateQueries({ queryKey: ['active-locations'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to delete'),
    });

    const columns: TableColumnsType<ActiveLocation> = [
        {
            title: 'City',
            key: 'city',
            render: (_, record) => (
                <Text strong>{record.location.city || <Text type="secondary">—</Text>}</Text>
            ),
            sorter: (a, b) =>
                (a.location.city || '').localeCompare(b.location.city || ''),
        },
        {
            title: 'State',
            key: 'state',
            render: (_, record) =>
                record.location.state ? (
                    <Tag>{record.location.state}</Tag>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: 'Address',
            key: 'address',
            render: (_, record) =>
                record.location.address ? (
                    <Text style={{ fontSize: 12 }}>{record.location.address}</Text>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: 'Coordinates',
            key: 'coords',
            width: 200,
            render: (_, record) => {
                const coords = record.location.coordinates;
                return (
                    <Tooltip title={`Lat: ${coords[1]}, Lng: ${coords[0]}`}>
                        <Tag icon={<MapPin size={12} />} color="geekblue">
                            {coords[1]?.toFixed(4)}, {coords[0]?.toFixed(4)}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Active',
            key: 'isActive',
            width: 90,
            render: (_, record) => (
                <Switch
                    checked={record.isActive}
                    size="small"
                    onChange={() => toggleLocation(record._id)}
                />
            ),
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 110,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<Pencil size={13} />}
                        onClick={() => {
                            setEditingEntry(record);
                            setModalOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this location?"
                        onConfirm={() => deleteLocation(record._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<Trash2 size={13} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    gap: 12,
                }}
            >
                <Input.Search
                    placeholder="Search by city, state or address…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 320 }}
                    allowClear
                />
                <Text type="secondary">{filtered.length} locations</Text>
                <Button
                    type="primary"
                    icon={<PlusCircle size={14} />}
                    onClick={() => {
                        setEditingEntry(null);
                        setModalOpen(true);
                    }}
                >
                    Add Location
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filtered}
                loading={isLoading}
                rowKey="_id"
                size="small"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 700 }}
                rowClassName={(record) => (!record.isActive ? 'row-inactive' : '')}
            />

            <ActiveLocationModal
                open={modalOpen}
                entry={editingEntry}
                onClose={() => {
                    setModalOpen(false);
                    setEditingEntry(null);
                }}
            />
        </div>
    );
};

// ── Signup Bonus Tab ──────────────────────────────────────────────────────────

interface SignupBonusData {
    signupBonus: {
        amount: number;
        isEnabled: boolean;
    };
}

const SignupBonusTab: React.FC = () => {
    const [form] = Form.useForm();
    const [editVisible, setEditVisible] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['signup-bonus'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getSignupBonus);
            return data.data as SignupBonusData;
        },
    });

    const { mutate: updateBonus, isPending } = useMutation({
        mutationFn: async (values: { amount: number; isEnabled: boolean }) => {
            const { data } = await baseAPI.put(api.updateSignupBonus, values);
            return data;
        },
        onSuccess: () => {
            message.success('Signup bonus updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['signup-bonus'] });
            setEditVisible(false);
            form.resetFields();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to update signup bonus'),
    });

    React.useEffect(() => {
        if (editVisible && data?.signupBonus) {
            form.setFieldsValue({
                amount: data.signupBonus.amount,
                isEnabled: data.signupBonus.isEnabled,
            });
        }
    }, [editVisible, data, form]);

    return (
        <div>
            <Spin spinning={isLoading}>
                {data?.signupBonus ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Current Status Card */}
                        <Card
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                        Bonus Amount
                                    </Text>
                                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                                        ₹{data.signupBonus.amount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                        Status
                                    </Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag
                                            color={data.signupBonus.isEnabled ? 'green' : 'red'}
                                            style={{ fontSize: 12, padding: '6px 12px' }}
                                        >
                                            {data.signupBonus.isEnabled ? 'ENABLED' : 'DISABLED'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Edit Button */}
                        <Button
                            type="primary"
                            onClick={() => setEditVisible(true)}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Edit Signup Bonus
                        </Button>

                        {/* Info Message */}
                        <Card
                            style={{
                                background: 'rgba(24, 144, 255, 0.1)',
                                border: '1px solid rgba(24, 144, 255, 0.2)',
                            }}
                            size="small"
                        >
                            <Text style={{ color: '#1890ff', fontSize: 12 }}>
                                💡 <strong>Tip:</strong> This bonus amount will be credited to new users who sign up. Users can see this
                                in the app and use it for their first booking if enabled.
                            </Text>
                        </Card>
                    </div>
                ) : (
                    <Empty description="No signup bonus data found" />
                )}
            </Spin>

            {/* Edit Modal */}
            <Modal
                title="Edit Signup Bonus"
                open={editVisible}
                onCancel={() => {
                    setEditVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={isPending}
                okText="Update"
                width={440}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        updateBonus({
                            amount: values.amount,
                            isEnabled: values.isEnabled,
                        });
                    }}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="amount"
                        label="Bonus Amount (₹)"
                        rules={[
                            { required: true, message: 'Please enter the bonus amount' },
                            {
                                pattern: /^\d+(\.\d{1,2})?$/,
                                message: 'Please enter a valid amount',
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={100000}
                            placeholder="e.g. 500"
                            style={{ width: '100%' }}
                            precision={0}
                            formatter={(value) => `₹${value}`}
                            parser={(value) => Number(value?.replace('₹', '') || '0') as any}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isEnabled"
                        label="Enable Signup Bonus"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item noStyle>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div
                                style={{
                                    padding: '12px',
                                    background: 'rgba(255, 193, 7, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 193, 7, 0.2)',
                                }}
                            >
                                <Text style={{ color: '#ffc107', fontSize: 12 }}>
                                    <strong>⚠️ Note:</strong> Once enabled, new users will see this bonus and can apply it to
                                    their bookings. The amount will be deducted from their wallet.
                                </Text>
                            </div>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// ── Payment Gateway Tab ───────────────────────────────────────────────────────

type PaymentGateway = 'razorpay' | 'cashfree';

interface PaymentGatewayData {
    paymentGateway: {
        active: PaymentGateway;
    };
}

const GATEWAY_LABELS: Record<PaymentGateway, string> = {
    razorpay: 'Razorpay',
    cashfree: 'Cashfree',
};

const PaymentGatewayTab: React.FC = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['payment-gateway'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getPaymentGateway);
            return data.data as PaymentGatewayData;
        },
    });

    const { mutate: updateGateway, isPending } = useMutation({
        mutationFn: async (active: PaymentGateway) => {
            const { data } = await baseAPI.put(api.updatePaymentGateway, { active });
            return data;
        },
        onSuccess: (_, active) => {
            message.success(`New orders will now use ${GATEWAY_LABELS[active]}`);
            queryClient.invalidateQueries({ queryKey: ['payment-gateway'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to update payment gateway'),
    });

    const active = data?.paymentGateway?.active ?? 'razorpay';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Spin spinning={isLoading}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 16,
                        }}
                    >
                        <div>
                            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                Active Gateway
                            </Text>
                            <div style={{ marginTop: 8 }}>
                                <Tag
                                    color={active === 'cashfree' ? 'blue' : 'purple'}
                                    style={{ fontSize: 14, padding: '6px 14px' }}
                                >
                                    {GATEWAY_LABELS[active]}
                                </Tag>
                            </div>
                        </div>

                        <Space>
                            {(['razorpay', 'cashfree'] as PaymentGateway[]).map((gateway) =>
                                gateway === active ? (
                                    <Button key={gateway} type="primary" disabled>
                                        {GATEWAY_LABELS[gateway]} (Active)
                                    </Button>
                                ) : (
                                    <Popconfirm
                                        key={gateway}
                                        title={`Switch to ${GATEWAY_LABELS[gateway]}?`}
                                        description="New orders will start using this gateway immediately. Orders already in flight keep settling on the gateway they were created with."
                                        onConfirm={() => updateGateway(gateway)}
                                        okText="Switch"
                                        okButtonProps={{ loading: isPending }}
                                    >
                                        <Button loading={isPending}>Use {GATEWAY_LABELS[gateway]}</Button>
                                    </Popconfirm>
                                )
                            )}
                        </Space>
                    </div>
                </Spin>
            </Card>

            <Card
                style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.2)' }}
                size="small"
            >
                <Text style={{ color: '#1890ff', fontSize: 12 }}>
                    💡 <strong>Tip:</strong> This only decides which gateway <em>new</em> orders use. Payments already
                    in progress keep settling on whichever gateway they were created with, so switching never strands
                    a pending payment.
                </Text>
            </Card>
        </div>
    );
};

// ── Traveler Stats Tab ────────────────────────────────────────────────────────

const TravelerStatsTab: React.FC = () => {
    const [globalEditVisible, setGlobalEditVisible] = useState(false);
    const [addTripVisible, setAddTripVisible] = useState(false);
    const [editingTrip, setEditingTrip] = useState<TravelerStat | null>(null);
    const [tripSearch, setTripSearch] = useState('');
    const [globalForm] = Form.useForm();
    const [tripForm] = Form.useForm();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['traveler-stats'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getTravelerStats);
            return data.data as TravelerStatsData;
        },
        refetchOnWindowFocus: false,
    });

    const { data: publishedTrips = [] } = usePublishedTripsDropdown(tripSearch);

    const { mutate: updateGlobal, isPending: updatingGlobal } = useMutation({
        mutationFn: async (values: { count: number }) => {
            const { data } = await baseAPI.put(api.updateGlobalTravelerStats, values);
            return data;
        },
        onSuccess: () => {
            message.success('Global traveler count updated!');
            queryClient.invalidateQueries({ queryKey: ['traveler-stats'] });
            setGlobalEditVisible(false);
            globalForm.resetFields();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to update'),
    });

    const { mutate: upsertTripStat, isPending: upsertingTrip } = useMutation({
        mutationFn: async ({ slug, count }: { slug: string; count: number }) => {
            const { data } = await baseAPI.put(api.updateTripTravelerStats(slug), { count });
            return data;
        },
        onSuccess: () => {
            message.success('Trip traveler count saved!');
            queryClient.invalidateQueries({ queryKey: ['traveler-stats'] });
            setAddTripVisible(false);
            setEditingTrip(null);
            tripForm.resetFields();
            setTripSearch('');
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to save'),
    });

    const { mutate: deleteTripStat } = useMutation({
        mutationFn: async (slug: string) => {
            await baseAPI.delete(api.deleteTripTravelerStats(slug));
        },
        onSuccess: () => {
            message.success('Trip stat deleted');
            queryClient.invalidateQueries({ queryKey: ['traveler-stats'] });
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to delete'),
    });

    React.useEffect(() => {
        if (globalEditVisible && data?.global) {
            globalForm.setFieldsValue({ count: data.global.count });
        }
    }, [globalEditVisible, data, globalForm]);

    React.useEffect(() => {
        if (editingTrip) {
            tripForm.setFieldsValue({ count: editingTrip.count });
        }
    }, [editingTrip, tripForm]);

    const tripColumns: TableColumnsType<TravelerStat> = [
        {
            title: 'Trip Slug',
            dataIndex: '_id',
            key: 'slug',
            render: (slug: string) => <Tag>{slug}</Tag>,
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => (
                <Text style={{ color: '#1890ff', fontWeight: 600 }}>{count}+</Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: TravelerStat) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            icon={<Pencil size={14} />}
                            size="small"
                            type="text"
                            style={{ color: '#8c8c8c' }}
                            onClick={() => setEditingTrip(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this entry?"
                        onConfirm={() => deleteTripStat(record._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button icon={<Trash2 size={14} />} size="small" type="text" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const closeTripModal = () => {
        setAddTripVisible(false);
        setEditingTrip(null);
        tripForm.resetFields();
        setTripSearch('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Global Count */}
            <div>
                <Text strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 16 }}>
                    Global Traveler Count
                </Text>
                <Spin spinning={isLoading}>
                    <Card
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                    Shown on Homepage
                                </Text>
                                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 600, color: '#1890ff' }}>
                                    {data?.global?.count ?? 156}+
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Travellers booked with us last month
                                </Text>
                            </div>
                            <Button type="primary" onClick={() => setGlobalEditVisible(true)}>
                                Edit Count
                            </Button>
                        </div>
                    </Card>
                </Spin>
            </div>

            {/* Per-Trip Counts */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text strong style={{ color: '#fff', fontSize: 16 }}>
                        Per-Trip Traveler Counts
                    </Text>
                    <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        onClick={() => { tripForm.resetFields(); setAddTripVisible(true); }}
                    >
                        Add Trip Count
                    </Button>
                </div>
                <Spin spinning={isLoading}>
                    <Table
                        dataSource={data?.trips || []}
                        columns={tripColumns}
                        rowKey="_id"
                        pagination={false}
                        size="small"
                        locale={{ emptyText: <Empty description="No per-trip counts set" /> }}
                    />
                </Spin>
            </div>

            {/* Global Edit Modal */}
            <Modal
                title="Edit Global Traveler Count"
                open={globalEditVisible}
                onCancel={() => { setGlobalEditVisible(false); globalForm.resetFields(); }}
                onOk={() => globalForm.submit()}
                confirmLoading={updatingGlobal}
                okText="Update"
                width={400}
            >
                <Form
                    form={globalForm}
                    layout="vertical"
                    onFinish={(values) => updateGlobal({ count: values.count })}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="count"
                        label="Traveler Count"
                        rules={[{ required: true, message: 'Please enter a count' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 156" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add / Edit Trip Modal */}
            <Modal
                title={editingTrip ? 'Edit Trip Traveler Count' : 'Add Trip Traveler Count'}
                open={addTripVisible || !!editingTrip}
                onCancel={closeTripModal}
                onOk={() => tripForm.submit()}
                confirmLoading={upsertingTrip}
                okText={editingTrip ? 'Update' : 'Add'}
                width={440}
            >
                <Form
                    form={tripForm}
                    layout="vertical"
                    onFinish={(values) => {
                        const slug = editingTrip ? editingTrip._id : values.tripSlug;
                        upsertTripStat({ slug, count: values.count });
                    }}
                    style={{ marginTop: 16 }}
                >
                    {editingTrip ? (
                        <Form.Item label="Trip">
                            <Tag>{editingTrip._id}</Tag>
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="tripSlug"
                            label="Trip"
                            rules={[{ required: true, message: 'Please select a trip' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Search and select a trip"
                                filterOption={false}
                                onSearch={setTripSearch}
                                options={publishedTrips.map((t) => ({
                                    value: t.slug,
                                    label: `${t.title}${t.location?.city ? ` (${t.location.city})` : ''}`,
                                }))}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="count"
                        label="Traveler Count"
                        rules={[{ required: true, message: 'Please enter a count' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 50" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// ── Platform Settings Tab (Signup Bonus + Payment Gateway + Traveler Stats) ────
// Each section below owns its own query key and mutations, so they save independently.

const PlatformSettingsTab: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
            <Text strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 16 }}>
                Signup Bonus
            </Text>
            <SignupBonusTab />
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <div>
            <Text strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 16 }}>
                Payment Gateway
            </Text>
            <PaymentGatewayTab />
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <div>
            <Text strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 16 }}>
                Traveler Stats
            </Text>
            <TravelerStatsTab />
        </div>
    </div>
);

// ── Explore States Tab ────────────────────────────────────────────────────────

interface ExploreState {
    stateCode: string;
    name: string;
    imageUrl: string;
}

const ExploreStatesTab: React.FC = () => {
    const [form] = Form.useForm();
    const [addVisible, setAddVisible] = useState(false);
    const queryClient = useQueryClient();

    const { data: states = [], isLoading } = useQuery({
        queryKey: ['explore-states'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getExploreStates);
            return (data.data?.exploreStates || []) as ExploreState[];
        },
    });

    const { mutate: save, isPending } = useMutation({
        mutationFn: async (exploreStates: ExploreState[]) => {
            const { data } = await baseAPI.put(api.updateExploreStates, { exploreStates });
            return data;
        },
        onSuccess: () => {
            message.success('Explore states updated!');
            queryClient.invalidateQueries({ queryKey: ['explore-states'] });
            setAddVisible(false);
            form.resetFields();
        },
        onError: (err: { response?: { data?: { message?: string } } }) =>
            message.error(err?.response?.data?.message || 'Failed to update explore states'),
    });

    // "International" is a reserved special entry — shows trips where country !== India instead of an Indian state.
    const INTERNATIONAL_OPTION = { code: 'INTL', name: 'International' };
    const selectableStates = [...INDIAN_STATES, INTERNATIONAL_OPTION];

    const chosenCodes = new Set(states.map((s) => s.stateCode));
    const availableStates = selectableStates.filter((s) => !chosenCodes.has(s.code));

    const handleAdd = (values: { stateCode: string; imageUrl: string }) => {
        const meta = selectableStates.find((s) => s.code === values.stateCode);
        if (!meta) return;
        save([...states, { stateCode: meta.code, name: meta.name, imageUrl: values.imageUrl.trim() }]);
    };

    const handleRemove = (stateCode: string) => {
        save(states.filter((s) => s.stateCode !== stateCode));
    };

    const columns: TableColumnsType<ExploreState> = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 90,
            render: (url: string) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={url}
                    alt=""
                    style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 6 }}
                />
            ),
        },
        { title: 'State', dataIndex: 'name', key: 'name' },
        {
            title: 'Code',
            dataIndex: 'stateCode',
            key: 'stateCode',
            width: 80,
            render: (code: string) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Image URL',
            dataIndex: 'imageUrl',
            key: 'url',
            ellipsis: true,
            render: (url: string) => (
                <Text type="secondary" style={{ fontSize: 12 }} copyable>
                    {url}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Popconfirm
                    title="Remove this state?"
                    onConfirm={() => handleRemove(record.stateCode)}
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger size="small" icon={<Trash2 size={14} />} loading={isPending} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text type="secondary">
                    States shown in the landing page <strong>Explore by Destination</strong> section. Ordering on the
                    site is automatic — by live trip count (highest first).
                </Text>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setAddVisible(true)}
                    disabled={availableStates.length === 0}
                >
                    Add State
                </Button>
            </div>

            <Spin spinning={isLoading}>
                {states.length > 0 ? (
                    <Table rowKey="stateCode" columns={columns} dataSource={states} pagination={false} />
                ) : (
                    <Empty description="No states selected yet" />
                )}
            </Spin>

            <Card
                style={{ marginTop: 24, background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.2)' }}
                size="small"
            >
                <Text style={{ color: '#1890ff', fontSize: 12 }}>
                    💡 <strong>Tip:</strong> Pick a high-quality landscape image (e.g. an Unsplash URL) for each state.
                    Recommended ~800×600. Only states with upcoming trips will show a live trip count to users.
                </Text>
            </Card>

            <Modal
                title="Add Explore State"
                open={addVisible}
                onCancel={() => {
                    setAddVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={isPending}
                okText="Add"
                width={480}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="stateCode"
                        label="State"
                        rules={[{ required: true, message: 'Please select a state' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a state"
                            optionFilterProp="label"
                            options={availableStates.map((s) => ({ value: s.code, label: `${s.name} (${s.code})` }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="imageUrl"
                        label="Image URL"
                        rules={[
                            { required: true, message: 'Image URL is required' },
                            { type: 'url', message: 'Enter a valid URL' },
                        ]}
                    >
                        <Input placeholder="https://images.unsplash.com/..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// ── Main Configs Page ─────────────────────────────────────────────────────────

export default function ConfigsPage() {
    const tabItems = [
        {
            key: 'categories',
            label: (
                <Space>
                    <Tags size={16} />
                    Categories
                </Space>
            ),
            children: <CategoriesTab />,
        },
        {
            key: 'cities',
            label: (
                <Space>
                    <MapPin size={16} />
                    Cities
                </Space>
            ),
            children: <CitiesTab />,
        },
        {
            key: 'featuredtrips',
            label: (
                <Space>
                    <Star size={16} />
                    Featured Trips
                </Space>
            ),
            children: <FeaturedTripsTab />,
        },
        {
            key: 'activelocations',
            label: (
                <Space>
                    <Navigation size={16} />
                    Active Locations
                </Space>
            ),
            children: <ActiveLocationsTab />,
        },
        {
            key: 'platformsettings',
            label: (
                <Space>
                    <Settings size={16} />
                    Platform Settings
                </Space>
            ),
            children: <PlatformSettingsTab />,
        },
        {
            key: 'explorestates',
            label: (
                <Space>
                    <Compass size={16} />
                    Explore States
                </Space>
            ),
            children: <ExploreStatesTab />,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: { colorPrimary: '#1890ff', borderRadius: 8 },
            }}
        >
            <div
                style={{
                    padding: '24px',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
                        App Configs
                    </Title>
                    <Text type="secondary">
                        Manage trip categories, cities, landing page featured trips, active locations, and signup bonuses
                    </Text>
                </div>

                <Card
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    styles={{ body: { padding: '24px' } }}
                >
                    <Tabs items={tabItems} defaultActiveKey="categories" />
                </Card>
            </div>
        </ConfigProvider>
    );
}
