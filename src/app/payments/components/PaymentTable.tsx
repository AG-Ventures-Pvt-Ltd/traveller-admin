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
    onRowClick: (payment: Payment) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ columns, data, loading, total, page, pageSize, onPageChange, onRowClick }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
            onClick: () => onRowClick(record),
            style: { cursor: 'pointer' },
        })}
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
