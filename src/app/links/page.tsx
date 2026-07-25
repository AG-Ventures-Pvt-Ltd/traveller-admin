'use client'
import React, { useMemo, useState, useCallback } from 'react';
import { Typography, Card, Table, Button, Input, Select, Space, Row, Col, Modal, message } from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';
import { Link, LINK_STATUS_OPTIONS } from './constants';
import { getLinkColumns } from './components/LinkColumns';
import { LinkFormModal } from './components/LinkFormModal';

const { Title, Text } = Typography;

const LinksPage = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>('active');
    const [formModal, setFormModal] = useState<{ open: boolean; link: Link | null }>({ open: false, link: null });

    const { data, isLoading, refetch } = useGetData({
        key: ['links'],
        url: api.getLinks,
    });

    const links: Link[] = data?.data?.links || [];

    const filteredLinks = useMemo(() => {
        return links.filter((link) => {
            if (status === 'active' && !link.isActive) return false;
            if (status === 'inactive' && link.isActive) return false;
            if (search) {
                const q = search.toLowerCase();
                return link.shortCode.toLowerCase().includes(q) || link.label?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [links, status, search]);

    const handleToggle = useCallback((link: Link) => {
        Modal.confirm({
            title: `${link.isActive ? 'Deactivate' : 'Activate'} Link`,
            content: `Are you sure you want to ${link.isActive ? 'deactivate' : 'activate'} "${link.shortCode}"?`,
            okText: link.isActive ? 'Deactivate' : 'Activate',
            okType: link.isActive ? 'danger' : 'primary',
            onOk: async () => {
                try {
                    if (link.isActive) {
                        await baseAPI.delete(api.deleteLink(link.shortCode));
                    } else {
                        await baseAPI.patch(api.updateLink(link.shortCode), { isActive: true });
                    }
                    message.success(`Link ${link.isActive ? 'deactivated' : 'activated'}`);
                    refetch();
                } catch {
                    message.error('Failed to update link status');
                }
            }
        });
    }, [refetch]);

    const columns = getLinkColumns(
        (link) => setFormModal({ open: true, link }),
        handleToggle,
    );

    return (
        <div className="min-h-[80vh]">
            <div style={{ marginBottom: 12 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 0 }}>Links</Title>
                <Text type="secondary">Short links for off-platform placements (IG bio, stories, etc) — track clicks per link.</Text>
            </div>

            <Card
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}
                styles={{ body: { padding: 16 } }}
            >
                <Row gutter={[12, 12]} align="middle">
                    <Col>
                        <Input.Search
                            placeholder="Search by short code or label..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            allowClear
                            style={{ minWidth: 240 }}
                        />
                    </Col>
                    <Col>
                        <Select
                            allowClear
                            placeholder="Status"
                            value={status}
                            onChange={setStatus}
                            options={LINK_STATUS_OPTIONS}
                            style={{ minWidth: 130 }}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<RefreshCw size={14} />} onClick={() => refetch()} loading={isLoading}>
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<Plus size={14} />}
                                onClick={() => setFormModal({ open: true, link: null })}
                            >
                                New Link
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredLinks}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 900 }}
                    size="middle"
                    rowClassName={(record) => (record.isActive ? '' : 'opacity-50')}
                    pagination={{ pageSize: 20, showTotal: (t) => `${t} links` }}
                />
            </Card>

            <LinkFormModal
                open={formModal.open}
                link={formModal.link}
                onClose={() => setFormModal({ open: false, link: null })}
                onSuccess={() => refetch()}
            />
        </div>
    );
};

export default LinksPage;
