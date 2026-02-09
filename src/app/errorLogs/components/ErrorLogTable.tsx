import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { ErrorLog } from '../constant';

interface ErrorLogsTableProps {
    columns: TableProps<ErrorLog>['columns'];
    data: ErrorLog[];
    loading: boolean;
    onRow: (record: ErrorLog) => React.HTMLAttributes<HTMLElement>;
    pagination: TableProps<ErrorLog>['pagination'];
    onChange: TableProps<ErrorLog>['onChange'];
}

const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ columns, data, loading, onRow, pagination, onChange }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => `${record.timestamp || 'log'}-${record.id || Math.random()}`}
        loading={loading}
        scroll={{ x: 1500, y: 600 }}
        pagination={pagination}
        onRow={onRow}
        onChange={onChange}
    />
);

export default ErrorLogsTable;