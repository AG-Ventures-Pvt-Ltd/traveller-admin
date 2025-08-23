import React from 'react'
import {
    Input, Button, Modal, Form, Select,message
} from 'antd';
import { usePostData } from '../../../APIs/usePostData';
import { api } from '../../../constants/api.urls';


export const EditAdminModal = ({ editModal, setEditModal, ALL_PERMISSIONS }) => {
    
    const [form] = Form.useForm();
    const { mutateAsync: editPermissions, isLoading } = usePostData(api.addAdminUser, {
        onSuccess: () => {
            message.success('Permissions updated');
            setEditModal({ visible: false, user: null });
            form.resetFields();
        },
        onError: (error) => {
            message.error('Failed to update permission' + error?.message);
        }
    });   
    
    const handleSavePermissions = (perms) => {
        editPermissions(perms)
    };

    return (
        <Modal
            open={editModal.visible}
            title={`Edit Permissions: ${editModal.user?.username}`}
            onCancel={() => setEditModal({ visible: false, user: null })}
            onOk={() => {
                document.getElementById('editPermFormBtn').click();
            }}
            okText="Save"
        >
            <Form
                initialValues={{ permissions: editModal.user?.permissions || [] }}
                onFinish={vals => handleSavePermissions(vals.permissions)}
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
                <Button id="editPermFormBtn" htmlType="submit" style={{ display: 'none' }} />
            </Form>
        </Modal>
    )
}
