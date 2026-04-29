'use client'
import React, { useState } from 'react';
import { Typography, Card, ConfigProvider, theme } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { useGetData } from '../../services/useGetData';
import { api } from '../../common/constants/api.urls';
import ApiLogsTable from './components/ApiLogsTable';
import ApiLogDetailModal from './components/ApiLogsDetailedModal';
import { apiLogColumns } from './apiLogColumn';
import { APILog } from './constant';

const { Title, Text } = Typography;

const ApiLogs = () => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
    });
    const [selectedApiLog, setSelectedApiLog] = useState<APILog | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { data: apiLogsData, isLoading } = useGetData({
        key: ['apiLogs'],
        url: api.getApiLogs,
        params: {
            page: pagination.current,
            limit: pagination.pageSize,
        }
    });




    const handleRowClick = (record: APILog) => {
        return {
            onClick: () => {
                setSelectedApiLog(record);
                setModalVisible(true);
            },
        };
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedApiLog(null);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        });
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <div>
                <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
                    API Logs
                </Title>
                <Text style={{ color: '#8c8c8c', marginBottom: '24px', display: 'block' }}>
                    View and monitor API request logs. Click on any row to view detailed information.
                </Text>

                <Card style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <ApiLogsTable
                        columns={apiLogColumns}
                        data={apiLogsData?.data.logs || []}
                        loading={isLoading}
                        onRow={handleRowClick}
                        pagination={{
                            ...pagination,
                            total: apiLogsData?.data.total || 0,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} API logs`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                    />
                </Card>

                <ApiLogDetailModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    apiLog={selectedApiLog}
                />
            </div>
        </ConfigProvider>
    );
};

export default ApiLogs;