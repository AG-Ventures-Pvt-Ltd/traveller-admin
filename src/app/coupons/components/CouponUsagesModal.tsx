'use client'
import React from 'react';
import { Modal, Table, Avatar, Tag, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useGetData } from '../../../services/useGetData';
import { api } from '../../../common/constants/api.urls';
import { Coupon, CouponUsage } from '../constants';
import { formatDateTime } from '@/common/utils/date';

const { Text } = Typography;

interface CouponUsagesModalProps {
    open: boolean;
    onClose: () => void;
    coupon: Coupon | null;
}

const columns: ColumnsType<CouponUsage> = [
    {
        title: 'User',
        key: 'user',
        render: (_, record) => (
            <Space>
                <Avatar src={record.user?.avatar} size={32}>
                    {record.user?.fullName?.[0] || 'U'}
                </Avatar>
                <Space direction="vertical" size={0}>
                    <Text style={{ color: '#fff', fontSize: 13 }}>{record.user?.fullName || 'Unknown'}</Text>
                    <Text style={{ color: '#8c8c8c', fontSize: 11 }}>{record.user?.email}</Text>
                </Space>
            </Space>
        ),
        width: 220,
    },
    {
        title: 'Order Amount',
        dataIndex: 'orderAmount',
        key: 'orderAmount',
        render: (v: number) => `₹${v.toLocaleString('en-IN')}`,
        width: 130,
    },
    {
        title: 'Discount Applied',
        dataIndex: 'discountApplied',
        key: 'discountApplied',
        render: (v: number) => <Tag color="green">-₹{v.toLocaleString('en-IN')}</Tag>,
        width: 140,
    },
    {
        title: 'Used At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (v: string) => formatDateTime(v),
        width: 180,
    },
];

export const CouponUsagesModal: React.FC<CouponUsagesModalProps> = ({ open, onClose, coupon }) => {
    const { data, isLoading } = useGetData({
        key: ['coupon-usages', coupon?._id || ''],
        url: coupon ? api.getCouponUsages(coupon._id) : '',
        params: { page: 1, limit: 50 },
    });

    const usages: CouponUsage[] = data?.data?.usages || [];
    const total = data?.data?.total || 0;

    return (
        <Modal
            open={open}
            title={`Usages: ${coupon?.code}`}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Space direction="vertical" size={4} style={{ marginBottom: 12 }}>
                <Text style={{ color: '#8c8c8c' }}>{coupon?.description}</Text>
                <Text style={{ color: '#fff' }}>
                    Total usages: <strong>{coupon?.currentUsageCount ?? 0}</strong> / {coupon?.maxUsageCount ?? '∞'}
                </Text>
            </Space>
            <Table
                columns={columns}
                dataSource={usages}
                rowKey="_id"
                loading={isLoading}
                size="small"
                scroll={{ x: 600 }}
                pagination={{ pageSize: 20, total, showTotal: (t) => `${t} usages` }}
                style={{ marginTop: 8 }}
            />
        </Modal>
    );
};
