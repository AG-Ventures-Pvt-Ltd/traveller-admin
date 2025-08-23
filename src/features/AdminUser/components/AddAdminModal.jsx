import {
    Input, Button, Modal, Form, Select,message
} from 'antd';
import { usePostData } from '../../../APIs/usePostData';
import { api } from '../../../constants/api.urls';

export const AddAdminModal = ({ addModal, setAddModal, ALL_PERMISSIONS }) => {

    const [form] = Form.useForm();
    const { mutateAsync: addUser, isLoading } = usePostData(api.addAdminUser, {
        onSuccess: () => {
            message.success('Admin added');
            setAddModal(false);
            form.resetFields();

        },
        onError: (error) => {
            message.error('Failed to add admin: ' + error?.message);
        }
    });


    const handleAddUser = async (values) => {
        await addUser(values)
    };

    return (
        <Modal
            open={addModal}
            title="Add New Admin"
            onCancel={() => setAddModal(false)}
            onOk={() => {
                document.getElementById('addAdminFormBtn').click();
            }}
            okText="Add"
        >
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
                <Button id="addAdminFormBtn" htmlType="submit" style={{ display: 'none' }} />
            </Form>
        </Modal>
    )
}
