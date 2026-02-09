import React from 'react';
import { Modal, Descriptions, Tag, Image, Space } from 'antd';
import { Trip } from '../constant';

interface TripDetailModalProps {
  visible: boolean;
  onClose: () => void;
  trip: Trip | null;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ visible, onClose, trip }) => {
  if (!trip) return null;
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={trip.title}
      width={700}
    >
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Description">{trip.description}</Descriptions.Item>
        <Descriptions.Item label="Start Date">{new Date(trip.startDate).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="End Date">{new Date(trip.endDate).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Address">{trip.address}</Descriptions.Item>
        <Descriptions.Item label="Host">
          <Space>
            <img src={trip.host.avatar} alt={trip.host.name} style={{ width: 32, borderRadius: '50%' }} />
            {trip.host.name}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Completed">
          <Tag color={trip.isCompleted ? 'green' : 'red'}>{trip.isCompleted ? 'Yes' : 'No'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Max Capacity">{trip.maxCapacity}</Descriptions.Item>
        <Descriptions.Item label="Tags">
          <Space>{trip.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Price">${trip.price}</Descriptions.Item>
        <Descriptions.Item label="Cancellation Policy">
          <Tag color="purple" style={{ cursor: 'pointer' }} onClick={trip.onShowPolicyModal}>Click to view</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Preview Images">
          <Space>
            {trip.previewImages.map((img: string, idx: number) => (
              <Image key={idx} src={img} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Joined Users">
          <Space>{trip.joinedUsers.map((user: string) => <Tag key={user}>{user}</Tag>)}</Space>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default TripDetailModal;
