import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Payment } from '../constants';

interface PaymentTableProps {
    columns: TableProps<Payment>['columns'];
    data: Payment[];
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ columns, data, loading, total, page, pageSize, onPageChange }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
            current: page,
            pageSize,
            total,
            onChange: onPageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} payments`,
        }}
    />
);

export default PaymentTable;
