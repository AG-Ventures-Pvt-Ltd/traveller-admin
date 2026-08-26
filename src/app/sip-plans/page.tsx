'use client'
import React, { useState, useCallback } from 'react';
import {
    Typography, Card, Table, Button, Input, Select, Space, Row, Col, Modal, message
} from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';
import { SipPlan, SIP_PLAN_STATUS_OPTIONS } from './constants';
import { getSipPlanColumns } from './components/SipPlanColumns';
import { SipPlanFormModal } from './components/SipPlanFormModal';
import { SipSubscribersModal } from './components/SipSubscribersModal';

const { Title, Text } = Typography;

const SipPlansPage = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [formModal, setFormModal] = useState<{ open: boolean; plan: SipPlan | null }>({ open: false, plan: null });
    const [subscribersModal, setSubscribersModal] = useState<{ open: boolean; plan: SipPlan | null }>({ open: false, plan: null });

    const queryParams = {
        page,
        limit: pageSize,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
    };

    const { data, isLoading, refetch } = useGetData({
        key: ['sip-plans', JSON.stringify(queryParams)],
        url: api.getSipPlans,
        params: queryParams,
    });

    const plans: SipPlan[] = data?.data?.plans || [];
    const total = data?.data?.total || 0;

    const handleToggle = useCallback((plan: SipPlan) => {
        Modal.confirm({
            title: `${plan.isActive ? 'Disable' : 'Enable'} SIP Plan`,
            content: `Are you sure you want to ${plan.isActive ? 'disable' : 'enable'} "${plan.name}"? ${plan.isActive ? 'It will be removed from the public plan list — existing subscribers are unaffected.' : ''}`,
            okText: plan.isActive ? 'Disable' : 'Enable',
            okType: plan.isActive ? 'danger' : 'primary',
            onOk: async () => {
                try {
                    await baseAPI.patch(api.toggleSipPlan(plan._id));
                    message.success(`SIP plan ${plan.isActive ? 'disabled' : 'enabled'}`);
                    refetch();
                } catch {
                    message.error('Failed to toggle SIP plan status');
                }
            }
        });
    }, [refetch]);

    const columns = getSipPlanColumns(
        (plan) => setFormModal({ open: true, plan }),
        handleToggle,
        (plan) => setSubscribersModal({ open: true, plan }),
    );

    const resetFilters = () => {
        setSearch('');
        setStatus(undefined);
        setPage(1);
    };

    return (
        <div className=" min-h-[80vh]">
            <div style={{ marginBottom: 12 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 0 }}>Travel SIP Plans</Title>
                <Text type="secondary">Manage recurring-investment plans — create, edit, enable/disable, and view subscriber progress.</Text>
            </div>

            <Card
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}
                styles={{ body: { padding: 16 } }}
            >
                <Row gutter={[12, 12]} align="middle">
                    <Col>
                        <Input.Search
                            placeholder="Search by name or description..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onSearch={() => setPage(1)}
                            allowClear
                            style={{ minWidth: 240 }}
                        />
                    </Col>
                    <Col>
                        <Select
                            allowClear
                            placeholder="Status"
                            value={status}
                            onChange={v => { setStatus(v); setPage(1); }}
                            options={SIP_PLAN_STATUS_OPTIONS}
                            style={{ minWidth: 130 }}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button onClick={resetFilters}>Reset</Button>
                            <Button icon={<RefreshCw size={14} />} onClick={() => refetch()} loading={isLoading}>
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<Plus size={14} />}
                                onClick={() => setFormModal({ open: true, plan: null })}
                            >
                                Create Plan
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
                    dataSource={plans}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 1100, y: 450 }}
                    size="middle"
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (t, r) => `${r[0]}-${r[1]} of ${t} plans`,
                        pageSizeOptions: ['10', '20', '50'],
                        className: '!mr-4',
                        onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                    }}
                />
            </Card>

            <SipPlanFormModal
                open={formModal.open}
                plan={formModal.plan}
                onClose={() => setFormModal({ open: false, plan: null })}
                onSuccess={() => refetch()}
            />

            <SipSubscribersModal
                open={subscribersModal.open}
                plan={subscribersModal.plan}
                onClose={() => setSubscribersModal({ open: false, plan: null })}
            />
        </div>
    );
};

export default SipPlansPage;
