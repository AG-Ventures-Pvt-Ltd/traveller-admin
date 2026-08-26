'use client'
import React from 'react';
import { Modal, Table, Tag, Space, Typography, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useGetData } from '../../../services/useGetData';
import { api } from '../../../common/constants/api.urls';
import { SipPlan, SipSubscriber, SIP_SUBSCRIPTION_STATUS_COLORS, SIP_GATEWAY_COLORS } from '../constants';
import { formatDate } from '@/common/utils/date';

const { Text } = Typography;

interface SipSubscribersModalProps {
    open: boolean;
    onClose: () => void;
    plan: SipPlan | null;
}

const columns: ColumnsType<SipSubscriber> = [
    {
        title: 'User',
        key: 'user',
        render: (_, record) => (
            <Space direction="vertical" size={0}>
                <Text style={{ color: '#fff', fontSize: 13 }}>{record.user?.fullName || 'Unknown'}</Text>
                <Text style={{ color: '#8c8c8c', fontSize: 11 }}>{record.user?.email}</Text>
            </Space>
        ),
        width: 200,
    },
    {
        title: 'Gateway',
        dataIndex: 'gateway',
        key: 'gateway',
        render: (g: SipSubscriber['gateway']) => <Tag color={SIP_GATEWAY_COLORS[g]}>{g === 'razorpay' ? 'Razorpay' : 'Cashfree'}</Tag>,
        width: 110,
    },
    {
        title: 'Installment',
        key: 'installment',
        render: (_, record) => `₹${record.installmentAmount.toLocaleString('en-IN')} / ${record.cadence}`,
        width: 140,
    },
    {
        title: 'Progress',
        key: 'progress',
        render: (_, record) => (
            <Space direction="vertical" size={0} style={{ minWidth: 140 }}>
                <Progress
                    percent={Math.min(100, Math.round((record.cumulativePaidAmount / record.targetAmount) * 100))}
                    size="small"
                    showInfo={false}
                />
                <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                    ₹{record.cumulativePaidAmount.toLocaleString('en-IN')} / ₹{record.targetAmount.toLocaleString('en-IN')}
                </Text>
            </Space>
        ),
        width: 160,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: SipSubscriber['status']) => <Tag color={SIP_SUBSCRIPTION_STATUS_COLORS[s]}>{s.replace('_', ' ')}</Tag>,
        width: 120,
    },
    {
        title: 'Started',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (v?: string) => (v ? formatDate(v) : '—'),
        width: 120,
    },
    {
        title: 'Missed',
        dataIndex: 'consecutiveMissedInstallments',
        key: 'consecutiveMissedInstallments',
        render: (v: number) => (v > 0 ? <Tag color="warning">{v} missed</Tag> : <Text style={{ color: '#8c8c8c' }}>—</Text>),
        width: 110,
    },
];

export const SipSubscribersModal: React.FC<SipSubscribersModalProps> = ({ open, onClose, plan }) => {
    const { data, isLoading } = useGetData({
        key: ['sip-plan-subscribers', plan?._id || ''],
        url: plan ? api.getSipPlanSubscribers(plan._id) : '',
        params: { page: 1, limit: 50 },
    });

    const subscribers: SipSubscriber[] = data?.data?.subscribers || [];
    const total = data?.data?.total || 0;

    return (
        <Modal
            open={open}
            title={`Subscribers: ${plan?.name}`}
            onCancel={onClose}
            footer={null}
            width={900}
        >
            <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: 12 }}>{plan?.description}</Text>
            <Table
                columns={columns}
                dataSource={subscribers}
                rowKey="_id"
                loading={isLoading}
                size="small"
                scroll={{ x: 900 }}
                pagination={{ pageSize: 20, total, showTotal: (t) => `${t} subscribers` }}
            />
        </Modal>
    );
};
