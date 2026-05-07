'use client';

import React, { useState } from 'react';
import {
    Card,
    Empty,
    List,
    Button,
    Space,
    Tag,
    Rate,
    message,
    Modal,
    Form,
    Input,
    DatePicker,
    Typography,
} from 'antd';
import { Plus, Star } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';

const { Text } = Typography;

interface Review {
    _id: string;
    username: string;
    rating: number;
    review: string;
    createdAt: string;
}

interface ReviewModalProps {
    hostId: string;
    editing: Review | null;
    onClose: () => void;
}

interface ReviewFormValues {
    username: string;
    rating: number;
    review: string;
    createdAt?: Dayjs;
}

const ProfileReviewModal: React.FC<ReviewModalProps> = ({ hostId, editing, onClose }) => {
    const [form] = Form.useForm<ReviewFormValues>();
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (editing) {
            form.setFieldsValue({
                username: editing.username,
                review: editing.review,
                rating: editing.rating,
                createdAt: dayjs(editing.createdAt),
            });
        } else {
            form.resetFields();
        }
    }, [editing, form]);

    const mutation = useMutation({
        mutationFn: (values: ReviewFormValues) => {
            const payload = { 
                username: values.username,
                review: values.review,
                rating: values.rating,
                type: 'profile',
                ...(values.createdAt && { createdAt: values.createdAt.toISOString() })
            };
            return baseAPI.post(api.addProfileReview(hostId), payload);
        },
        onSuccess: () => {
            message.success('Review added');
            queryClient.invalidateQueries({ queryKey: ['profile-reviews', hostId] });
            onClose();
        },
        onError: (err: unknown) => {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            message.error(axiosErr.response?.data?.message || 'Failed to save review');
        },
    });

    return (
        <Modal
            open
            title="Add Review"
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={mutation.isPending}
            okText="Add"
            width={500}
        >
            <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. john_doe" />
                </Form.Item>
                <Form.Item label="Rating" name="rating" rules={[{ required: true, message: 'Required' }]}>
                    <Rate allowHalf={false} />
                </Form.Item>
                <Form.Item label="Review" name="review" rules={[{ required: true, message: 'Required' }]}>
                    <Input.TextArea rows={4} placeholder="Write the review..." maxLength={2000} showCount />
                </Form.Item>
                <Form.Item label="Date" name="createdAt">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

interface ReviewsResponse {
    data: {
        reviews: Review[];
        averageRating: number;
        totalReviews: number;
    };
}

interface ProfileReviewsTabProps {
    hostId: string;
}

export const ProfileReviewsTab: React.FC<ProfileReviewsTabProps> = ({ hostId }) => {
    const [addModalVisible, setAddModalVisible] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['profile-reviews', hostId],
        queryFn: async () => {
            const res = await baseAPI.get(api.getProfileReviews(hostId), {
                params: { type: 'profile' }
            });
            return res.data as ReviewsResponse;
        },
        enabled: !!hostId,
    });

    const reviews: Review[] = data?.data?.reviews || [];
    const averageRating: number = data?.data?.averageRating ?? 0;
    const totalReviews: number = data?.data?.totalReviews ?? 0;

    return (
        <div>
            {addModalVisible && (
                <ProfileReviewModal
                    hostId={hostId}
                    editing={null}
                    onClose={() => setAddModalVisible(false)}
                />
            )}

            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <Star size={16} style={{ color: '#faad14' }} />
                    <Text strong>{averageRating.toFixed(1)}</Text>
                    <Text type="secondary">({totalReviews} reviews)</Text>
                </Space>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => setAddModalVisible(true)}
                    icon={<Plus size={14} />}
                    loading={isLoading}
                >
                    Add Review
                </Button>
            </Space>

            {reviews.length === 0 ? (
                <Empty description="No reviews yet" />
            ) : (
                <List
                    loading={isLoading}
                    dataSource={reviews}
                    renderItem={(review) => (
                        <Card
                            size="small"
                            style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.02)' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Space>
                                        <Text strong>{review.username}</Text>
                                        <Tag color="blue">{review.rating}★</Tag>
                                    </Space>
                                </Space>
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                    {dayjs(review.createdAt).format('MMM DD, YYYY')}
                                </Text>
                                <Text>{review.review}</Text>
                            </Space>
                        </Card>
                    )}
                />
            )}
        </div>
    );
};
