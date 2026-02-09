import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Booking } from '../constant';

interface BookingsTableProps {
    columns: TableProps<Booking>['columns'];
    data: Booking[];
    loading: boolean;
    onRow: (record: Booking) => React.HTMLAttributes<HTMLElement>;
    pagination: TableProps<Booking>['pagination'];
    onChange: TableProps<Booking>['onChange'];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ columns, data, loading, onRow, pagination, onChange }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record._id || `booking-${Math.random()}`}
        loading={loading}
        scroll={{ x: 1200, y: 400 }}
        pagination={pagination}
        onRow={onRow}
        onChange={onChange}
    />
);

export default BookingsTable;