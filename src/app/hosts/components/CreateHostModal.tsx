'use client'

import React from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Space,
    message,
    Row,
    Col,
    Select,
    InputNumber,
} from 'antd';
import { usePostData } from '@/services/usePostData';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/common/constants/api.urls';

interface CreateHostModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    onSuccess?: () => void;
}

interface CreateHostFormValues {
    fullName: string;
    username: string;
    email: string;
    password: string;
    contactNumber: string;
    hostType: string;
    yearsOfExperience: number;
}

export const CreateHostModal: React.FC<CreateHostModalProps> = ({
    modalVisible,
    setModalVisible,
    onSuccess,
}) => {
    const [form] = Form.useForm<CreateHostFormValues>();
    const queryClient = useQueryClient();

    const { mutate: createHost, isPending } = usePostData<unknown, CreateHostFormValues>(
        api.createHost,
        {
            onSuccess: () => {
                message.success('Host created successfully!');
                form.resetFields();
                setModalVisible(false);
                queryClient.invalidateQueries({ queryKey: ['hosts'] });
                onSuccess?.();
            },
            onError: (error) => {
                message.error(
                    (error?.response?.data as { message?: string })?.message ||
                    'Failed to create host'
                );
            },
        }
    );

    const handleSubmit = (values: CreateHostFormValues) => {
        createHost(values);
    };

    const handleCancel = () => {
        setModalVisible(false);
        form.resetFields();
    };

    return (
        <Modal
            title="Create New Host"
            open={modalVisible}
            onCancel={handleCancel}
            footer={null}
            width={700}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="fullName"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter full name' }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Please enter username' }]}
                        >
                            <Input placeholder="Enter username" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Please enter a valid email' },
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 6, message: 'Password must be at least 6 characters' },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="contactNumber"
                            label="Contact Number"
                            rules={[{ required: true, message: 'Please enter contact number' }]}
                        >
                            <Input placeholder="Enter contact number" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="hostType"
                            label="Host Type"
                            rules={[{ required: true, message: 'Please select host type' }]}
                        >
                            <Select placeholder="Select host type">
                                <Select.Option value="Individual">Individual</Select.Option>
                                <Select.Option value="Organization">Company</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item
                            name="yearsOfExperience"
                            label="Years of Experience"
                            rules={[{ required: true, message: 'Please enter years of experience' }]}
                        >
                            <InputNumber
                                min={0}
                                placeholder="Enter years of experience"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isPending}>
                        Create Host
                    </Button>
                </Space>
            </Form>
        </Modal>
    );
};
