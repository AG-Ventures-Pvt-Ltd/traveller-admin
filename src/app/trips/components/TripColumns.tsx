import { Space, Tooltip, Avatar, Badge, Button } from 'antd';
import { Info, Calendar, MapPin, Trash2 } from 'lucide-react';
import type { TableProps } from 'antd';
import { formatDate, formatCurrency } from '../utils';
import { Trip, Host } from '../constant';

export const columns = (handleDeleteTrip: (trip: Trip) => void): TableProps<Trip>['columns'] => [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 180,
        render: (text: string) => (
            <Space>
                <Info size={16} style={{ color: '#1890ff' }} />
                <span style={{ fontWeight: 500 }}>{text}</span>
            </Space>
        )
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 220,
        ellipsis: true,
        render: (desc: string) => (
            <Tooltip title={desc}><span>{desc.slice(0, 50)}{desc.length > 50 ? '...' : ''}</span></Tooltip>
        )
    },
    {
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 120,
        render: (date: string) => (
            <Space><Calendar size={14} />{formatDate(date)}</Space>
        ),
        sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    },
    {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 120,
        render: (date: string) => (
            <Space><Calendar size={14} />{formatDate(date)}</Space>
        ),
        sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: 180,
        render: (address: string) => (
            <Space><MapPin size={14} />{address}</Space>
        )
    },
    {
        title: 'Host',
        dataIndex: 'host',
        key: 'host',
        width: 140,
        render: (host: Host) => (
            <Space>
                <Avatar src={host.avatar} size={32} style={{ backgroundColor: '#1890ff' }}>{host.name[0]}</Avatar>
                <span>{host.name}</span>
            </Space>
        )
    },
    {
        title: 'Completed',
        dataIndex: 'isCompleted',
        key: 'isCompleted',
        width: 105,
        render: (isCompleted: boolean) => (
            <Badge status={isCompleted ? 'success' : 'default'} text={isCompleted ? 'Yes' : 'No'} />
        ),
        filters: [
            { text: 'Completed', value: 'true' },
            { text: 'Not Completed', value: 'false' }
        ],
        onFilter: (value, record) => String(record.isCompleted) === value
    },
    {
        title: 'Max Capacity',
        dataIndex: 'maxCapacity',
        key: 'maxCapacity',
        width: 90,
        align: 'center',
        sorter: (a, b) => a.maxCapacity - b.maxCapacity
    },
    {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 90,
        render: (price: number) => (
            <Space>{formatCurrency(price)}</Space>
        ),
        sorter: (a, b) => a.price - b.price
    },
    {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 80,
        render: (_, record) => (
            <Button type="text" icon={<Trash2 size={16} />} danger onClick={() => handleDeleteTrip(record)} />
        )
    }
];