import { Tag } from 'antd';
import type { TableProps } from 'antd';
import { PAYMENT_STATUS, PAYMENT_METHODS, Payment } from '../constants';
import { formatDateTime } from '@/common/utils/date';

const STATUS_COLOR: Record<string, string> = {
    pending: 'orange',
    completed: 'green',
    failed: 'red',
    refunded: 'blue',
};

export const paymentColumns: TableProps<Payment>['columns'] = [
    {
        title: 'Payment ID',
        dataIndex: '_id',
        key: '_id',
        ellipsis: true,
        width: 200,
    },
    {
        title: 'User',
        key: 'user',
        render: (_: unknown, record: Payment) =>
            record.user ? (
                <span>
                    <div style={{ fontWeight: 500 }}>{record.user.username}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.user.email}</div>
                </span>
            ) : '—',
    },
    {
        title: 'Trip',
        dataIndex: 'tripTitle',
        key: 'tripTitle',
        ellipsis: true,
        render: (v: string) => v || '—',
    },
    {
        title: 'Amount',
        key: 'amount',
        render: (_: unknown, record: Payment) => `₹${record.amount.toLocaleString('en-IN')} ${record.currency || 'INR'}`,
        align: 'right',
    },
    {
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        render: (v: string) => PAYMENT_METHODS.find(m => m.value === v)?.label || v,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (v: string) => (
            <Tag color={STATUS_COLOR[v] || 'default'}>
                {PAYMENT_STATUS.find(s => s.value === v)?.label || v}
            </Tag>
        ),
    },
    {
        title: 'Gateway Txn ID',
        dataIndex: 'gatewayTransactionId',
        key: 'gatewayTransactionId',
        ellipsis: true,
        render: (v: string) => v || '—',
    },
    {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (v: string) => formatDateTime(v),
        sorter: true,
    },
];

