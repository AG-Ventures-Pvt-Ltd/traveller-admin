import React from 'react';
import { Tag, Space, Tooltip, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { Coupon } from '../constants';
import { formatDate } from '@/common/utils/date';

export const getCouponColumns = (
    onEdit: (coupon: Coupon) => void,
    onToggle: (coupon: Coupon) => void,
    onViewUsages: (coupon: Coupon) => void,
): ColumnsType<Coupon> => [
    {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
        render: (code: string, record: Coupon) => (
            <Space direction="vertical" size={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1890ff', fontSize: 14 }}>{code}</span>
                {record.visibility === 'secret' && <Tag color="purple" style={{ fontSize: 11 }}>Secret</Tag>}
            </Space>
        ),
        width: 150,
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
                <span>{formatDate(record.startDate)}</span>
                <span style={{ color: '#8c8c8c' }}>→ {formatDate(record.endDate)}</span>
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
        title: 'Created By',
        dataIndex: 'createdByType',
        key: 'createdByType',
        render: (t: string, record) => (
            <Tooltip title={t === 'admin' ? 'Admin Created' : `Host: ${record.hostName || 'Unknown'}`}>
                <Tag color={t === 'admin' ? 'blue' : 'orange'}>
                    {t === 'admin' ? 'Admin' : record.hostName?.slice(0, 15) || 'Host'}
                </Tag>
            </Tooltip>
        ),
        width: 140,
    },
    {
        title: 'Status',
        key: 'status',
        render: (_, record: Coupon) => (
            <Space direction="vertical" size={2}>
                <Tag color={record.isActive ? 'success' : 'error'}>{record.isActive ? 'Active' : 'Inactive'}</Tag>
                {record.incompatibleWith?.includes('wondrrCash') && (
                    <Tag color="orange" style={{ fontSize: 11 }}>No WondrrCash</Tag>
                )}
            </Space>
        ),
        width: 120,
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
