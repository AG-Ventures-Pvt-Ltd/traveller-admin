'use client'
import React, { useState } from 'react';
import { Typography, Card, ConfigProvider, theme, Select, Row, Col } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { useGetData } from '../../services/useGetData';
import { api } from '../../common/constants/api.urls';
import BookingsTable from './components/BookingTable';
import BookingDetailModal from './components/BookingDetailedModal';
import { bookingColumns } from './bookingColumns';
import { Booking } from './constant';
import { PERMISSIONS } from '@/common/constants/permissions';

const { Title, Text } = Typography;
const { Option } = Select;


const Bookings = () => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [modalVisible, setModalVisible] = useState(false);


    const { data: bookingsData, isLoading,error } = useGetData({ 
        key: ['bookings'],
        url : api.getBookings,
        params: {
            status: statusFilter || undefined,
            page: pagination.current,
            limit: pagination.pageSize,
            sort: 'createdAt',
            order: 'desc',
        }
     });

    


    // const boookings_data = callBokkings(statusFilter, pagination)
    // console.log(boookings_data)

     
     
    

    const handleRowClick = (record: Booking ) => {
        return {
            onClick: () => {
                setSelectedBooking(record);
                setModalVisible(true);
            },
        };
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedBooking(null);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        });
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <div>
                <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
                    Bookings
                </Title>
                <Text style={{ color: '#8c8c8c', marginBottom: '24px', display: 'block' }}>
                    View and manage all bookings. Click on any row to view detailed information.
                </Text>

                <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col>
                        <Text style={{ color: '#fff', marginRight: '8px' }}>Status:</Text>
                        <Select
                            placeholder="Filter by status"
                            style={{ width: 200 }}
                            allowClear
                            onChange={handleStatusFilterChange}
                            value={statusFilter}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="confirmed">Confirmed</Option>
                            <Option value="cancelled">Cancelled</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Col>
                </Row>

                <Card style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <BookingsTable
                        columns={bookingColumns}
                        data={bookingsData?.data.data.bookings || []}
                        loading={false}
                        onRow={handleRowClick}
                        pagination={{
                            ...pagination,
                            total: bookingsData?.data.data.pagination.totalBookings || 0,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} bookings`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                    />
                </Card>

                <BookingDetailModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    booking={selectedBooking}
                />
            </div>
        </ConfigProvider>
    );
};

export default Bookings;