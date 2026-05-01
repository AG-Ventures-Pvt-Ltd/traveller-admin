'use client'
import React, { useState, useCallback } from 'react';
import {
    Typography, Card, Table, Button, Input, Select, Space, Row, Col, Tag, Modal, message
} from 'antd';
import { Plus, RefreshCw } from 'lucide-react';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';
import baseAPI from '@/services/baseApi';
import { Coupon, COUPON_STATUS_OPTIONS, CREATED_BY_OPTIONS } from './constants';
import { getCouponColumns } from './components/CouponColumns';
import { CouponFormModal } from './components/CouponFormModal';
import { CouponUsagesModal } from './components/CouponUsagesModal';

const { Title, Text } = Typography;

const CouponsPage = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [createdByType, setCreatedByType] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [formModal, setFormModal] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });
    const [usagesModal, setUsagesModal] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });

    const queryParams = {
        page,
        limit: pageSize,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(createdByType ? { createdByType } : {}),
    };

    const { data, isLoading, refetch } = useGetData({
        key: ['coupons', JSON.stringify(queryParams)],
        url: api.getCoupons,
        params: queryParams,
    });

    const coupons: Coupon[] = data?.data?.coupons || [];
    const total = data?.data?.total || 0;

    const handleToggle = useCallback((coupon: Coupon) => {
        Modal.confirm({
            title: `${coupon.isActive ? 'Disable' : 'Enable'} Coupon`,
            content: `Are you sure you want to ${coupon.isActive ? 'disable' : 'enable'} coupon "${coupon.code}"?`,
            okText: coupon.isActive ? 'Disable' : 'Enable',
            okType: coupon.isActive ? 'danger' : 'primary',
            onOk: async () => {
                try {
                    await baseAPI.patch(api.toggleCoupon(coupon._id));
                    message.success(`Coupon ${coupon.isActive ? 'disabled' : 'enabled'}`);
                    refetch();
                } catch {
                    message.error('Failed to toggle coupon status');
                }
            }
        });
    }, [refetch]);

    const columns = getCouponColumns(
        (coupon) => setFormModal({ open: true, coupon }),
        handleToggle,
        (coupon) => setUsagesModal({ open: true, coupon }),
    );

    const resetFilters = () => {
        setSearch('');
        setStatus(undefined);
        setCreatedByType(undefined);
        setPage(1);
    };

    return (
        <div className=" min-h-[80vh]">
            <div style={{ marginBottom: 12 }}>
                <Title level={4} style={{ color: '#fff', marginBottom: 0 }}>Discount Coupons</Title>
                <Text type="secondary">Manage discount coupons — create, edit, enable/disable, and view usage history.</Text>
            </div>

            <Card
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}
                styles={{ body: { padding: 16 } }}
            >
                <Row gutter={[12, 12]} align="middle">
                    <Col>
                        <Input.Search
                            placeholder="Search by code or description..."
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
                            options={COUPON_STATUS_OPTIONS}
                            style={{ minWidth: 130 }}
                        />
                    </Col>
                    <Col>
                        <Select
                            allowClear
                            placeholder="Created By"
                            value={createdByType}
                            onChange={v => { setCreatedByType(v); setPage(1); }}
                            options={CREATED_BY_OPTIONS}
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
                                onClick={() => setFormModal({ open: true, coupon: null })}
                            >
                                Create Coupon
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
                    dataSource={coupons}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 1100, y: 450 }}
                    size="middle"
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (t, r) => `${r[0]}-${r[1]} of ${t} coupons`,
                        pageSizeOptions: ['10', '20', '50'],
                        className: '!mr-4',
                        onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                    }}
                />
            </Card>

            <CouponFormModal
                open={formModal.open}
                coupon={formModal.coupon}
                onClose={() => setFormModal({ open: false, coupon: null })}
                onSuccess={() => refetch()}
            />

            <CouponUsagesModal
                open={usagesModal.open}
                coupon={usagesModal.coupon}
                onClose={() => setUsagesModal({ open: false, coupon: null })}
            />
        </div>
    );
};

export default CouponsPage;
