
import React, { useState, useEffect } from 'react';
import {
  Table, Card, Input, Button, Space, Tag, Avatar, Dropdown, Modal, Row, Col, Typography, ConfigProvider, theme, message, Form, Select
} from 'antd';
import {
  Search, MoreVertical, Plus, Trash2, Edit2, RefreshCw
} from 'lucide-react';
import { AddAdminModal } from './components/AddAdminModal.jsx';
import { EditAdminModal } from './components/EditAdminModal.jsx';
import { useGetData } from '../../APIs/useGetData.js';
import { api } from '../../constants/api.urls.js';


const { Title, Text } = Typography;

const ALL_PERMISSIONS = ['dashboard', 'users', 'trips', 'stories', 'analytics', 'reports', 'payments', 'usersupport', 'settings', 'adminusers']

export const AdminUser = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [editModal, setEditModal] = useState({ visible: false, user: null });
  const [addModal, setAddModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const { data, refetch, isFetching } = useGetData(
    ['admins'],
    api.getAdminUser,
    { page: pagination.current, limit: pagination.pageSize }
  );

  useEffect(() => {
    if (data && Array.isArray(data.data)) {
      setAdmins(data.data);
      setFilteredAdmins(data.data);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
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
    applyFilters();
  }, [admins, searchText, applyFilters]);

  const handleTableChange = (pag) => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleEditPermissions = (user) => {
    setEditModal({ visible: true, user });
  };

  const handleDeleteUser = (user) => {
    Modal.confirm({
      title: 'Delete Admin',
      content: `Are you sure you want to delete admin "${user.username}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setAdmins(prev => prev.filter(a => a.id !== user.id));
        message.success('Admin deleted');
      }
    });
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
        setAdmins(prev => prev.filter(a => !selectedRowKeys.includes(a.id)));
        setSelectedRowKeys([]);
        message.success('Admins deleted');
      }
    });
  };


  const columns = [
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
      render: (perms) => (
        <Space wrap>
          {perms.length === 0 ? <Tag color="default">None</Tag> : perms.map(p => (
            <Tag key={p} color="blue">{p}</Tag>
          ))}
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
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        }
      }}
    >
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
            marginBottom: '12px'
          }}
          bodyStyle={{ padding: '16px' }}
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
                  onClick={refetch}
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
          styles={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            body: { padding: '0' }
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredAdmins}
            rowKey="id"
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
              className : '!mr-4 '
            }}
            onChange={handleTableChange}
            style={{
              '.ant-table': {
                background: 'transparent'
              }
            }}
          />
        </Card>
        <EditAdminModal editModal={editModal} setEditModal={setEditModal} ALL_PERMISSIONS={ALL_PERMISSIONS} />
        <AddAdminModal addModal={addModal} setAddModal={setAddModal} ALL_PERMISSIONS={ALL_PERMISSIONS}/>
      </div>
    </ConfigProvider>
  );
};
