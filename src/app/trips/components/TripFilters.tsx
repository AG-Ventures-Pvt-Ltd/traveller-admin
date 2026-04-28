'use client';

import React from 'react';
import { Row, Col, Input, Button, Select } from 'antd';
import { Search, RefreshCw, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'in_review', label: 'In Review' },
    { value: 'published', label: 'Published' },
];

interface TripFiltersProps {
    searchText: string;
    setSearchText: (text: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    onRefresh: () => void;
    onReset: () => void;
    loading: boolean;
}

const TripFilters: React.FC<TripFiltersProps> = ({
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    onRefresh,
    onReset,
    loading,
}) => (
    <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} lg={8}>
            <Input
                placeholder="Search by title or location..."
                prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
            />
        </Col>
        <Col xs={24} sm={8} lg={4}>
            <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                options={STATUS_OPTIONS}
            />
        </Col>
        <Col xs={24} sm={12} lg={4}>
            <Row gutter={8}>
                <Col>
                    <Button icon={<RefreshCw size={16} />} onClick={onRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Col>
                <Col>
                    <Button icon={<RotateCcw size={16} />} onClick={onReset}>
                        Reset
                    </Button>
                </Col>
            </Row>
        </Col>
    </Row>
);

export default TripFilters;

