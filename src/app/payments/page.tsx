'use client'
import React, { useState, useCallback } from 'react';
import { Typography, Row, Col, Select, DatePicker, Button, Input } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';

import PaymentTable from './components/PaymentTable';
import { paymentColumns } from './components/PaymentColumns';
import { PAYMENT_STATUS, PAYMENT_METHODS } from './constants';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Payments = () => {
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [method, setMethod] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const queryParams: Record<string, unknown> = {
        page,
        limit: pageSize,
        ...(status ? { status } : {}),
        ...(method ? { method } : {}),
        ...(search ? { search } : {}),
        ...(dateRange?.[0] ? { dateFrom: dateRange[0].format('YYYY-MM-DD') } : {}),
        ...(dateRange?.[1] ? { dateTo: dateRange[1].format('YYYY-MM-DD') } : {}),
    };

    const { data, isLoading } = useGetData({
        key: ['payments', JSON.stringify(queryParams)],
        url: api.getPayments,
        params: queryParams,
    });

    const payments = data?.data?.payments || [];
    const total = data?.data?.total || 0;

    const resetFilters = useCallback(() => {
        setStatus(undefined);
        setMethod(undefined);
        setSearch('');
        setDateRange(null);
        setPage(1);
    }, []);

    const handlePageChange = (p: number, ps: number) => {
        setPage(p);
        setPageSize(ps);
    };

    const handleDateChange: RangePickerProps['onChange'] = (dates) => {
        setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
        setPage(1);
    };

    const columns = (paymentColumns || []).map(col => ({ ...col, align: 'center' as const }));

    return (
        <div>
            <Title level={2} style={{ color: '#fff' }}>Payments</Title>
            <Text style={{ color: '#8c8c8c' }}>View and filter all payment transactions.</Text>

            <div style={{ marginTop: 24, marginBottom: 16 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col>
                        <Select
                            allowClear
                            placeholder="Status"
                            style={{ minWidth: 130 }}
                            value={status}
                            onChange={v => { setStatus(v); setPage(1); }}
                            options={PAYMENT_STATUS.map(s => ({ label: s.label, value: s.value }))}
                        />
                    </Col>
                    <Col>
                        <Select
                            allowClear
                            placeholder="Method"
                            style={{ minWidth: 150 }}
                            value={method}
                            onChange={v => { setMethod(v); setPage(1); }}
                            options={PAYMENT_METHODS.map(m => ({ label: m.label, value: m.value }))}
                        />
                    </Col>
                    <Col>
                        <RangePicker
                            allowClear
                            value={dateRange}
                            onChange={handleDateChange}
                            style={{ minWidth: 220 }}
                        />
                    </Col>
                    <Col>
                        <Input.Search
                            placeholder="Search user, email, gateway ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onSearch={() => setPage(1)}
                            style={{ minWidth: 240 }}
                            allowClear
                        />
                    </Col>
                    <Col>
                        <Button onClick={resetFilters}>Reset</Button>
                    </Col>
                </Row>
            </div>

            <div style={{ marginTop: 8 }}>
                <PaymentTable
                    columns={columns}
                    data={payments}
                    loading={isLoading}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default Payments;
