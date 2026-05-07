'use client'

import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Input,
    Button,
    Space,
    Tag,
    Avatar,
    Typography,
    Tooltip,
    Badge,
    ConfigProvider,
    theme,
    Modal,
    message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { Search, RefreshCw, Eye, Plus, Shield } from 'lucide-react';
import { HostDetailModal } from './components/HostDetailModal';
import { CreateHostModal } from './components/CreateHostModal';
import { useGetData } from '@/services/useGetData';
import { usePostData } from '@/services/usePostData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

interface Host {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
    isVerified?: boolean;
    isEmailVerified?: boolean;
    isProfileVerified?: boolean;
    createdAt?: string;
    fullName?: string;
    contactNumber?: string;
    type?: string;
    certificates?: string[];
    profile?: {
        mobileNumber?: string;
        countryCode?: string;
    };
    [key: string]: unknown;
}

export default function HostsPage() {
    const [searchText, setSearchText] = useState('');
    const [filteredHosts, setFilteredHosts] = useState<Host[]>([]);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [hostToVerify, setHostToVerify] = useState<Host | null>(null);

    const { data: hostsData, isLoading, refetch } = useGetData({
        key: ['hosts'],
        url: api.getHosts,
        params: {},
    });

    const { mutate: verifyHost, isPending: isVerifying } = usePostData(api.verifyHost, {
        onSuccess: () => {
            message.success('Host verification status updated successfully!');
            refetch();
        },
        onError: (error) => {
            message.error(
                (error?.response?.data as { message?: string })?.message ||
                'Failed to update verification status'
            );
        },
    });

    useEffect(() => {
        // hostsData is the axios response; the JSON body is at .data
        // The API returns { data: [...hosts] } so the array is at .data.data
        const hosts: Host[] = (hostsData?.data?.data as Host[]) ||
            (Array.isArray(hostsData?.data) ? (hostsData?.data as Host[]) : []);

        if (!searchText) {
            setFilteredHosts(hosts);
            return;
        }

        const search = searchText.toLowerCase();
        setFilteredHosts(
            hosts.filter(
                (host) =>
                    host.email?.toLowerCase().includes(search) ||
                    host.username?.toLowerCase().includes(search) ||
                    host.fullName?.toLowerCase().includes(search) ||
                    host.contactNumber?.toLowerCase().includes(search)
            )
        );
    }, [hostsData, searchText]);

    const handleViewDetails = (host: Host) => {
        setSelectedHost(host);
        setModalVisible(true);
    };

    const handleVerifyHost = (host: Host, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setHostToVerify(host);
        setVerifyModalVisible(true);
    };

    const isHostVerified = (host: Host | null) =>
        host ? (host.isVerified ?? host.isProfileVerified ?? false) : false;

    const columns: TableColumnsType<Host> = [
        {
            title: 'Host',
            dataIndex: 'username',
            key: 'username',
            render: (_: unknown, record: Host) => {
                const name = record.fullName || record.username || 'N/A';
                return (
                    <Space>
                        <Avatar size={32} src={record.avatar} style={{ backgroundColor: '#1890ff' }}>
                            {name[0]?.toUpperCase() || 'H'}
                        </Avatar>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 500 }}>{name}</div>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                @{record.username || 'N/A'}
                            </div>
                        </div>
                    </Space>
                );
            },
            width: 200,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => (
                <Text style={{ color: '#8c8c8c' }}>{text || 'N/A'}</Text>
            ),
            width: 220,
        },
        {
            title: 'Phone',
            key: 'phone',
            render: (_: unknown, record: Host) => {
                const phone =
                    record.contactNumber ||
                    (record.profile?.countryCode && record.profile?.mobileNumber
                        ? `${record.profile.countryCode} ${record.profile.mobileNumber}`
                        : record.profile?.mobileNumber) ||
                    'N/A';
                return <Text style={{ color: '#8c8c8c' }}>{phone}</Text>;
            },
            width: 160,
        },
        {
            title: 'Verified',
            key: 'verified',
            render: (_: unknown, record: Host) =>
                isHostVerified(record) ? (
                    <Tag color="success">Verified</Tag>
                ) : (
                    <Tag color="error">Not Verified</Tag>
                ),
            width: 120,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => (
                <Text style={{ color: '#8c8c8c' }}>
                    {text ? new Date(text).toLocaleDateString() : 'N/A'}
                </Text>
            ),
            width: 130,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Host) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={isHostVerified(record) ? 'Unverify Host' : 'Verify Host'}>
                        <Button
                            type="text"
                            icon={<Shield size={16} />}
                            onClick={(e) => handleVerifyHost(record, e)}
                            loading={isVerifying}
                            style={{
                                color: isHostVerified(record) ? '#52c41a' : '#ff9c6e',
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<Eye size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(record);
                            }}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
            fixed: 'right' as const,
        },
    ];

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <div style={{ padding: '24px' }}>
                <Card
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div style={{ marginBottom: '24px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            <Title level={2} style={{ color: '#fff', margin: 0 }}>
                                Hosts Management
                            </Title>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<Plus size={16} />}
                                    onClick={() => setCreateModalVisible(true)}
                                    style={{ background: '#1890ff', borderColor: '#1890ff' }}
                                >
                                    Create Host
                                </Button>
                                <Button
                                    icon={<RefreshCw size={16} />}
                                    onClick={() => refetch()}
                                    loading={isLoading}
                                    style={{
                                        background: 'rgba(24, 144, 255, 0.1)',
                                        borderColor: '#1890ff',
                                        color: '#1890ff',
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        </div>

                        <Input
                            placeholder="Search by name, email or username..."
                            prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                                width: '400px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />
                    </div>

                    <Table<Host>
                        columns={columns}
                        dataSource={filteredHosts}
                        loading={isLoading}
                        rowKey="_id"
                        pagination={{
                            defaultPageSize: 20,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} hosts`,
                        }}
                        scroll={{ x: 'max-content' }}
                        style={{ background: 'transparent' }}
                        onRow={(record) => ({
                            style: { cursor: 'pointer' },
                            onClick: () => handleViewDetails(record),
                        })}
                    />
                </Card>

                <HostDetailModal
                    selectedHost={selectedHost}
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    onHostUpdate={(updatedHost) => {
                        setSelectedHost(updatedHost);
                        refetch();
                    }}
                />

                <CreateHostModal
                    modalVisible={createModalVisible}
                    setModalVisible={setCreateModalVisible}
                    onSuccess={refetch}
                />

                {/* Verify / Unverify confirmation modal */}
                <Modal
                    title={`${isHostVerified(hostToVerify!) ? 'Unverify' : 'Verify'} Host`}
                    open={verifyModalVisible}
                    onOk={() => {
                        if (hostToVerify) {
                            verifyHost({
                                hostId: hostToVerify._id,
                                isVerified: !isHostVerified(hostToVerify),
                            } as unknown as Parameters<typeof verifyHost>[0]);
                        }
                        setVerifyModalVisible(false);
                    }}
                    onCancel={() => {
                        setVerifyModalVisible(false);
                        setHostToVerify(null);
                    }}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: isHostVerified(hostToVerify!) }}
                    confirmLoading={isVerifying}
                >
                    <p>
                        Are you sure you want to{' '}
                        {isHostVerified(hostToVerify!) ? 'unverify' : 'verify'}{' '}
                        <strong>
                            {hostToVerify?.fullName || hostToVerify?.username}
                        </strong>
                        ?
                    </p>
                </Modal>
            </div>
        </ConfigProvider>
    );
}
