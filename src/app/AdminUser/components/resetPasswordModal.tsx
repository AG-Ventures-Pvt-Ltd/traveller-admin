import React, { useEffect } from 'react'
import {
    Input, Button, Modal, Form, Radio, message
} from 'antd';
import { usePostData } from '../../../services/usePostData';
import { api } from '../../../common/constants/api.urls';
import { Admin } from '../constant';

interface ResetPasswordModalProps {
    resetModal: { visible: boolean; user: Admin | null };
    setResetModal: React.Dispatch<React.SetStateAction<{ visible: boolean; user: Admin | null }>>;
}

type ResetMode = 'generate' | 'custom';
type ResetPayload = { generate: boolean; password?: string };
type ResetResponse = { data: { username: string; password: string } };

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ resetModal, setResetModal }) => {

    const [form] = Form.useForm();
    const mode: ResetMode = Form.useWatch('mode', form) || 'generate';

    const { mutateAsync: resetPassword, isPending: isLoading, data, reset, error } = usePostData<ResetResponse, ResetPayload>(
        resetModal.user ? api.resetAdminUserPassword(resetModal.user._id) : '',
        {
            onSuccess: () => {
                message.success('Password reset');
            },
            onError: (err) => {
                message.error('Failed to reset password: ' + ((err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || err?.message));
            }
        }
    );

    useEffect(() => {
        if (resetModal.visible) {
            form.setFieldsValue({ mode: 'generate', password: '' });
        }
    }, [resetModal.visible, form]);

    const handleClose = () => {
        setResetModal({ visible: false, user: null });
        form.resetFields();
        reset();
    };

    const handleReset = async (values: { mode: ResetMode; password?: string }) => {
        if (values.mode === 'generate') {
            await resetPassword({ generate: true });
        } else {
            await resetPassword({ generate: false, password: values.password });
        }
    };

    const handleCopyPassword = () => {
        if (data?.data) {
            navigator.clipboard.writeText(data.data.password);
            message.success('Password copied!');
        }
    };

    return (
        <Modal
            open={resetModal.visible}
            title={`Reset Password: ${resetModal.user?.username}`}
            onCancel={handleClose}
            onOk={() => {
                if (data) {
                    handleClose();
                } else {
                    form.submit();
                }
            }}
            okText={data ? 'Close' : 'Reset Password'}
            confirmLoading={isLoading}
        >
            {data?.data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b>Username:</b>
                        <span style={{ fontFamily: 'monospace' }}>{data.data.username}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b>New Password:</b>
                        <span style={{ fontFamily: 'monospace' }}>{data.data.password}</span>
                        <Button size="small" onClick={handleCopyPassword}>Copy</Button>
                    </div>
                    <span style={{ color: '#faad14', fontSize: 12 }}>
                        Save this password now — it cannot be retrieved again.
                    </span>
                </div>
            ) : (
                <Form
                    form={form}
                    onFinish={handleReset}
                    layout="vertical"
                    initialValues={{ mode: 'generate' }}
                >
                    <Form.Item name="mode" label="Method">
                        <Radio.Group>
                            <Radio value="generate">Generate password</Radio>
                            <Radio value="custom">Set custom password</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {mode === 'custom' && (
                        <Form.Item
                            name="password"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter a password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Input.Password placeholder="Enter new password" />
                        </Form.Item>
                    )}
                </Form>
            )}
            {error && <div className='text-red-400 flex justify-center'>{(error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error).message}</div>}
        </Modal>
    )
}
