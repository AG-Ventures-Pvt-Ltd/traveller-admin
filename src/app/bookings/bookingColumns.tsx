import React from 'react';
import { Tag } from 'antd';
import type { TableProps } from 'antd';
import { formatDateTime } from '../../common/utils/date';
import { Booking } from './constant';

export const bookingColumns: TableProps<Booking>['columns'] = [
    {
        title: 'ID',
        dataIndex: '_id',
        key: '_id',
        width: 60,
        ellipsis: true,
        render: (_id: string) => _id ? _id.slice(-6).toUpperCase() : '-',
    },
    {
        title: 'Full Name',
        dataIndex: 'fullName',
        key: 'fullName',
        width: 110,
        ellipsis: true,
    },
    {
        title: 'Trip Name',
        dataIndex: 'tripName',
        key: 'tripName',
        width: 150,
        ellipsis: true,
    },
    {
        title: 'Host Name',
        dataIndex: 'hostName',
        key: 'hostName',
        width: 100,
        ellipsis: true,
    },
    {
        title: 'PaX',
        dataIndex: 'numberOfPeople',
        key: 'numberOfPeople',
        width: 50,
        sorter: (a, b) => (a.numberOfPeople || 0) - (b.numberOfPeople || 0),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 70,
        filters: [
            { text: 'Pending', value: 'pending' },
            { text: 'Confirmed', value: 'confirmed' },
            { text: 'Cancelled', value: 'cancelled' },
            { text: 'Completed', value: 'completed' },
        ],
        onFilter: (value, record) => record.status === value,
        sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
        render: (status: string) => {
            if (!status) return '-';
            let color = 'default';
            switch (status.toLowerCase()) {
                case 'pending':
                    color = 'orange';
                    break;
                case 'confirmed':
                    color = 'blue';
                    break;
                case 'cancelled':
                    color = 'red';
                    break;
                case 'completed':
                    color = 'green';
                    break;
                default:
                    color = 'default';
            }
            return <Tag color={color}>{status}</Tag>;
        },
    },
    {
        title: 'Booked At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (date: string) => formatDateTime(date),
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        defaultSortOrder: 'descend',
    },
];