import React from 'react';
import { Modal, Typography, Tag, Descriptions, Space } from 'antd';
import { formatDateTime } from '../../../common/utils/date';
import { Booking } from '../constant';

const { Title, Text } = Typography;

interface BookingDetailModalProps {
    visible: boolean;
    onClose: () => void;
    booking: Booking | null;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ visible, onClose, booking }) => {
    if (!booking) return null;

    const getStatusColor = (status: string): string => {
        if (!status) return 'default';
        switch (status.toLowerCase()) {
            case 'pending':
                return 'orange';
            case 'confirmed':
                return 'blue';
            case 'cancelled':
                return 'red';
            case 'completed':
                return 'green';
            default:
                return 'default';
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <Tag color={getStatusColor(booking.status)}>
                        {booking.status}
                    </Tag>
                    Booking Details
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            style={{ top: 20 }}
        >
            <Descriptions
                bordered
                column={1}
                size="small"
                style={{ marginTop: 16 }}
            >
                <Descriptions.Item label="ID">
                    <Text copyable style={{ fontFamily: 'monospace' }}>
                        {booking._id}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Full Name">
                    <Text strong>{booking.fullName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Trip Name">
                    <Text strong>{booking.tripName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Host Name">
                    <Text>{booking.hostName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Number of People">
                    <Text strong>{booking.numberOfPeople}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(booking.status)}>
                        {booking.status}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Start Date">
                    <Text>{formatDateTime(booking.startDate)}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Created At">
                    <Text>{formatDateTime(booking.createdAt)}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Guest Names">
                    {booking.guestNames && booking.guestNames.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {booking.guestNames.map((guest, index) => (
                                <li key={index}>
                                    <Text>{guest}</Text>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text>No guests listed</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default BookingDetailModal;