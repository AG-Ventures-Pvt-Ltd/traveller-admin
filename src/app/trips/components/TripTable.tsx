import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Trip } from '../constant';

interface TripTableProps {
    columns: TableProps<Trip>['columns'];
    data: Trip[];
    loading: boolean;
    onRow: (record: Trip) => React.HTMLAttributes<HTMLElement>;
}

const TripTable: React.FC<TripTableProps> = ({ columns, data, loading, onRow }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
        pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} trips`,
            pageSizeOptions: ['10', '20']
        }}
        onRow={onRow}
    />
);

export default TripTable;
