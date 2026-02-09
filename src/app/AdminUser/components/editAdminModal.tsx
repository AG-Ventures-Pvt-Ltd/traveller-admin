import React from 'react'
import {
    Input, Button, Modal, Form, Select, message
} from 'antd';
import { usePostData } from '../../../services/usePostData';
import { api } from '../../../common/constants/api.urls';
import { Admin } from '../constant';

interface EditAdminModalProps {
    editModal: { visible: boolean; user: Admin | null };
    setEditModal: React.Dispatch<React.SetStateAction<{ visible: boolean; user: Admin | null }>>;
    ALL_PERMISSIONS: string[];
}


export const EditAdminModal: React.FC<EditAdminModalProps> = ({ editModal, setEditModal, ALL_PERMISSIONS }) => {

    const [form] = Form.useForm();
    const { mutateAsync: editPermissions, isPending: isLoading } = usePostData<unknown, string[]>(api.addAdminUser, {
        onSuccess: () => {
            message.success('Permissions updated');
            setEditModal({ visible: false, user: null });
            form.resetFields();
        },
        onError: (error: Error) => {
            message.error('Failed to update permission' + error?.message);
        }
    });

    const handleSavePermissions = (perms: string[]) => {
        editPermissions(perms)
    };

    const triggerSubmit = () => {
        form.submit();
    }

    return (
        <Modal
            open={editModal.visible}
            title={`Edit Permissions: ${editModal.user?.username}`}
            onCancel={() => setEditModal({ visible: false, user: null })}
            onOk={() => {
                triggerSubmit();
            }}
            okText="Save"
        >
            <Form
                initialValues={{ permissions: editModal.user?.permissions || [] }}
                onFinish={vals => handleSavePermissions(vals.permissions)}
                layout="vertical"
                form={form}
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
