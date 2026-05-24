'use client'
import React, { useState, useMemo, useCallback } from 'react';

import {
  Table, Card, Input, Button, Space, Tag, Avatar, Typography, ConfigProvider, theme
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, RefreshCw, Eye, Wallet } from 'lucide-react';

import { User } from './constant';
import { UserDetailModal } from './UserDetailModal/UserDetailModal';
import { AddWalletCashModal } from './AddWalletCashModal/AddWalletCashModal';
import { formatDate } from '@/common/utils/date';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

const LIMIT = 10;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [walletModalUser, setWalletModalUser] = useState<User | null>(null);
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  const { data: usersData, isLoading, refetch } = useGetData({
    key: ['client-users', String(page), searchText],
    url: api.getClientUsers,
    params: { page, limit: LIMIT, ...(searchText ? { search: searchText } : {}) },
  });

  const users: User[] = useMemo(() => usersData?.data?.data || [], [usersData]);
  const total: number = usersData?.data?.totalItems || 0;

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearchText(searchInput);
  }, [searchInput]);

  const handleClear = useCallback(() => {
    setSearchInput('');
    setSearchText('');
    setPage(1);
    refetch();
  }, [refetch]);

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      key: 'username',
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
      render: (email) => <Text style={{ color: '#8c8c8c' }}>{email}</Text>,
    },
    {
      title: 'Email Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 140,
      align: 'center' as const,
      render: (verified: boolean) =>
        verified ? (
          <Tag color="success">Verified</Tag>
        ) : (
          <Tag color="warning">Unverified</Tag>
        ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => <Text style={{ color: '#8c8c8c' }}>{formatDate(date)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
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
          <Button
            size="small"
            type="text"
            icon={<Wallet size={14} />}
            style={{ color: '#52c41a' }}
            onClick={() => {
              setWalletModalUser(record);
              setWalletModalVisible(true);
            }}
          >
            Add Cash
          </Button>
        </Space>
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              onClear={handleClear}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<Search size={14} />}
              onClick={handleSearch}
              loading={isLoading}
            >
              Search
            </Button>
            <Button
              icon={<RefreshCw size={16} />}
              onClick={handleClear}
              loading={isLoading}
            >
              Reset
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
            dataSource={users}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: LIMIT,
              total,
              showSizeChanger: false,
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

      <AddWalletCashModal
        open={walletModalVisible}
        user={walletModalUser}
        onClose={() => setWalletModalVisible(false)}
        onSuccess={() => refetch()}
      />
    </ConfigProvider>
  );
}
