import React, { useEffect } from 'react'
import {
    Input, Button, Modal, Form, Select, message
} from 'antd';
import { usePutData } from '../../../services/usePutData';
import { api } from '../../../common/constants/api.urls';
import { Admin } from '../constant';

interface EditAdminModalProps {
    editModal: { visible: boolean; user: Admin | null };
    setEditModal: React.Dispatch<React.SetStateAction<{ visible: boolean; user: Admin | null }>>;
    ALL_PERMISSIONS: string[];
    onSuccess: () => void;
}


export const EditAdminModal: React.FC<EditAdminModalProps> = ({ editModal, setEditModal, ALL_PERMISSIONS, onSuccess }) => {

    const [form] = Form.useForm();

    const { mutateAsync: updatePermissions, isPending: isLoading } = usePutData<unknown, { permissions: string[] }>(
        editModal.user ? api.updateAdminUserPermissions(editModal.user._id) : '',
        {
            onSuccess: () => {
                message.success('Permissions updated');
                setEditModal({ visible: false, user: null });
                form.resetFields();
                onSuccess();
            },
            onError: (error) => {
                message.error('Failed to update permissions: ' + ((error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || error?.message));
            }
        }
    );

    useEffect(() => {
        if (editModal.visible && editModal.user) {
            form.setFieldsValue({ permissions: editModal.user.permissions || [] });
        }
    }, [editModal.visible, editModal.user, form]);

    const handleSavePermissions = async (values: { permissions: string[] }) => {
        await updatePermissions({ permissions: values.permissions });
    };

    return (
        <Modal
            open={editModal.visible}
            title={`Edit Permissions: ${editModal.user?.username}`}
            onCancel={() => setEditModal({ visible: false, user: null })}
            onOk={() => form.submit()}
            okText="Save"
            confirmLoading={isLoading}
        >
            <Form
                form={form}
                onFinish={handleSavePermissions}
                layout="vertical"
            >
                <Form.Item name="permissions" label="Permissions">
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select permissions"
                        options={ALL_PERMISSIONS.map(p => ({ label: p, value: p }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}
