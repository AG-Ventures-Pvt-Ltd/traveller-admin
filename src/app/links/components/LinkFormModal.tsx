'use client'
import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { usePostData } from '@/services/usePostData';
import { usePatchData } from '@/services/usePutData';
import { api } from '@/common/constants/api.urls';
import { Link } from '../constants';

interface LinkFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    link?: Link | null;
}

interface LinkFormValues {
    destinationUrl: string;
    label?: string;
}

export const LinkFormModal: React.FC<LinkFormModalProps> = ({ open, onClose, onSuccess, link }) => {
    const [form] = Form.useForm<LinkFormValues>();
    const isEdit = !!link;

    const { mutateAsync: createLink, isPending: isCreating } = usePostData<unknown, LinkFormValues>(
        api.createLink,
        {
            onSuccess: () => {
                message.success('Link created successfully');
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

    const updateUrl = link ? api.updateLink(link.shortCode) : '';
    const { mutateAsync: updateLink, isPending: isUpdating } = usePatchData<unknown, Partial<LinkFormValues>>(
        updateUrl,
        {
            onSuccess: () => {
                message.success('Link updated successfully');
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
        if (open && link) {
            form.setFieldsValue({
                destinationUrl: link.destinationUrl,
                label: link.label,
            });
        } else if (open && !link) {
            form.resetFields();
        }
    }, [open, link, form]);

    const handleFinish = async (values: LinkFormValues) => {
        if (isEdit) {
            await updateLink(values);
        } else {
            await createLink(values);
        }
    };

    return (
        <Modal
            open={open}
            title={isEdit ? `Edit Link: ${link?.shortCode}` : 'Create New Link'}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={() => form.submit()}
            okText={isEdit ? 'Update' : 'Create'}
            confirmLoading={isCreating || isUpdating}
            width={520}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }} onFinish={handleFinish}>
                {isEdit && (
                    <Form.Item label="Short Code">
                        <Input value={link?.shortCode} disabled />
                    </Form.Item>
                )}

                <Form.Item
                    name="destinationUrl"
                    label="Destination URL"
                    rules={[{ required: true, message: 'Destination URL is required' }, { type: 'url', message: 'Must be a valid URL' }]}
                >
                    <Input placeholder="https://wondrr.in/trip/..." />
                </Form.Item>

                <Form.Item name="label" label="Label (internal notes)">
                    <Input placeholder="e.g. IG bio link" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
