'use client';

import { Space, Avatar, Tag, Button, Tooltip } from 'antd';
import { MapPin, Star, CheckCircle } from 'lucide-react';
import type { TableProps } from 'antd';
import { formatDate } from '../utils';
import { Trip } from '../constant';

const STATUS_COLORS: Record<string, string> = {
    in_review: 'orange',
    published: 'green',
    archived: 'default',
};

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'green',
    moderate: 'gold',
    challenging: 'red',
};

interface ColumnOptions {
    handlePublish: (trip: Trip) => void;
}

export const columns = ({ handlePublish }: ColumnOptions): TableProps<Trip>['columns'] => [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        ellipsis: true,
        render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        width: 190,
        render: (location: Trip['location']) => {
            const coords = location?.coordinates;
            const isLinked = !!(coords?.length && !(coords[0] === 0 && coords[1] === 0));
            return (
                <Space direction="vertical" size={2}>
                    <Space>
                        <MapPin size={14} />
                        <span>{[location?.city, location?.country].filter(Boolean).join(', ') || '—'}</span>
                    </Space>
                    <Tag color={isLinked ? 'green' : 'red'} style={{ fontSize: 10, lineHeight: '16px', marginInlineEnd: 0 }}>
                        {isLinked ? 'Linked' : 'Not Linked'}
                    </Tag>
                </Space>
            );
        },
    },
    {
        title: 'Host',
        dataIndex: 'host',
        key: 'host',
        width: 150,
        render: (host: Trip['host']) => host ? (
            <Space>
                <Avatar src={host.avatar} size={28} style={{ backgroundColor: '#1890ff' }}>
                    {host.fullName?.[0]}
                </Avatar>
                <Tooltip title={host.email}>
                    <span>{host.fullName || host.username}</span>
                </Tooltip>
            </Space>
        ) : '—',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (status: string) => (
            <Tag color={STATUS_COLORS[status] || 'default'}>
                {status?.replace('_', ' ').toUpperCase()}
            </Tag>
        ),
        filters: [
            { text: 'In Review', value: 'in_review' },
            { text: 'Published', value: 'published' },
            { text: 'Archived', value: 'archived' },
        ],
        onFilter: (value, record) => record.status === value,
    },
    {
        title: 'Admin Review',
        dataIndex: 'hasAdminReview',
        key: 'hasAdminReview',
        width: 120,
        render: (has: boolean) => (
            <Tag color={has ? 'green' : 'red'}>{has ? 'Yes' : 'No'}</Tag>
        ),
        filters: [
            { text: 'Yes', value: true },
            { text: 'No', value: false },
        ],
        onFilter: (value, record) => !!record.hasAdminReview === value,
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (type: string) => type ? (
            <Tag>{type.replace('_', ' ')}</Tag>
        ) : '—',
    },
    {
        title: 'Difficulty',
        dataIndex: 'difficulty',
        key: 'difficulty',
        width: 110,
        render: (d: string) => d ? (
            <Tag color={DIFFICULTY_COLORS[d] || 'default'}>{d.toUpperCase()}</Tag>
        ) : '—',
    },
    {
        title: 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        width: 90,
        render: (rating: number) => (
            <Space>
                <Star size={14} style={{ color: '#faad14' }} />
                <span>{rating?.toFixed(1) ?? '0.0'}</span>
            </Space>
        ),
        sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
    },
    {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 110,
        render: (date: string) => formatDate(date),
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 110,
        render: (_, record) =>
            record.status === 'in_review' ? (
                <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircle size={14} />}
                    onClick={(e) => { e.stopPropagation(); handlePublish(record); }}
                >
                    Publish
                </Button>
            ) : null,
    },
];
