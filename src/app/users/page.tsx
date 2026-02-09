'use client'
import React, { useState, useEffect, useMemo } from 'react';

import {
  Table, Card, Input, Button, Space, Tag, Avatar, Dropdown, Modal, Select, Row, Col, Typography, Badge, Tooltip, message, ConfigProvider, theme
} from 'antd';
import type { TableProps, MenuProps } from 'antd';
import {
  Search, MoreVertical, User as UserIcon, Ban, CheckCircle, Trash2, Eye, Download, RefreshCw
} from 'lucide-react';
import type { Key } from 'react';
import type { PresetStatusColorType } from 'antd/es/_util/colors';

import { USER_ROLES, ROLE_CONFIG, SUBSCRIPTION_PLANS, PLAN_CONFIG, USER_STATUS, User, UserRole, SubscriptionPlan, UserStatus } from './constant';
import { UserDetailModal } from './UserDetailModal/UserDetailModal';
import { formatCurrency, formatDate } from '../../common/utils/date';
import { PERMISSIONS } from '@/common/constants/permissions';

const { Title, Text } = Typography;
const { Option } = Select;

interface StatusConfigItem {
  color: PresetStatusColorType | 'default';
  text: string;
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<UserStatus, StatusConfigItem> = {
  [USER_STATUS.ACTIVE]: {
    color: 'success',
    text: 'Active',
    icon: <CheckCircle size={14} />
  },
  [USER_STATUS.INACTIVE]: {
    color: 'default',
    text: 'Inactive',
    icon: <UserIcon size={14} />
  },
  [USER_STATUS.SUSPENDED]: {
    color: 'error',
    text: 'Suspended',
    icon: <Ban size={14} />
  },
};

const generateMockUsers = (): User[] => {
  const users: User[] = [];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'company.com', 'example.org'];
  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'India', 'Brazil', 'Mexico'];

  const statuses = Object.values(USER_STATUS) as UserStatus[];
  const roles = Object.values(USER_ROLES) as UserRole[];
  const plans = Object.values(SUBSCRIPTION_PLANS) as SubscriptionPlan[];

  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));

    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - Math.floor(Math.random() * 30));


    users.push({
      id: i,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      plan: plans[Math.floor(Math.random() * plans.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      createdAt: createdDate.toISOString(),
      lastLogin: Math.random() > 0.1 ? lastLoginDate.toISOString() : null,
      isVerified: Math.random() > 0.2,
      totalOrders: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 10000),
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=1890ff&color=fff`
    });

  }

  return users;
};




export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | 'all'>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);



  const loadUsers = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter (name and email)
    if (searchText) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    return filtered;
  }, [users, searchText, statusFilter, roleFilter, planFilter]);



  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();



  }, []);









  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (user: User) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete user "${user.fullName}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const updatedUsers = users.filter(u => u.id !== user.id);
        setUsers(updatedUsers);
        message.success('User deleted successfully');
      }
    });
  };


  const handleBulkAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select users first');
      return;
    }

    Modal.confirm({
      title: `${action} Selected Users`,
      content: `Are you sure you want to ${action.toLowerCase()} ${selectedRowKeys.length} user(s)?`,
      onOk: () => {
        // Implement bulk action logic here
        message.success(`${selectedRowKeys.length} user(s) ${action.toLowerCase()}ed successfully`);
        setSelectedRowKeys([]);
      }
    });
  };



  const getActionItems = (record: User): MenuProps['items'] => [
    {
      key: 'view',
      label: (
        <Space>
          <Eye size={14} />
          View Details
        </Space>
      ),
      onClick: () => handleViewUser(record)
    },
    {
      key: 'suspend',
      label: (
        <Space>
          <Ban size={14} />
          {record.status === USER_STATUS.SUSPENDED ? 'Unsuspend' : 'Suspend'}
        </Space>
      ),
      onClick: () => {
        const newStatus = record.status === USER_STATUS.SUSPENDED ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED;
        const updatedUsers = users.map(user =>
          user.id === record.id ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        message.success(`User ${newStatus === USER_STATUS.SUSPENDED ? 'suspended' : 'unsuspended'} successfully`);
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: (
        <Space>
          <Trash2 size={14} />
          Delete User
        </Space>
      ),
      danger: true,
      onClick: () => handleDeleteUser(record)
    }
  ];

  const columns: TableProps<User>['columns'] = [
    {
      title: 'User',
      dataIndex: 'fullName',
      key: 'user',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <div className='text-[#fff] font-medium flex items-center gap-1'>
              {record.fullName}
              {record.isVerified && (
                <Tooltip title="Verified User">
                  <CheckCircle size={14} style={{ marginLeft: '4px', color: '#52c41a' }} />
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: UserStatus) => (
        <Badge
          status={STATUS_CONFIG[status].color}
          text={
            <Space>
              {STATUS_CONFIG[status].icon}
              {STATUS_CONFIG[status].text}
            </Space>
          }
        />
      ),
      filters: Object.entries(STATUS_CONFIG).map(([key, config]) => ({
        text: config.text,
        value: key
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Type',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: UserRole) => (
        <Tag color={ROLE_CONFIG[role].color}>
          {ROLE_CONFIG[role].text}
        </Tag>
      ),
      filters: Object.entries(ROLE_CONFIG).map(([key, config]) => ({
        text: config.text,
        value: key
      })),
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 100,
      render: (plan: SubscriptionPlan) => (
        <Tag color={PLAN_CONFIG[plan].color}>
          {PLAN_CONFIG[plan].text}
        </Tag>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => (
        <Text style={{ color: '#8c8c8c' }}>{phone}</Text>
      )
    },
    {
      title: 'Joined Trips',
      dataIndex: 'totalOrders',
      key: 'orders',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.totalOrders - b.totalOrders
    },
    {
      title: 'Hosted Trips',
      dataIndex: 'totalOrders',
      key: 'orders',
      width: 82,
      align: 'center',
      sorter: (a, b) => a.totalOrders - b.totalOrders
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      render: (amount) => (
        <Text style={{ color: amount > 5000 ? '#52c41a' : '#8c8c8c' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.totalSpent - b.totalSpent
    },
    {
      title: 'Joined on',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionItems(record)
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreVertical size={16} />}
            style={{ color: '#8c8c8c' }}
          />
        </Dropdown>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: User) => ({
      disabled: record.role === USER_ROLES.ADMIN, // Disable selection for admin users
    }),
  };



  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        }
      }}
    >
      <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
            User Management
          </Title>
          <Text type="secondary">
            Manage user accounts, roles, and permissions
          </Text>
        </div>

        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Input
                placeholder="Search by name or email..."
                prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6} lg={4}>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Status</Option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>{config.text}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6} lg={4}>
              <Select
                placeholder="Role"
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Roles</Option>
                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>{config.text}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6} lg={4}>
              <Select
                placeholder="Plan"
                value={planFilter}
                onChange={setPlanFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Plans</Option>
                {Object.entries(PLAN_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>{config.text}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Space>
                <Button
                  icon={<RefreshCw size={16} />}
                  onClick={loadUsers}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
          {selectedRowKeys.length > 0 && (
            <Row style={{ marginTop: '16px', padding: '12px', background: 'rgba(24, 144, 255, 0.1)', borderRadius: '6px' }}>
              <Col span={24}>
                <Space>
                  <Text style={{ color: '#fff' }}>
                    {selectedRowKeys.length} user(s) selected
                  </Text>
                  <Button size="small" onClick={() => handleBulkAction('Suspend')}>
                    Suspend
                  </Button>
                  <Button size="small" onClick={() => handleBulkAction('Activate')}>
                    Activate
                  </Button>
                  <Button size="small" onClick={() => handleBulkAction('Delete')} danger>
                    Delete
                  </Button>
                  <Button size="small" icon={<Download size={14} />}>
                    Export
                  </Button>
                </Space>
              </Col>
            </Row>
          )}
        </Card>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          bodyStyle={{ padding: '0' }}
        >
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 1400 }}
            pagination={{
              total: filteredUsers.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
          />
        </Card>
        <UserDetailModal selectedUser={selectedUser} modalVisible={modalVisible} setModalVisible={setModalVisible} />
      </div>
    </ConfigProvider>
  );
};

export default Users;

