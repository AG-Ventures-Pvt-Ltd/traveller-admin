import React from 'react';
import { Tag, Space, Tooltip, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { Coupon } from '../constants';
import dayjs from 'dayjs';

export const getCouponColumns = (
    onEdit: (coupon: Coupon) => void,
    onToggle: (coupon: Coupon) => void,
    onViewUsages: (coupon: Coupon) => void,
): ColumnsType<Coupon> => [
    {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => (
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1890ff', fontSize: 14 }}>{code}</span>
        ),
        width: 140,
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        width: 200,
    },
    {
        title: 'Discount',
        key: 'discount',
        render: (_, record) => {
            const label =
                record.discountType === 'percentage'
                    ? `${record.discountValue}%`
                    : record.discountType === 'people_count'
                    ? `₹${record.discountValue}/person`
                    : `₹${record.discountValue}`;
            return <Tag color="geekblue">{label}</Tag>;
        },
        width: 130,
    },
    {
        title: 'Type',
        dataIndex: 'discountType',
        key: 'discountType',
        render: (t: string) => (
            <Tag>{t === 'people_count' ? 'Per Person' : t === 'percentage' ? 'Percentage' : 'Fixed'}</Tag>
        ),
        width: 120,
    },
    {
        title: 'Usage',
        key: 'usage',
        render: (_, record) => (
            <span>
                {record.currentUsageCount} / {record.maxUsageCount ?? '∞'}
            </span>
        ),
        width: 100,
    },
    {
        title: 'Validity',
        key: 'validity',
        render: (_, record) => (
            <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
                <span>{dayjs(record.startDate).format('DD MMM YYYY')}</span>
                <span style={{ color: '#8c8c8c' }}>→ {dayjs(record.endDate).format('DD MMM YYYY')}</span>
            </Space>
        ),
        width: 150,
    },
    {
        title: 'Trip',
        key: 'trip',
        render: (_, record) =>
            record.trip?.title ? (
                <Tooltip title={record.trip.title}>
                    <Tag color="purple">{record.trip.title.slice(0, 20)}{record.trip.title.length > 20 ? '…' : ''}</Tag>
                </Tooltip>
            ) : (
                <Tag color="default">All Trips</Tag>
            ),
        width: 140,
    },
    {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
            <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Active' : 'Inactive'}</Tag>
        ),
        width: 90,
    },
    {
        title: 'Created By',
        dataIndex: 'createdByType',
        key: 'createdByType',
        render: (t: string) => <Tag color={t === 'admin' ? 'blue' : 'orange'}>{t}</Tag>,
        width: 100,
    },
    {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 130,
        render: (_, record) => (
            <Space>
                <Tooltip title="Edit">
                    <Button
                        type="text"
                        size="small"
                        icon={<Edit2 size={14} />}
                        onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                    />
                </Tooltip>
                <Tooltip title={record.isActive ? 'Disable' : 'Enable'}>
                    <Button
                        type="text"
                        size="small"
                        icon={record.isActive ? <ToggleLeft size={14} color="#ff4d4f" /> : <ToggleRight size={14} color="#52c41a" />}
                        onClick={(e) => { e.stopPropagation(); onToggle(record); }}
                    />
                </Tooltip>
                <Tooltip title="View Usages">
                    <Button
                        type="text"
                        size="small"
                        icon={<Eye size={14} />}
                        onClick={(e) => { e.stopPropagation(); onViewUsages(record); }}
                    />
                </Tooltip>
            </Space>
        ),
    },
];
