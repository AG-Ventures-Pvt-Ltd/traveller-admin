'use client'
import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Space } from 'antd';
import { Payment } from '../constants';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';

interface RefundModalProps {
    open: boolean;
    onClose: () => void;
    payment: Payment | null;
    onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ open, onClose, payment, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleRefund = async (values: { refundAmount: number; refundReason?: string }) => {
        if (!payment) return;

        Modal.confirm({
            title: 'Confirm Refund',
            content: (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p><strong>Payment ID:</strong> {payment._id}</p>
                    <p><strong>Original Amount:</strong> ₹{payment.amount.toLocaleString('en-IN')}</p>
                    <p><strong>Refund Amount:</strong> ₹{values.refundAmount.toLocaleString('en-IN')}</p>
                    {values.refundReason && (
                        <p><strong>Reason:</strong> {values.refundReason}</p>
                    )}
                    <p style={{ color: '#ff4d4f' }}>This action cannot be undone. Are you sure?</p>
                </Space>
            ),
            okText: 'Proceed Refund',
            okType: 'danger',
            onOk: async () => {
                setLoading(true);
                try {
                    await baseAPI.post(api.markPaymentRefund(payment._id), {
                        refundAmount: values.refundAmount,
                        refundReason: values.refundReason,
                    });
                    message.success('Payment refunded successfully');
                    form.resetFields();
                    onSuccess();
                    onClose();
                } catch (err) {
                    const errMsg = (err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to process refund';
                    message.error(errMsg);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    if (!payment) return null;

    return (
        <Modal
            open={open}
            title="Process Refund"
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Continue"
            okButtonProps={{ loading }}
            width={480}
            destroyOnHidden
            styles={{
                mask: { backgroundColor: 'rgba(0,0,0,0.7)' },
                body: { backgroundColor: '#1f1f1f', color: '#fff' },
            }}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
                onFinish={handleRefund}
            >
                <Form.Item label="Payment Details" required={false}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <span style={{ color: '#fff' }}><strong>User:</strong> {payment.user?.username}</span>
                        <span style={{ color: '#fff' }}><strong>Amount:</strong> ₹{payment.amount.toLocaleString('en-IN')}</span>
                    </Space>
                </Form.Item>

                <Form.Item
                    name="refundAmount"
                    label="Refund Amount (₹)"
                    rules={[
                        { required: true, message: 'Refund amount is required' },
                        {
                            type: 'number',
                            min: 1,
                            message: 'Refund amount must be at least ₹1',
                        },
                        {
                            validator: (_, value) => {
                                if (value > payment.amount) {
                                    return Promise.reject(new Error(`Cannot exceed ₹${payment.amount}`));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        max={payment.amount}
                        precision={2}
                        formatter={(value) => `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => {
                            const num = parseFloat(value?.replace(/₹\s?|(,*)/g, '') || '0');
                            return isNaN(num) ? 0 : num;
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="refundReason"
                    label="Refund Reason (Optional)"
                    rules={[{ max: 500, message: 'Max 500 characters' }]}
                >
                    <Input.TextArea rows={3} placeholder="e.g., Customer request, duplicate charge..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};
