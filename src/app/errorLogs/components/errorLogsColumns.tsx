import React from 'react';
import type { TableProps } from 'antd';
import { ErrorLog } from '../constant';

export const errorLogColumns: TableProps<ErrorLog>['columns'] = [
    {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
        filters: [
            { text: 'Error', value: 'error' },
            { text: 'Warn', value: 'warn' },
            { text: 'Info', value: 'info' },
            { text: 'Debug', value: 'debug' },
        ],
        onFilter: (value, record) => record.level === value,
        render: (level: string) => {
            let color = 'red';
            if (level === 'warn') color = 'orange';
            if (level === 'info') color = 'blue';
            if (level === 'debug') color = 'gray';
            return <span style={{ color, fontWeight: 'bold' }}>{level?.toUpperCase() || level}</span>;
        },
    },
    {
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        filters: [
            { text: 'GET', value: 'GET' },
            { text: 'POST', value: 'POST' },
            { text: 'PUT', value: 'PUT' },
            { text: 'DELETE', value: 'DELETE' },
        ],
        onFilter: (value, record) => record.method === value,
    },
    {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
        ellipsis: true,
        width: 200,
    },
    {
        title: 'Status Code',
        dataIndex: 'statusCode',
        key: 'statusCode',
        sorter: (a, b) => (a.statusCode || 0) - (b.statusCode || 0),
        render: (statusCode: number) => {
            let color = 'green';
            if (statusCode >= 400 && statusCode < 500) color = 'orange';
            if (statusCode >= 500) color = 'red';
            return <span style={{ color, fontWeight: 'bold' }}>{statusCode}</span>;
        },
    },
    {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
        ellipsis: true,
        width: 250,
    },
    {
        title: 'Stack',
        dataIndex: 'stack',
        key: 'stack',
        ellipsis: true,
        width: 300,
        render: (stack: string | undefined) => stack ? (
            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {stack.length > 200 ? `${stack.substring(0, 200)}...` : stack}
            </pre>
        ) : '-',
    },
    {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
    },
    {
        title: 'Errors',
        dataIndex: 'errors',
        key: 'errors',
        render: (errors: unknown) => errors ? (
            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(errors, null, 2)}
            </pre>
        ) : '-',
    },
];