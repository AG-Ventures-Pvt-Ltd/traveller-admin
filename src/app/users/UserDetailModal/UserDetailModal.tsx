'use client'
import React from 'react';
import { Modal, Space, Avatar, Tag, Row, Col, Card, Typography } from 'antd';
import { Mail, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/common/utils/date';
import { User as UserType } from '../constant';

const { Text } = Typography;

interface UserDetailModalProps {
  selectedUser: UserType | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const UserDetailModal = ({ selectedUser, modalVisible, setModalVisible }: UserDetailModalProps) => {
  return (
    <Modal
      title={
        <Space>
          <Avatar
            src={selectedUser?.avatar || undefined}
            size={32}
            style={{ backgroundColor: '#1890ff' }}
          >
            {selectedUser?.username?.[0]?.toUpperCase()}
          </Avatar>
          <span style={{ color: '#fff' }}>{selectedUser?.username}</span>
        </Space>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      width={600}
      footer={null}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        content: { backgroundColor: '#1f1f1f' },
      }}
    >
      {selectedUser && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto', marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Contact</Text>
                  <Space>
                    <Mail size={14} style={{ color: '#8c8c8c' }} />
                    <Text style={{ color: '#8c8c8c' }}>{selectedUser.email}</Text>
                  </Space>
                  {selectedUser.username && (
                    <Space>
                      <User size={14} style={{ color: '#8c8c8c' }} />
                      <Text style={{ color: '#8c8c8c' }}>@{selectedUser.username}</Text>
                    </Space>
                  )}
                  {selectedUser.phone && (
                    <Space>
                      <Phone size={14} style={{ color: '#8c8c8c' }} />
                      <Text style={{ color: '#8c8c8c' }}>{selectedUser.phone}</Text>
                    </Space>
                  )}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Account</Text>
                  {selectedUser.isEmailVerified ? (
                    <Tag icon={<CheckCircle size={12} />} color="success">Email Verified</Tag>
                  ) : (
                    <Tag icon={<XCircle size={12} />} color="warning">Email Not Verified</Tag>
                  )}
                  <Text style={{ color: '#8c8c8c' }}>
                    Joined: <Text style={{ color: '#fff' }}>{formatDate(selectedUser.createdAt)}</Text>
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};
