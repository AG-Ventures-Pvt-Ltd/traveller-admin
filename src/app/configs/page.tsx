'use client'

import React, { useState } from 'react';
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
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusCircle, Pencil, Trash2, MapPin, Tags, Star, Plus, Navigation, Gift } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

// ── Types ─────────────────────────────────────────────────────────────────────

interface City {
    _id: string;
    name: string;
    stateCode: string;
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
    location?: { city?: string };
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
                    pincode: city.pincode || '',
                    aliases: city.aliases?.join(', ') || '',
                    lat: city.location?.coordinates?.[1],
                    lng: city.location?.coordinates?.[0],
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, city, form]);

    const { mutate: save, isPending } = useMutation({
        mutationFn: async (values: {
            name: string;
            stateCode: string;
            pincode?: string;
            aliases?: string;
            lat?: number;
            lng?: number;
        }) => {
            const payload = {
                name: values.name.trim(),
                stateCode: values.stateCode,
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

    const { data, isLoading } = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getCities);
            return data.data;
        },
        refetchOnWindowFocus: false,
    });

    const cities: City[] = data?.cities || [];

    const filtered = cities.filter(
        (c) =>
            !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.stateCode.toLowerCase().includes(search.toLowerCase())
    );

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

    const columns: TableColumnsType<City> = [
        {
            title: 'City',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'State Code',
            dataIndex: 'stateCode',
            key: 'stateCode',
            width: 110,
            render: (code: string) => <Tag>{code}</Tag>,
            filters: [...new Set(cities.map((c) => c.stateCode))]
                .sort()
                .map((code) => ({ text: code, value: code })),
            onFilter: (value, record) => record.stateCode === value,
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
                    placeholder="Search by name or state code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 320 }}
                    allowClear
                />
                <Text type="secondary">{filtered.length} cities</Text>
                <Button type="primary" icon={<PlusCircle size={14} />} onClick={handleAdd}>
                    Add City
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
            />

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
                            parser={(value) => parseInt(value?.replace('₹', '') || '0')}
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
            key: 'signupbonus',
            label: (
                <Space>
                    <Gift size={16} />
                    Signup Bonus
                </Space>
            ),
            children: <SignupBonusTab />,
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
