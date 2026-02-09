import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Payment } from '../constants';

interface PaymentTableProps {
    columns: TableProps<Payment>['columns'];
    data: Payment[];
    loading: boolean;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ columns, data, loading }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey="payment_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
            pageSizeOptions: ['10', '20']
        }}
    />
);

export default PaymentTable;
