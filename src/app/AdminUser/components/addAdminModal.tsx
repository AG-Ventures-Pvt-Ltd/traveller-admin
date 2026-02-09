import {
    Input, Button, Modal, Form, Select, message
} from 'antd';
import { usePostData } from '../../../services/usePostData';
import { api } from '../../../common/constants/api.urls';
import React from 'react';

interface AddAdminModalProps {
    addModal: boolean
    setAddModal: React.Dispatch<React.SetStateAction<boolean>>
    ALL_PERMISSIONS: string[]
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ addModal, setAddModal, ALL_PERMISSIONS }) => {

    const [form] = Form.useForm();
    const { mutateAsync: addUser, isPending: isLoading, data, reset, error } = usePostData<{ data: { username: string, password: string } }, { username: string, permissions: string[] }>(api.addAdminUser, {
        onSuccess: () => {
            message.success('Admin added');
            form.resetFields();
        },
        onError: (error: Error) => {
            message.error('Failed to add admin: ' + error?.message);
        }
    });

    const handleAddUser = async (values: { username: string, permissions: string[] }) => {
        await addUser(values)
    };

    const handleCopyUsername = () => {
        if (data && data.data) {
            navigator.clipboard.writeText(data.data.username);
            message.success('Username copied!');
        }
    };

    const handleCopyPassword = () => {
        if (data && data.data) {
            navigator.clipboard.writeText(data.data.password);
            message.success('Password copied!');
        }
    };

    // Helper to safely trigger submit
    const triggerSubmit = () => {
        form.submit();
    }

    return (
        <Modal
            open={addModal}
            title="Add New Admin"
            onCancel={() => {
                setAddModal(false)
                reset()
            }}
            onOk={() => {
                if (!data) {
                    triggerSubmit();
                } else {
                    reset()
                    setAddModal(false);
                }
            }}
            okText={data ? "Close" : "Add"}
        >
            {data && data.data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b>Username:</b>
                        <span style={{ fontFamily: 'monospace' }}>{data.data.username}</span>
                        <Button size="small" onClick={handleCopyUsername}>Copy</Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b>Password:</b>
                        <span style={{ fontFamily: 'monospace' }}>{data.data.password}</span>
                        <Button size="small" onClick={handleCopyPassword}>Copy</Button>
                    </div>
                </div>
            ) : (
                <Form
                    onFinish={handleAddUser}
                    layout="vertical"
                    form={form}
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: 'Please enter username' }]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>
                    <Form.Item
                        name="permissions"
                        label="Permissions"
                        rules={[{ required: true, message: 'Select at least one permission' }]}
                    >
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Select permissions"
                            options={ALL_PERMISSIONS.map(p => ({ label: p, value: p }))}
                        />
                    </Form.Item>
                </Form>
            )}
            {error && <div className='text-red-400 flex justify-center'>{(error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error).message}</div>}
        </Modal>
    )
}
