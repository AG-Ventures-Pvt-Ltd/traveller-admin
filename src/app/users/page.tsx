'use client'
import React, { useState, useMemo } from 'react';

import {
  Table, Card, Input, Button, Space, Tag, Avatar, Typography, ConfigProvider, theme
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, RefreshCw, Eye } from 'lucide-react';

import { User } from './constant';
import { UserDetailModal } from './UserDetailModal/UserDetailModal';
import { formatDate } from '@/common/utils/date';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: usersData, isLoading, refetch } = useGetData({
    key: ['client-users'],
    url: api.getClientUsers,
    params: { page, limit: 10 },
  });

  const users: User[] = usersData?.users || [];
  const total: number = usersData?.total || 0;

  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    const lower = searchText.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
  }, [users, searchText]);

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      key: 'username',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size={36}
            src={record.avatar || undefined}
            style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
          >
            {record.username?.[0]?.toUpperCase()}
          </Avatar>
          <Text style={{ color: '#fff' }}>@{record.username}</Text>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
      render: (phone) =>
        phone ? (
          <Text style={{ color: '#8c8c8c' }}>{phone}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 240,
      render: (email) => <Text style={{ color: '#8c8c8c' }}>{email}</Text>,
    },
    {
      title: 'Email Verified',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      width: 140,
      render: (verified: boolean) =>
        verified ? (
          <Tag color="success">Verified</Tag>
        ) : (
          <Tag color="warning">Unverified</Tag>
        ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Button
          size="small"
          type="text"
          icon={<Eye size={14} />}
          style={{ color: '#1890ff' }}
          onClick={() => {
            setSelectedUser(record);
            setModalVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: '#1890ff', borderRadius: 8 },
      }}
    >
      <div
        style={{
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
            User Management
          </Title>
          <Text type="secondary">Browse and manage traveller accounts</Text>
        </div>

        <Card
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '24px',
          }}
          styles={{ body: { padding: '20px' } }}
        >
          <Space wrap>
            <Input
              placeholder="Search by username or email..."
              prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            <Button
              icon={<RefreshCw size={16} />}
              onClick={() => {
                setSearchText('');
                setPage(1);
                refetch();
              }}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Space>
        </Card>

        <Card
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Table<User>
            columns={columns}
            dataSource={filteredUsers}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 800 }}
            pagination={{
              current: page,
              pageSize: 10,
              total,
              showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} users`,
              onChange: (p) => setPage(p),
            }}
          />
        </Card>
      </div>

      <UserDetailModal
        selectedUser={selectedUser}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </ConfigProvider>
  );
}
