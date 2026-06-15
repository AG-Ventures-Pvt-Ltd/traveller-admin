'use client'
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Switch, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { usePostData } from '../../../services/usePostData';
import { usePutData } from '../../../services/usePutData';
import { api } from '../../../common/constants/api.urls';
import { Coupon, DISCOUNT_TYPES, VISIBILITY_OPTIONS, INCOMPATIBLE_WITH_OPTIONS } from '../constants';

interface CouponFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    coupon?: Coupon | null;
}

interface CouponFormValues {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    numberOfPeople?: number;
    maxUsageCount?: number;
    maxUsagePerUser: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate?: Dayjs;
    endDate: Dayjs;
    visibility: 'public' | 'secret';
    incompatibleWith: string[];
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({ open, onClose, onSuccess, coupon }) => {
    const [form] = Form.useForm<CouponFormValues>();
    const isEdit = !!coupon;

    const { mutateAsync: createCoupon, isPending: isCreating } = usePostData<unknown, Record<string, unknown>>(
        api.createCoupon,
        {
            onSuccess: () => {
                message.success('Coupon created successfully');
                form.resetFields();
                onSuccess();
                onClose();
            },
            onError: (err) => {
                const msg = (err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || err.message;
                message.error(msg);
            }
        }
    );

    const updateUrl = coupon ? api.updateCoupon(coupon._id) : '';
    const { mutateAsync: updateCoupon, isPending: isUpdating } = usePutData<unknown, Record<string, unknown>>(
        updateUrl,
        {
            onSuccess: () => {
                message.success('Coupon updated successfully');
                onSuccess();
                onClose();
            },
            onError: (err) => {
                const msg = (err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || err.message;
                message.error(msg);
            }
        }
    );

    useEffect(() => {
        if (open && coupon) {
            form.setFieldsValue({
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                numberOfPeople: coupon.numberOfPeople,
                maxUsageCount: coupon.maxUsageCount ?? undefined,
                maxUsagePerUser: coupon.maxUsagePerUser,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscountAmount: coupon.maxDiscountAmount ?? undefined,
                startDate: dayjs(coupon.startDate),
                endDate: dayjs(coupon.endDate),
                visibility: coupon.visibility ?? 'public',
                incompatibleWith: coupon.incompatibleWith ?? [],
            });
        } else if (open && !coupon) {
            form.resetFields();
        }
    }, [open, coupon, form]);

    const handleFinish = async (values: CouponFormValues) => {
        const payload: Record<string, unknown> = {
            ...values,
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
        };

        if (isEdit) {
            await updateCoupon(payload);
        } else {
            await createCoupon(payload);
        }
    };

    const discountType = Form.useWatch('discountType', form);

    return (
        <Modal
            open={open}
            title={isEdit ? `Edit Coupon: ${coupon?.code}` : 'Create New Coupon'}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={() => form.submit()}
            okText={isEdit ? 'Update' : 'Create'}
            confirmLoading={isCreating || isUpdating}
            width={600}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }} onFinish={handleFinish}>
                {!isEdit && (
                    <Form.Item
                        name="code"
                        label="Coupon Code"
                        rules={[
                            { required: true, message: 'Code is required' },
                            { min: 5, max: 20, message: 'Code must be 5-20 characters' },
                        ]}
                    >
                        <Input placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                )}

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Description is required' }]}
                >
                    <Input.TextArea placeholder="Brief description of the coupon" rows={2} maxLength={100} showCount />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        name="discountType"
                        label="Discount Type"
                        rules={[{ required: true }]}
                    >
                        <Select options={DISCOUNT_TYPES} placeholder="Select type" />
                    </Form.Item>

                    <Form.Item
                        name="discountValue"
                        label={discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (₹)'}
                        rules={[{ required: true, message: 'Value is required' }, { type: 'number', min: 0.01 }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0.01} max={discountType === 'percentage' ? 100 : undefined} />
                    </Form.Item>
                </div>

                {discountType === 'people_count' && (
                    <Form.Item name="numberOfPeople" label="Minimum People Count">
                        <InputNumber style={{ width: '100%' }} min={2} />
                    </Form.Item>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item name="startDate" label="Start Date">
                        <DatePicker style={{ width: '100%' }} showTime={false} />
                    </Form.Item>
                    <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'End date required' }]}>
                        <DatePicker style={{ width: '100%' }} showTime={false} />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item name="maxUsageCount" label="Max Total Uses (blank = unlimited)">
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item name="maxUsagePerUser" label="Max Uses Per User" initialValue={1}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item name="minOrderAmount" label="Min Order Amount (₹)" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    {discountType === 'percentage' && (
                        <Form.Item name="maxDiscountAmount" label="Max Discount Cap (₹)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    )}
                </div>

                <Form.Item name="visibility" label="Visibility" initialValue="public">
                    <Select options={VISIBILITY_OPTIONS} />
                </Form.Item>

                <Form.Item name="incompatibleWith" label="Cannot be used with">
                    <Select
                        mode="multiple"
                        options={INCOMPATIBLE_WITH_OPTIONS}
                        placeholder="Select incompatible discount types"
                        allowClear
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
