import React from 'react';
import { Row, Col, Input, Button, Select, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { Search, RefreshCw } from 'lucide-react';
import type { RangePickerProps } from 'antd/es/date-picker';

interface TripFiltersProps {
    searchText: string;
    setSearchText: (text: string) => void;
    isCompletedFilter: string;
    setIsCompletedFilter: (filter: string) => void;
    dateRange: [Dayjs | null, Dayjs | null] | null;
    setDateRange: (range: [Dayjs | null, Dayjs | null] | null) => void;
    priceRange: number[];
    setPriceRange: (range: number[]) => void;
    loadTrips: () => void;
    loading: boolean;
}

const TripFilters: React.FC<TripFiltersProps> = ({
    searchText,
    setSearchText,
    isCompletedFilter,
    setIsCompletedFilter,
    dateRange,
    setDateRange,
    priceRange,
    setPriceRange,
    loadTrips,
    loading
}) => (
    <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} lg={6}>
            <Input
                placeholder="Search by title, description, or address..."
                prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
            />
        </Col>
        <Col xs={24} sm={12} lg={4}>
            <Input.Group compact>
                <Select
                    value={isCompletedFilter}
                    onChange={setIsCompletedFilter}
                    style={{ width: '100%' }}
                >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="true">Completed</Select.Option>
                    <Select.Option value="false">Not Completed</Select.Option>
                </Select>
            </Input.Group>
        </Col>
        <Col xs={24} sm={12} lg={5}>
            <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => {
                    setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                }}
                style={{ width: '100%' }}
                allowClear
            />
        </Col>
        <Col xs={24} sm={12} lg={5}>
            <Input.Group compact>
                <Input
                    type="number"
                    min={0}
                    value={priceRange[0] !== undefined ? priceRange[0] : ''}
                    onChange={e => setPriceRange([e.target.value ? Number(e.target.value) : 0, priceRange[1]])}
                    placeholder="Min Price"
                    style={{ width: 90 }}
                />
                <Input
                    type="number"
                    min={0}
                    value={priceRange[1] !== undefined ? priceRange[1] : ''}
                    onChange={e => setPriceRange([priceRange[0], e.target.value ? Number(e.target.value) : 0])}
                    placeholder="Max Price"
                    style={{ width: 90 }}
                />
            </Input.Group>
        </Col>
        <Col xs={24} sm={12} lg={4}>
            <Button
                icon={<RefreshCw size={16} />}
                onClick={loadTrips}
                loading={loading}
            >
                Refresh
            </Button>
        </Col>
    </Row>
);

export default TripFilters;
