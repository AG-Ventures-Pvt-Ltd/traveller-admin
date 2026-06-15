'use client'
import React, { useState } from 'react';
import { Typography, Card, ConfigProvider, theme } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { useGetData } from '../../services/useGetData';
import { api } from '../../common/constants/api.urls';
import ErrorLogsTable from './components/ErrorLogTable';
import ErrorLogDetailModal from './components/ErrorLogDetailModal';
import { errorLogColumns } from './components/errorLogsColumns';
import { ErrorLog } from './constant';

const { Title, Text } = Typography;

const ErrorLogs = () => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
    });
    const [selectedErrorLog, setSelectedErrorLog] = useState<ErrorLog | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { data: errorLogsData, isLoading } = useGetData({
        url: api.getErrorLogs,
        key: ['errorLogs'],
        params: {
            page: pagination.current,
            limit: pagination.pageSize,
        },
    });

    

    const handleRowClick = (record: ErrorLog) => {
        return {
            onClick: () => {
                setSelectedErrorLog(record);
                setModalVisible(true);
            },
        };
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedErrorLog(null);
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
                    Error Logs
                </Title>
                <Text style={{ color: '#8c8c8c', marginBottom: '24px', display: 'block' }}>
                    View and monitor application error logs. Click on any row to view detailed information.
                </Text>
                <Card style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <ErrorLogsTable
                        columns={errorLogColumns}
                        data={errorLogsData?.data?.logs as ErrorLog[] || []}
                        loading={isLoading}
                        onRow={handleRowClick}
                        pagination={{
                            ...pagination,
                            total: errorLogsData?.data?.total || 0,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} error logs`,
                            pageSizeOptions: ['10', '30', '50'],
                        }}
                        onChange={handleTableChange}
                    />
                </Card>
                <ErrorLogDetailModal
                    visible={modalVisible}
                    onClose={handleModalClose}
                    errorLog={selectedErrorLog}
                />
            </div>
        </ConfigProvider>
    );
};

export default ErrorLogs;