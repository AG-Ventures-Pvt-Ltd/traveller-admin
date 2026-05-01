import React from 'react';
import { Modal, Descriptions, Tag, Avatar, Typography, Space, Divider, Button } from 'antd';
import { Payment, PAYMENT_STATUS, PAYMENT_METHODS } from '../constants';
import { formatDateTime } from '@/common/utils/date';

const { Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
    pending: 'orange',
    completed: 'green',
    failed: 'red',
    refunded: 'blue',
};

interface PaymentDetailModalProps {
    open: boolean;
    onClose: () => void;
    payment: Payment | null;
    onRefund?: (payment: Payment) => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ open, onClose, payment, onRefund }) => {
    if (!payment) return null;

    const statusLabel = PAYMENT_STATUS.find(s => s.value === payment.status)?.label || payment.status;
    const methodLabel = PAYMENT_METHODS.find(m => m.value === payment.method)?.label || (payment.method || 'N/A');
    const canRefund = payment.status === 'completed';

    return (
        <Modal
            title="Payment Details"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                canRefund && onRefund ? (
                    <Button key="refund" type="primary" danger onClick={() => onRefund(payment)}>
                        Process Refund
                    </Button>
                ) : null,
            ]}
            width={680}
            destroyOnHidden
            styles={{
                mask: { backgroundColor: 'rgba(0,0,0,0.7)' },
                body: { backgroundColor: '#1f1f1f', paddingTop: 16 },
            }}
        >
            {/* User Section */}
            {payment.user && (
                <>
                    <Space align="center" style={{ marginBottom: 16 }}>
                        <Avatar
                            src={payment.user.avatar || undefined}
                            size={48}
                            style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                        >
                            {payment.user.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong style={{ color: '#fff', display: 'block', fontSize: 16 }}>
                                {payment.user.username}
                            </Text>
                            <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{payment.user.email}</Text>
                        </div>
                    </Space>
                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
                </>
            )}

            <Descriptions
                column={2}
                size="small"
                labelStyle={{ color: '#8c8c8c', fontWeight: 500 }}
                contentStyle={{ color: '#fff' }}
                styles={{ label: { background: 'transparent' }, content: { background: 'transparent' } }}
            >
                <Descriptions.Item label="Payment ID" span={2}>
                    <Text copyable style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
                        {payment._id}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Amount">
                    <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                        ₹{payment.amount.toLocaleString('en-IN')}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Currency">
                    {payment.currency || 'INR'}
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                    <Tag color={STATUS_COLOR[payment.status] || 'default'}>{statusLabel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Method">
                    <Tag color="cyan">{methodLabel}</Tag>
                </Descriptions.Item>

                {payment.tripTitle && (
                    <Descriptions.Item label="Trip" span={2}>
                        {payment.tripTitle}
                    </Descriptions.Item>
                )}

                {payment.batchStartDate && (
                    <Descriptions.Item label="Batch Date" span={2}>
                        {formatDateTime(payment.batchStartDate)}
                    </Descriptions.Item>
                )}

                <Descriptions.Item label="Booking ID" span={2}>
                    <Text copyable={{ text: payment.bookingId }} style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
                        {payment.bookingId}
                    </Text>
                </Descriptions.Item>

                {payment.gatewayOrderId && (
                    <Descriptions.Item label="Gateway Order ID" span={2}>
                        <Text copyable style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
                            {payment.gatewayOrderId}
                        </Text>
                    </Descriptions.Item>
                )}

                {payment.gatewayTransactionId && (
                    <Descriptions.Item label="Gateway Txn ID" span={2}>
                        <Text copyable style={{ color: '#fff', fontFamily: 'monospace', fontSize: 12 }}>
                            {payment.gatewayTransactionId}
                        </Text>
                    </Descriptions.Item>
                )}

                <Descriptions.Item label="Created At">
                    {formatDateTime(payment.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                    {formatDateTime(payment.updatedAt)}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default PaymentDetailModal;
