'use client';

import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Trip } from '../constant';

interface PaginationConfig {
    page: number;
    limit: number;
    totalItems: number;
    onChange: (page: number, pageSize: number) => void;
}

interface TripTableProps {
    columns: TableProps<Trip>['columns'];
    data: Trip[];
    loading: boolean;
    pagination: PaginationConfig;
    onRow: (record: Trip) => React.HTMLAttributes<HTMLElement>;
}

const TripTable: React.FC<TripTableProps> = ({ columns, data, loading, pagination, onRow }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} trips`,
            pageSizeOptions: ['10', '20', '50'],
            onChange: pagination.onChange,
            onShowSizeChange: pagination.onChange,
        }}
        onRow={onRow}
    />
);

export default TripTable;

