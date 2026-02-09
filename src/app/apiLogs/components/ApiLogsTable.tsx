import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import { APILog } from '../constant';

interface ApiLogsTableProps {
    columns: TableProps<APILog>['columns'];
    data: APILog[];
    loading: boolean;
    onRow: (record: APILog) => React.HTMLAttributes<HTMLElement>;
    pagination: TableProps<APILog>['pagination'];
    onChange: TableProps<APILog>['onChange'];
}

const ApiLogsTable: React.FC<ApiLogsTableProps> = ({ columns, data, loading, onRow, pagination, onChange }) => (
    <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => `${record.time || 'log'}-${Math.random()}`}
        loading={loading}
        scroll={{ x: 1200, y: 600 }}
        pagination={pagination}
        onRow={onRow}
        onChange={onChange}
    />
);

export default ApiLogsTable;