'use client'
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { usePostData } from '../../../services/usePostData';
import { usePutData } from '../../../services/usePutData';
import { api } from '../../../common/constants/api.urls';
import { SipPlan, SipCadenceAmounts } from '../constants';

interface SipPlanFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plan?: SipPlan | null;
}

interface SipPlanFormValues {
    name: string;
    description?: string;
    targetAmount: number;
    totalPayout: number;
    cadenceAmounts: SipCadenceAmounts;
}

export const SipPlanFormModal: React.FC<SipPlanFormModalProps> = ({ open, onClose, onSuccess, plan }) => {
    const [form] = Form.useForm<SipPlanFormValues>();
    const isEdit = !!plan;

    const { mutateAsync: createPlan, isPending: isCreating } = usePostData<unknown, Record<string, unknown>>(
        api.createSipPlan,
        {
            onSuccess: () => {
                message.success('SIP plan created successfully');
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

    const updateUrl = plan ? api.updateSipPlan(plan._id) : '';
    const { mutateAsync: updatePlan, isPending: isUpdating } = usePutData<unknown, Record<string, unknown>>(
        updateUrl,
        {
            onSuccess: () => {
                message.success('SIP plan updated successfully');
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
        if (open && plan) {
            form.setFieldsValue({
                name: plan.name,
                description: plan.description,
                targetAmount: plan.targetAmount,
                totalPayout: plan.totalPayout,
                cadenceAmounts: plan.cadenceAmounts,
            });
        } else if (open && !plan) {
            form.resetFields();
        }
    }, [open, plan, form]);

    const handleFinish = async (values: SipPlanFormValues) => {
        if (isEdit) {
            await updatePlan(values as unknown as Record<string, unknown>);
        } else {
            await createPlan(values as unknown as Record<string, unknown>);
        }
    };

    return (
        <Modal
            open={open}
            title={isEdit ? `Edit SIP Plan: ${plan?.name}` : 'Create New SIP Plan'}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={() => form.submit()}
            okText={isEdit ? 'Update' : 'Create'}
            confirmLoading={isCreating || isUpdating}
            width={520}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }} onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Plan Name"
                    rules={[{ required: true, message: 'Name is required' }]}
                >
                    <Input placeholder="e.g. Goa Trip SIP" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <Input.TextArea placeholder="Brief description of the plan" rows={2} maxLength={200} showCount />
                </Form.Item>

                <Form.Item
                    name="targetAmount"
                    label="Target Amount (₹)"
                    rules={[{ required: true, message: 'Target amount is required' }, { type: 'number', min: 1 }]}
                    tooltip="Total amount the user commits to saving via installments"
                >
                    <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 4500" />
                </Form.Item>

                <Form.Item
                    name="totalPayout"
                    label="Total Payout (₹)"
                    dependencies={['targetAmount']}
                    tooltip="Amount credited once the target is fully paid in — must be ≥ target amount"
                    rules={[
                        { required: true, message: 'Total payout is required' },
                        { type: 'number', min: 1 },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const target = getFieldValue('targetAmount');
                                if (value === undefined || target === undefined || value >= target) return Promise.resolve();
                                return Promise.reject(new Error('Total payout must be ≥ target amount'));
                            },
                        }),
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 5000" />
                </Form.Item>

                <Form.Item label="Installment amount per cadence (₹)" tooltip="The user only picks a cadence — this amount is fixed by you, not editable by them" required>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <Form.Item
                            name={['cadenceAmounts', 'daily']}
                            label="Daily"
                            dependencies={['targetAmount']}
                            rules={[
                                { required: true, message: 'Required' },
                                { type: 'number', min: 1 },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const target = getFieldValue('targetAmount');
                                        if (value === undefined || target === undefined || value <= target) return Promise.resolve();
                                        return Promise.reject(new Error('Must be ≤ target'));
                                    },
                                }),
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 50" />
                        </Form.Item>
                        <Form.Item
                            name={['cadenceAmounts', 'weekly']}
                            label="Weekly"
                            dependencies={['targetAmount']}
                            rules={[
                                { required: true, message: 'Required' },
                                { type: 'number', min: 1 },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const target = getFieldValue('targetAmount');
                                        if (value === undefined || target === undefined || value <= target) return Promise.resolve();
                                        return Promise.reject(new Error('Must be ≤ target'));
                                    },
                                }),
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 350" />
                        </Form.Item>
                        <Form.Item
                            name={['cadenceAmounts', 'monthly']}
                            label="Monthly"
                            dependencies={['targetAmount']}
                            rules={[
                                { required: true, message: 'Required' },
                                { type: 'number', min: 1 },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const target = getFieldValue('targetAmount');
                                        if (value === undefined || target === undefined || value <= target) return Promise.resolve();
                                        return Promise.reject(new Error('Must be ≤ target'));
                                    },
                                }),
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 1500" />
                        </Form.Item>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};
