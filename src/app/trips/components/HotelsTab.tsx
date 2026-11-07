'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Empty, Form, Input, Modal, Popconfirm, Select, Space, Spin, Table, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Pencil, Trash2, X, Upload, BedDouble } from 'lucide-react';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import useS3Upload from '@/common/hooks/useS3Upload';
import ImageCropModal from '@/common/ui/ImageCropModal';
import { Hotel, INDIAN_STATES } from '../constant';

const { Text } = Typography;
const CF = process.env.NEXT_PUBLIC_CLOUDFRONT_URL ?? '';
const MAX_IMAGES = 10;
// Matches the client stays grid tiles (4:3); the client lightbox shows the whole crop.
const CROP_ASPECT = 4 / 3;
const toSrc = (path: string) => (path.startsWith('http') ? path : `${CF}${path}`);

interface CityRecord { _id: string; name: string; stateCode: string; aliases?: string[] }
const stateName = (code: string) => INDIAN_STATES.find(s => s.code === code)?.name || code;
const STATE_OPTIONS = INDIAN_STATES.map(s => ({ value: s.name, label: s.name }));

const errMsg = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

// ---------- HotelModal ----------

interface HotelModalProps {
    tripId: string;
    editing: Hotel | null;
    onClose: () => void;
}

const HotelModal: React.FC<HotelModalProps> = ({ tripId, editing, onClose }) => {
    const [form] = Form.useForm<{ name: string; city?: string; state?: string }>();
    const [images, setImages] = useState<string[]>(editing?.images || []);
    // Files picked but not yet cropped — cropped one at a time, uploaded as each crop is confirmed.
    const [cropQueue, setCropQueue] = useState<{ src: string; name: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImages, isUploading } = useS3Upload();
    const queryClient = useQueryClient();
    const isEdit = !!editing;

    // Same query as TripDetailModal's location linker — shares the ['cities'] cache.
    const { data: cities = [], isLoading: citiesLoading } = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data } = await baseAPI.get(api.getCities);
            return (data as { data: { cities?: CityRecord[] } }).data;
        },
        select: (d) => d?.cities || [],
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const cityOptions = cities.map(c => ({
        value: c.name,
        label: `${c.name}, ${stateName(c.stateCode)}`,
        search: [c.name, stateName(c.stateCode), ...(c.aliases || [])].join(' ').toLowerCase(),
    }));

    useEffect(() => {
        form.setFieldsValue({ name: editing?.name || '', city: editing?.city || '', state: editing?.state || '' });
    }, [editing, form]);

    const mutation = useMutation({
        mutationFn: (body: { name: string; city: string; state: string; images: string[] }) => isEdit
            ? baseAPI.patch(api.tripHotel(tripId, editing!._id), body)
            : baseAPI.post(api.getTripHotels(tripId), body),
        onSuccess: () => {
            message.success(isEdit ? 'Hotel updated' : 'Hotel added');
            queryClient.invalidateQueries({ queryKey: ['trip-hotels', tripId] });
            onClose();
        },
        onError: (err) => message.error(errMsg(err, 'Failed to save hotel')),
    });

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES - images.length - cropQueue.length);
        e.target.value = '';
        if (!files.length) return;
        setCropQueue(prev => [...prev, ...files.map(f => ({ src: URL.createObjectURL(f), name: f.name }))]);
    };

    const nextCrop = () => setCropQueue(([current, ...rest]) => {
        if (current) URL.revokeObjectURL(current.src);
        return rest;
    });

    const handleCropped = async (file: File) => {
        nextCrop();
        const [result] = await uploadImages([file]);
        if (result?.success) setImages(prev => [...prev, result.url]);
    };

    // ponytail: closing mid-crop leaves the queued blob URLs until page unload; revoke on unmount if it matters.

    return (
        <Modal
            open
            title={isEdit ? 'Edit Hotel' : 'Add Hotel'}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            okButtonProps={{ disabled: isUploading || cropQueue.length > 0 }}
            okText={isEdit ? 'Update' : 'Add'}
            width={560}
        >
            <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate({ name: v.name.trim(), city: (v.city || '').trim(), state: (v.state || '').trim(), images })}>
                <Form.Item
                    label="Hotel name"
                    name="name"
                    rules={[{ required: true, whitespace: true, message: 'Required' }, { max: 200 }]}
                >
                    <Input placeholder="e.g. Snow Valley Resort" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-3">
                    <Form.Item label="City" name="city" extra="Picks the state too. Travellers see hotels grouped by city">
                        <Select
                            showSearch
                            allowClear
                            loading={citiesLoading}
                            placeholder="Search city"
                            options={cityOptions}
                            filterOption={(input, opt) => !!opt?.search.includes(input.toLowerCase())}
                            onChange={(name?: string) => {
                                const c = cities.find(x => x.name === name);
                                if (c) form.setFieldValue('state', stateName(c.stateCode));
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="State" name="state" extra="Only needed if the city isn't listed">
                        <Select showSearch allowClear placeholder="Select state" options={STATE_OPTIONS} />
                    </Form.Item>
                </div>
                <Form.Item label={`Images (optional, max ${MAX_IMAGES})`}>
                    <Space wrap>
                        {images.map((src, i) => (
                            <div key={src} className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={toSrc(src)} alt={`Hotel ${i + 1}`} className="w-24 h-20 object-cover rounded border border-white/20" />
                                <button
                                    type="button"
                                    onClick={() => setImages(prev => prev.filter(p => p !== src))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    aria-label="Remove image"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </Space>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                    <div style={{ marginTop: 8 }}>
                        <Button
                            icon={<Upload size={14} />}
                            loading={isUploading}
                            disabled={images.length + cropQueue.length >= MAX_IMAGES}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? 'Uploading...' : 'Upload images'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>

            <ImageCropModal
                key={cropQueue[0]?.src}
                open={cropQueue.length > 0}
                imageSrc={cropQueue[0]?.src ?? null}
                fileName={cropQueue[0]?.name ?? 'hotel.jpg'}
                aspect={CROP_ASPECT}
                onCancel={nextCrop}
                onCropped={handleCropped}
            />
        </Modal>
    );
};

// ---------- HotelsTab ----------

const HotelsTab: React.FC<{ tripId: string }> = ({ tripId }) => {
    const [modalState, setModalState] = useState<null | 'add' | Hotel>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['trip-hotels', tripId],
        queryFn: async () => {
            const res = await baseAPI.get(api.getTripHotels(tripId));
            return (res.data?.data?.hotels || []) as Hotel[];
        },
        enabled: !!tripId,
    });
    const hotels = data || [];

    const deleteMutation = useMutation({
        mutationFn: (hotelId: string) => baseAPI.delete(api.tripHotel(tripId, hotelId)),
        onSuccess: () => {
            message.success('Hotel deleted');
            queryClient.invalidateQueries({ queryKey: ['trip-hotels', tripId] });
        },
        onError: (err) => message.error(errMsg(err, 'Delete failed')),
    });

    const columns = [
        {
            title: 'Image', dataIndex: 'images', key: 'image', width: 90,
            render: (imgs: string[]) => imgs?.[0]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={toSrc(imgs[0])} alt="" className="w-16 h-12 object-cover rounded" />
                : <BedDouble size={20} style={{ opacity: 0.4 }} />,
        },
        { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
        {
            title: 'Location', key: 'location',
            render: (_: unknown, h: Hotel) => [h.city, h.state].filter(Boolean).join(', ') || <Text type="secondary">—</Text>,
        },
        { title: 'Photos', dataIndex: 'images', key: 'count', width: 80, render: (imgs: string[]) => imgs?.length || 0 },
        {
            title: '', key: 'actions', width: 90,
            render: (_: unknown, record: Hotel) => (
                <Space>
                    <Button size="small" icon={<Pencil size={12} />} onClick={() => setModalState(record)} />
                    <Popconfirm
                        title="Delete this hotel?"
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
            <div className="flex justify-between items-center">
                <Text type="secondary">Shown to travellers as indicative stays — &quot;or similar&quot; is always displayed.</Text>
                <Button type="primary" icon={<PlusCircle size={14} />} onClick={() => setModalState('add')}>
                    Add Hotel
                </Button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : hotels.length === 0 ? (
                <Empty description="No hotels added for this trip yet." />
            ) : (
                <Table columns={columns} dataSource={hotels} rowKey="_id" size="small" pagination={false} />
            )}

            {modalState && (
                <HotelModal
                    tripId={tripId}
                    editing={modalState !== 'add' ? modalState : null}
                    onClose={() => setModalState(null)}
                />
            )}
        </Space>
    );
};

export default HotelsTab;
