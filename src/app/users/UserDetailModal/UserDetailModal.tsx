'use client'
import React from 'react';
import { Modal, Space, Avatar, Tag, Descriptions, Typography } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatDateTime } from '@/common/utils/date';
import { User as UserType } from '../constant';

const { Text } = Typography;

interface UserDetailModalProps {
  selectedUser: UserType | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const dash = <Text type="secondary">—</Text>;
const val = (v?: string | number | null) => (v === undefined || v === null || v === '' ? dash : String(v));

export const UserDetailModal = ({ selectedUser, modalVisible, setModalVisible }: UserDetailModalProps) => {
  const u = selectedUser;
  const p = u?.profile;
  const addr = p?.address;
  const ec = p?.emergencyContact;
  const addressText = [addr?.address, addr?.city, addr?.state, addr?.country].filter(Boolean).join(', ');

  return (
    <Modal
      title={
        <Space>
          <Avatar
            src={u?.avatar || undefined}
            size={32}
            style={{ backgroundColor: '#1890ff' }}
          >
            {u?.username?.[0]?.toUpperCase()}
          </Avatar>
          <span style={{ color: '#fff' }}>{u?.fullName || u?.username}</span>
        </Space>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      width={760}
      footer={null}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        body: { backgroundColor: '#1f1f1f' },
      }}
    >
      {u && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto', marginTop: 16 }}>
          <Descriptions title="Account" bordered size="small" column={2}>
            <Descriptions.Item label="User ID" span={2}><Text copyable>{u._id}</Text></Descriptions.Item>
            <Descriptions.Item label="Full Name">{val(u.fullName)}</Descriptions.Item>
            <Descriptions.Item label="Username">{u.username ? `@${u.username}` : dash}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}><Text copyable>{u.email}</Text></Descriptions.Item>
            <Descriptions.Item label="Type">{val(u.type)}</Descriptions.Item>
            <Descriptions.Item label="Email Status">
              {u.isVerified ? (
                <Tag icon={<CheckCircle size={12} />} color="success">Verified</Tag>
              ) : (
                <Tag icon={<XCircle size={12} />} color="warning">Not Verified</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Login Provider">{val(u.provider?.type)}</Descriptions.Item>
            <Descriptions.Item label="Provider ID">{val(u.provider?.id)}</Descriptions.Item>
            <Descriptions.Item label="Joined">{formatDateTime(u.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Last Updated">{u.updatedAt ? formatDateTime(u.updatedAt) : dash}</Descriptions.Item>
          </Descriptions>

          <Descriptions title="Profile" bordered size="small" column={2} style={{ marginTop: 24 }}>
            {p ? (
              <>
                <Descriptions.Item label="Phone">{val(u.phone)}</Descriptions.Item>
                <Descriptions.Item label="Birth Date">{p.birthDate ? formatDate(p.birthDate) : dash}</Descriptions.Item>
                <Descriptions.Item label="Bio" span={2}>{val(p.bio)}</Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>{val(addressText)}</Descriptions.Item>
                <Descriptions.Item label="Emergency Contact">{val(ec?.name)}</Descriptions.Item>
                <Descriptions.Item label="Emergency Number">
                  {ec?.contactNumber ? `${ec.countryCode || ''}-${ec.contactNumber}` : dash}
                </Descriptions.Item>
                <Descriptions.Item label="Government ID Type">{val(p.governmentId?.type)}</Descriptions.Item>
                <Descriptions.Item label="Government ID Number">{val(p.governmentId?.number)}</Descriptions.Item>
                <Descriptions.Item label="Referral Code">
                  {p.referralCode ? <Text copyable>{p.referralCode}</Text> : dash}
                </Descriptions.Item>
                <Descriptions.Item label="Joined Trips">{p.joinedTrips?.length ?? 0}</Descriptions.Item>
                <Descriptions.Item label="Profile Created">{p.createdAt ? formatDateTime(p.createdAt) : dash}</Descriptions.Item>
                <Descriptions.Item label="Profile Updated">{p.updatedAt ? formatDateTime(p.updatedAt) : dash}</Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Profile">Not created yet</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};
