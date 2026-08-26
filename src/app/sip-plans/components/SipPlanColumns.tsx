import React from 'react';
import { Tag, Space, Tooltip, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { SipPlan } from '../constants';

export const getSipPlanColumns = (
    onEdit: (plan: SipPlan) => void,
    onToggle: (plan: SipPlan) => void,
    onViewSubscribers: (plan: SipPlan) => void,
): ColumnsType<SipPlan> => [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
        width: 180,
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        width: 220,
    },
    {
        title: 'Target',
        dataIndex: 'targetAmount',
        key: 'targetAmount',
        render: (v: number) => `₹${v.toLocaleString('en-IN')}`,
        width: 110,
    },
    {
        title: 'Payout',
        dataIndex: 'totalPayout',
        key: 'totalPayout',
        render: (v: number) => `₹${v.toLocaleString('en-IN')}`,
        width: 110,
    },
    {
        title: 'Bonus',
        key: 'bonus',
        render: (_, record) => <Tag color="green">+₹{(record.totalPayout - record.targetAmount).toLocaleString('en-IN')}</Tag>,
        width: 110,
    },
    {
        title: 'Installment / Cadence',
        key: 'cadenceAmounts',
        render: (_, record) => {
            const amounts = record.cadenceAmounts;
            // Plans created before the per-cadence-amount migration have no
            // cadenceAmounts at all — edit and resave to backfill.
            if (!amounts) return <Tag color="warning">Needs update</Tag>;
            return (
                <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
                    <span>Daily: ₹{amounts.daily.toLocaleString('en-IN')}</span>
                    <span>Weekly: ₹{amounts.weekly.toLocaleString('en-IN')}</span>
                    <span>Monthly: ₹{amounts.monthly.toLocaleString('en-IN')}</span>
                </Space>
            );
        },
        width: 150,
    },
    {
        title: 'Status',
        key: 'status',
        render: (_, record: SipPlan) => (
            <Tag color={record.isActive ? 'success' : 'error'}>{record.isActive ? 'Active' : 'Inactive'}</Tag>
        ),
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
                <Tooltip title="View Subscribers">
                    <Button
                        type="text"
                        size="small"
                        icon={<Users size={14} />}
                        onClick={(e) => { e.stopPropagation(); onViewSubscribers(record); }}
                    />
                </Tooltip>
            </Space>
        ),
    },
];
