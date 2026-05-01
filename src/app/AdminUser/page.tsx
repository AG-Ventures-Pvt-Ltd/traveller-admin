'use client'


import React, { useState, useEffect } from 'react';
import {
  Table, Card, Input, Button, Space, Tag, Avatar, Dropdown, Modal, Row, Col, Typography, message
} from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';
import {
  Search, MoreVertical, Plus, Trash2, Edit2, RefreshCw
} from 'lucide-react';
import { AddAdminModal } from './components/addAdminModal';
import { EditAdminModal } from './components/editAdminModal';
import { useGetData } from '../../services/useGetData';
import { api } from '../../common/constants/api.urls';
import { DeleteAdminModal } from './components/deleteAdminModal';
import { Admin } from './constant';


const { Title, Text } = Typography;

const ALL_PERMISSIONS = [
  'dashboard', 'users', 'hosts', 'bookings', 'trips', 'stories',
  'payments', 'usersupport', 'settings', 'adminusers',
  'errorlogs', 'apilogs', 'serverhealth', 'configs', 'coupons',
]

const AdminUser = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editModal, setEditModal] = useState<{ visible: boolean; user: Admin | null }>({ visible: false, user: null });
  const [addModal, setAddModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; user: Admin | null }>({ visible: false, user: null });

  const { data, refetch, isFetching } = useGetData({
    key: ['admins'],
    url: api.getAdminUser, 
    params: { page: pagination.current, limit: pagination.pageSize }
  })

  console.log(data?.data.data, data)
 

  useEffect(() => {
    if (data && Array.isArray(data?.data?.data)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdmins(data?.data?.data);
      setFilteredAdmins(data?.data?.data);
      setPagination(prev => ({ ...prev, total: data?.data.totalPages || 0 }));
    } 
  }, [data]);

  const applyFilters = React.useCallback(() => {
    let filtered = [...admins];
    if (searchText) {
      filtered = filtered.filter(admin =>
        admin.username.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredAdmins(filtered);
  }, [admins, searchText]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyFilters();
  }, [admins, searchText, applyFilters]);

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination(prev => ({ ...prev, current: pag.current || 1, pageSize: pag.pageSize || 10 }));
  };

  const handleEditPermissions = (user: Admin) => {
    setEditModal({ visible: true, user });
  };

  const handleDeleteUser = (user: Admin) => {
    setDeleteModal({ visible: true, user });
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select admins first');
      return;
    }
    Modal.confirm({
      title: 'Delete Selected Admins',
      content: `Are you sure you want to delete ${selectedRowKeys.length} admin(s)?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setAdmins(prev => prev.filter(a => !selectedRowKeys.includes(a._id)));
        setSelectedRowKeys([]);
        message.success('Admins deleted');
      }
    });
  };


  const columns: TableProps<Admin>['columns'] = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 220,
      render: (text, record) => (
        <Space>
          <Avatar size={40} src={record.avatar} style={{ backgroundColor: '#1890ff' }}>
            {record.username[0].toUpperCase()}
          </Avatar>
          <span className="text-[#fff] font-medium">{record.username}</span>
        </Space>
      )
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: string[]) => (
        <Space wrap>
          {perms.length === 0 ? <Tag color="default">None</Tag> : perms.map(p => (
            <Tag key={p} color="blue">{p}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Added On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record) => (
        <Space>
          {new Date(record.createdAt).toLocaleDateString()}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: (
                  <Space>
                    <Edit2 size={14} />
                    Edit Permissions
                  </Space>
                ),
                onClick: () => handleEditPermissions(record)
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                label: (
                  <Space>
                    <Trash2 size={14} />
                    Delete
                  </Space>
                ),
                danger: true,
                onClick: () => handleDeleteUser(record)
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreVertical size={16} />} style={{ color: '#8c8c8c' }} />
        </Dropdown>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
      <div className="-m-2 -mb-4 min-h-[80vh] h-[80vh] overflow-auto">
        <div style={{ marginBottom: '12px' }}>
          <Title level={4} style={{ color: '#fff', marginBottom: '0' }}>
            Admin Users
          </Title>
          <Text type="secondary">
            Manage admin accounts and permissions
          </Text>
        </div>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '12px',
          }}
          styles={{
            body: { padding: '16px' }
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Input
                placeholder="Search by username..."
                prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Space>
                <Button
                  icon={<Plus size={16} />}
                  type="primary"
                  onClick={() => setAddModal(true)}
                >
                  Add Admin
                </Button>
                <Button
                  icon={<RefreshCw size={16} />}
                  onClick={() => refetch()}
                  loading={isFetching}
                >
                  Refresh
                </Button>
                <Button
                  icon={<Trash2 size={16} />}
                  danger
                  onClick={handleBulkDelete}
                  disabled={selectedRowKeys.length === 0}
                >
                  Delete Selected
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          styles={{
            body: { padding: '0' }
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredAdmins}
            rowKey="_id"
            loading={isFetching}
            rowSelection={rowSelection}
            scroll={{ x: '100%', y: 312 }}
            rowClassName={() => 'bg-red py-0'}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} admins`,
              pageSizeOptions: ['10', '20', '50'],
              className: '!mr-4 '
            }}
            onChange={handleTableChange}
            style={{
              // '.antTable': {
              //   background: 'transparent'
              // }
            }}
          />
        </Card>
        <EditAdminModal editModal={editModal} setEditModal={setEditModal} ALL_PERMISSIONS={ALL_PERMISSIONS} onSuccess={refetch} />
        <AddAdminModal addModal={addModal} setAddModal={setAddModal} ALL_PERMISSIONS={ALL_PERMISSIONS} />
        <DeleteAdminModal setAdmins={setAdmins} deleteModal={deleteModal} setDeleteModal={setDeleteModal} onSuccess={refetch} />
      </div>
  );
};

export default AdminUser;