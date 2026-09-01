'use client';

import React, { useMemo, useState } from 'react';
import {
    Modal, Form, Select, Radio, InputNumber, Input, DatePicker, Button,
    Checkbox, message, Empty, Divider, Typography, Tag,
} from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { Trash2 } from 'lucide-react';
import { useGetData } from '@/services/useGetData';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import { Trip } from '../constant';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const DAY_OPTIONS = [
    { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

interface HostLocation {
    _id: string;
    name: string;
    category: 'meeting_point' | 'drop_point';
}

interface MeetingPointRow {
    location: string;
    name: string;
    pickupPrice: number;
}

type ScheduleType = 'weekly' | 'monthly' | 'custom';

interface BulkBatchCreateModalProps {
    visible: boolean;
    onClose: () => void;
}

// Expand a [start, end] month range into ['YYYY-MM', ...] entries, inclusive.
const expandMonths = (range: [Dayjs, Dayjs]): string[] => {
    const months: string[] = [];
    let cur = range[0].startOf('month');
    const last = range[1].startOf('month');
    while (cur.valueOf() <= last.valueOf()) {
        months.push(cur.format('YYYY-MM'));
        cur = cur.add(1, 'month');
    }
    return months;
};

const BulkBatchCreateModal: React.FC<BulkBatchCreateModalProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const scheduleType: ScheduleType = Form.useWatch('scheduleType', form) || 'weekly';

    const [selectedHostId, setSelectedHostId] = useState<string>('');
    const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
    const [meetingPointRows, setMeetingPointRows] = useState<MeetingPointRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Trips list is small enough for an admin catalog — fetch a wide page and
    // group by host client-side instead of relying on the (mismatched) host-id
    // filter used by the main trips table.
    const { data: tripsResponse, isLoading: tripsLoading } = useGetData({
        key: ['trips-for-bulk-batch'],
        url: api.getTrips,
        params: { limit: 500 },
        enabled: visible,
    });

    const trips: Trip[] = useMemo(
        () => ((tripsResponse as { data?: { data?: Trip[] } } | undefined)?.data?.data || []),
        [tripsResponse]
    );

    const hostGroups = useMemo(() => {
        const map = new Map<string, { label: string; trips: Trip[] }>();
        trips.forEach(t => {
            if (!t.host?._id) return;
            const key = t.host._id;
            const label = t.host.fullName || t.host.username || key;
            if (!map.has(key)) map.set(key, { label, trips: [] });
            map.get(key)!.trips.push(t);
        });
        return map;
    }, [trips]);

    const hostOptions = useMemo(
        () => Array.from(hostGroups.entries()).map(([value, g]) => ({
            value, label: `${g.label} (${g.trips.length} trips)`,
        })),
        [hostGroups]
    );

    const hostTrips = selectedHostId ? (hostGroups.get(selectedHostId)?.trips || []) : [];

    const { data: locationsResponse } = useGetData({
        key: ['host-batch-locations', selectedHostId],
        url: selectedHostId ? api.getHostBatchLocations(selectedHostId) : '',
        enabled: !!selectedHostId,
    });

    const locations: HostLocation[] =
        (locationsResponse as { data?: { locations?: HostLocation[] } } | undefined)?.data?.locations || [];
    const meetingPointOptions = locations.filter(l => l.category === 'meeting_point');
    const dropPointOptions = locations.filter(l => l.category === 'drop_point');

    const handleHostChange = (hostId: string) => {
        setSelectedHostId(hostId);
        setSelectedTripIds([]);
        setMeetingPointRows([]);
        form.setFieldsValue({ dropPoint: [] });
    };

    const handleMeetingPointChange = (ids: string[]) => {
        setMeetingPointRows(prev => ids.map(id => {
            const existing = prev.find(r => r.location === id);
            const loc = meetingPointOptions.find(l => l._id === id);
            return existing || { location: id, name: loc?.name || id, pickupPrice: 0 };
        }));
    };

    const handleReset = () => {
        form.resetFields();
        setSelectedHostId('');
        setSelectedTripIds([]);
        setMeetingPointRows([]);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();

        if (!selectedTripIds.length) {
            message.error('Select at least one trip');
            return;
        }
        if (!meetingPointRows.length) {
            message.error('Select at least one meeting point');
            return;
        }

        let schedule: Record<string, unknown>;
        if (values.scheduleType === 'weekly') {
            schedule = { daysOfWeek: values.daysOfWeek, months: expandMonths(values.monthRange) };
        } else if (values.scheduleType === 'monthly') {
            schedule = { dayOfMonth: values.dayOfMonth, months: expandMonths(values.monthRange) };
        } else {
            schedule = { startDates: (values.customDates as Dayjs[]).map(d => d.format('YYYY-MM-DD')) };
        }

        const payload = {
            tripIds: selectedTripIds,
            scheduleType: values.scheduleType,
            schedule,
            totalSeats: values.totalSeats,
            closeBookingDaysBefore: values.closeBookingDaysBefore,
            pointOfContact: { name: values.pocName, phone: values.pocPhone },
            meetingPoint: meetingPointRows.map(r => ({ location: r.location, pickupPrice: r.pickupPrice })),
            dropPoint: values.dropPoint || [],
        };

        setSubmitting(true);
        try {
            const { data } = await baseAPI.post(api.bulkCreateBatches, payload);
            message.success((data as { message?: string })?.message || 'Batches created');
            queryClient.invalidateQueries({ queryKey: ['trip-batches'] });
            handleClose();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message.error(axiosErr.response?.data?.message || 'Failed to create batches');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Bulk Create Batches"
            open={visible}
            onCancel={handleClose}
            width={720}
            footer={[
                <Button key="cancel" onClick={handleClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
                    Create Batches
                </Button>,
            ]}
        >
            <Text type="secondary">
                One shared schedule is applied to every selected trip. All selected trips must belong to the same host —
                pick a host first, then the trips whose batches you want to create.
            </Text>

            <Divider style={{ margin: '16px 0' }} />

            <Form form={form} layout="vertical" initialValues={{ scheduleType: 'weekly', closeBookingDaysBefore: 3 }}>
                <Form.Item label="Host" required>
                    <Select
                        showSearch
                        loading={tripsLoading}
                        placeholder="Select host"
                        value={selectedHostId || undefined}
                        onChange={handleHostChange}
                        options={hostOptions}
                        optionFilterProp="label"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {selectedHostId && (
                    <Form.Item label={`Trips (${selectedTripIds.length} selected)`} required>
                        {hostTrips.length === 0 ? (
                            <Empty description="No trips for this host" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <Checkbox.Group
                                value={selectedTripIds}
                                onChange={(vals) => setSelectedTripIds(vals as string[])}
                                style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}
                            >
                                {hostTrips.map(t => (
                                    <Checkbox key={t._id} value={t._id}>
                                        {t.title} <Tag style={{ marginLeft: 4 }}>{t.status}</Tag>
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        )}
                    </Form.Item>
                )}

                <Divider titlePlacement="left" plain>Schedule</Divider>

                <Form.Item name="scheduleType" label="Repeats">
                    <Radio.Group>
                        <Radio.Button value="weekly">Weekly (days of week)</Radio.Button>
                        <Radio.Button value="monthly">Monthly (fixed day)</Radio.Button>
                        <Radio.Button value="custom">Custom dates</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {scheduleType === 'weekly' && (
                    <>
                        <Form.Item name="daysOfWeek" label="Days of week" rules={[{ required: true, message: 'Pick at least one day' }]}>
                            <Checkbox.Group options={DAY_OPTIONS} />
                        </Form.Item>
                        <Form.Item name="monthRange" label="Across months" rules={[{ required: true, message: 'Pick a month range' }]}>
                            <RangePicker picker="month" style={{ width: '100%' }} />
                        </Form.Item>
                    </>
                )}

                {scheduleType === 'monthly' && (
                    <>
                        <Form.Item name="dayOfMonth" label="Day of month" rules={[{ required: true, message: 'Pick a day of month' }]}>
                            <InputNumber min={1} max={31} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="monthRange" label="Across months" rules={[{ required: true, message: 'Pick a month range' }]}>
                            <RangePicker picker="month" style={{ width: '100%' }} />
                        </Form.Item>
                    </>
                )}

                {scheduleType === 'custom' && (
                    <Form.Item name="customDates" label="Start dates" rules={[{ required: true, message: 'Pick at least one date' }]}>
                        <DatePicker multiple style={{ width: '100%' }} />
                    </Form.Item>
                )}

                <Divider titlePlacement="left" plain>Batch details</Divider>

                <Form.Item name="totalSeats" label="Total seats per batch" rules={[{ required: true, message: 'Required' }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="closeBookingDaysBefore"
                    label="Close booking (days before trip start)"
                    rules={[{ required: true, message: 'Required' }, { type: 'number', min: 3, message: 'Must be at least 3 days' }]}
                >
                    <InputNumber min={3} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Point of contact" required style={{ marginBottom: 8 }}>
                    <Input.Group compact style={{ display: 'flex', gap: 8 }}>
                        <Form.Item name="pocName" noStyle rules={[{ required: true, message: 'Name required' }]}>
                            <Input placeholder="Name" style={{ flex: 1 }} />
                        </Form.Item>
                        <Form.Item name="pocPhone" noStyle rules={[{ required: true, pattern: /^\d{10}$/, message: '10-digit phone required' }]}>
                            <Input placeholder="10-digit phone" style={{ flex: 1 }} />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>

                <Form.Item label="Meeting points" required>
                    <Select
                        mode="multiple"
                        placeholder={selectedHostId ? 'Select meeting points' : 'Select a host first'}
                        disabled={!selectedHostId}
                        value={meetingPointRows.map(r => r.location)}
                        onChange={handleMeetingPointChange}
                        options={meetingPointOptions.map(l => ({ value: l._id, label: l.name }))}
                        style={{ width: '100%' }}
                    />
                    {meetingPointRows.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {meetingPointRows.map((row, i) => (
                                <div key={row.location} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ flex: 1 }}>{row.name}</Text>
                                    <InputNumber
                                        min={0}
                                        value={row.pickupPrice}
                                        onChange={(v) => setMeetingPointRows(rows => rows.map((r, idx) => idx === i ? { ...r, pickupPrice: v || 0 } : r))}
                                        addonBefore="₹"
                                        style={{ width: 140 }}
                                    />
                                    <Button
                                        size="small"
                                        danger
                                        icon={<Trash2 size={12} />}
                                        onClick={() => setMeetingPointRows(rows => rows.filter((_, idx) => idx !== i))}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </Form.Item>

                <Form.Item name="dropPoint" label="Drop points (optional)">
                    <Select
                        mode="multiple"
                        placeholder={selectedHostId ? 'Select drop points' : 'Select a host first'}
                        disabled={!selectedHostId}
                        options={dropPointOptions.map(l => ({ value: l._id, label: l.name }))}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BulkBatchCreateModal;
