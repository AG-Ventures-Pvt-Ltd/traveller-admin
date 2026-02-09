import React from 'react';
import { Tag } from 'antd';
import type { TableProps } from 'antd';
import { formatDateTime } from '../../common/utils/date';
import { APILog } from './constant';

export const apiLogColumns: TableProps<APILog>['columns'] = [
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        width: 180,
        render: (time: string) => formatDateTime(time),
        sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        filters: [
            { text: '2xx Success', value: '2xx' },
            { text: '3xx Redirect', value: '3xx' },
            { text: '4xx Client Error', value: '4xx' },
            { text: '5xx Server Error', value: '5xx' },
        ],
        onFilter: (value, record) => {
            const status = record.status;
            if (value === '2xx') return status >= 200 && status < 300;
            if (value === '3xx') return status >= 300 && status < 400;
            if (value === '4xx') return status >= 400 && status < 500;
            if (value === '5xx') return status >= 500 && status < 600;
            return false;
        },
        sorter: (a, b) => (a.status || 0) - (b.status || 0),
        render: (status: number) => {
            if (!status) return '-';
            let color = 'green';
            if (status >= 500) color = 'red';
            else if (status >= 400) color = 'orange';
            else if (status >= 300) color = 'blue';
            return <Tag color={color}>{status}</Tag>;
        },
    },
    {
        title: 'Host',
        dataIndex: 'host',
        key: 'host',
        width: 150,
        ellipsis: true,
    },
    {
        title: 'Request',
        dataIndex: 'request',
        key: 'request',
        width: 250,
        ellipsis: true,
        render: (request: string) => (
            <span title={request} style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {request}
            </span>
        ),
    },
    {
        title: 'Duration',
        dataIndex: 'duration',
        key: 'duration',
        width: 120,
        sorter: (a, b) => (parseFloat(a.duration) || 0) - (parseFloat(b.duration) || 0),
        render: (duration: string) => {
            if (!duration) return '-';
            const ms = parseFloat(duration);
            if (ms < 1000) {
                return `${ms.toFixed(2)}ms`;
            } else {
                return `${(ms / 1000).toFixed(2)}s`;
            }
        },
    },
    {
        title: 'IP Address',
        dataIndex: 'ip',
        key: 'ip',
        width: 130,
        render: (ip: string) => <span style={{ fontFamily: 'monospace' }}>{ip || '-'}</span>,
    },
    {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
        width: 200,
        ellipsis: true,
        render: (message: string) => (
            <span title={message}>
                {message}
            </span>
        ),
    },
];