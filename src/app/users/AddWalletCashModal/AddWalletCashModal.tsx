'use client'
import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Select, message } from 'antd';
import dayjs from 'dayjs';
import { usePostData } from '@/services/usePostData';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';
import { User } from '../constant';

const CREDIT_REASON_OPTIONS = [
    { label: 'Admin Adjustment', value: 'admin_adjustment' },
    { label: 'Wallet Top-up', value: 'wallet_topup' },
    { label: 'Refund (Cancelled Booking)', value: 'refund' },
];

interface CancelledBooking {
    _id: string;
    tripTitle: string;
    grandTotal: number;
    cancelledAt: string;
}

interface AddWalletCashModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface AddWalletCashFormValues {
    amount: number;
    reason: string;
    bookingId?: string;
    expiryDays?: number;
}

export const AddWalletCashModal: React.FC<AddWalletCashModalProps> = ({
    open,
    user,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm<AddWalletCashFormValues>();
    const selectedReason = Form.useWatch('reason', form);

    const { data: cancelledBookingsData, isLoading: bookingsLoading } = useGetData({
        key: ['cancelled-bookings', user?._id ?? ''],
        url: user ? api.getUserCancelledBookings(user._id) : '',
        params: {},
    });

    const cancelledBookings: CancelledBooking[] = cancelledBookingsData?.data ?? [];

    const bookingOptions = cancelledBookings.map((b) => ({
        label: `${b.tripTitle} — ₹${b.grandTotal.toLocaleString('en-IN')}`,
        value: b._id,
    }));

    const url = user ? api.addWalletCash(user._id) : '';

    const { mutateAsync: addCash, isPending } = usePostData<unknown, AddWalletCashFormValues>(url, {
        onSuccess: () => {
            message.success(`Wallet cash added successfully for @${user?.username}`);
            form.resetFields();
            onSuccess();
            onClose();
        },
        onError: (err) => {
            const msg =
                (err as unknown as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || err.message;
            message.error(msg);
        },
    });

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleFinish = async (values: AddWalletCashFormValues) => {
        const { expiryDays, ...rest } = values;
        await addCash({
            ...rest,
            expiresAt: expiryDays ? dayjs().add(expiryDays, 'day').toISOString() : undefined,
        } as unknown as AddWalletCashFormValues);
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={`Add Wallet Cash — @${user?.username ?? ''}`}
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText="Add Cash"
            confirmLoading={isPending}
            okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
            styles={{
                mask: { backgroundColor: 'rgba(0,0,0,0.7)' },
                body: { backgroundColor: '#1f1f1f', paddingTop: 16 },
                header: { backgroundColor: '#1f1f1f' },
                footer: { backgroundColor: '#1f1f1f' },
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ reason: 'admin_adjustment', expiryDays: 90 }}
            >
                <Form.Item
                    label="Amount (₹)"
                    name="amount"
                    rules={[
                        { required: true, message: 'Please enter an amount' },
                        {
                            type: 'number',
                            min: 1,
                            max: 100000,
                            message: 'Amount must be between ₹1 and ₹1,00,000',
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        prefix="₹"
                        min={1}
                        max={100000}
                        precision={0}
                        placeholder="Enter amount"
                    />
                </Form.Item>

                <Form.Item
                    label="Reason"
                    name="reason"
                    rules={[{ required: true, message: 'Please select a reason' }]}
                >
                    <Select options={CREDIT_REASON_OPTIONS} />
                </Form.Item>

                <Form.Item
                    label="Expiry (Days)"
                    name="expiryDays"
                    rules={[
                        { required: true, message: 'Please enter expiry days' },
                        { type: 'number', min: 1, max: 365, message: 'Must be between 1 and 365 days' },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        max={365}
                        precision={0}
                        addonAfter="days"
                        placeholder="90"
                    />
                </Form.Item>

                {selectedReason === 'refund' && (
                    <Form.Item
                        label="Cancelled Booking"
                        name="bookingId"
                        rules={[{ required: true, message: 'Please select the cancelled booking to refund' }]}
                    >
                        <Select
                            options={bookingOptions}
                            loading={bookingsLoading}
                            placeholder={
                                bookingsLoading
                                    ? 'Loading bookings...'
                                    : cancelledBookings.length === 0
                                    ? 'No cancelled bookings found'
                                    : 'Select a cancelled booking'
                            }
                            disabled={bookingsLoading || cancelledBookings.length === 0}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};
