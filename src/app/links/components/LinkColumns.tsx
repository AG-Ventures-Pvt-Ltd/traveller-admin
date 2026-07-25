import React from 'react';
import { Tag, Space, Tooltip, Button, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Link, REDIRECT_BASE_URL } from '../constants';
import { formatDate } from '@/common/utils/date';

const { Text } = Typography;

export const getLinkColumns = (
    onEdit: (link: Link) => void,
    onToggle: (link: Link) => void,
): ColumnsType<Link> => [
    {
        title: 'Short Code',
        dataIndex: 'shortCode',
        key: 'shortCode',
        render: (shortCode: string) => (
            <Tooltip title={`Copy ${REDIRECT_BASE_URL}${shortCode}`}>
                <Text
                    copyable={{ text: `${REDIRECT_BASE_URL}${shortCode}` }}
                    style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1890ff' }}
                >
                    {shortCode}
                </Text>
            </Tooltip>
        ),
        width: 160,
    },
    {
        title: 'Destination URL',
        dataIndex: 'destinationUrl',
        key: 'destinationUrl',
        ellipsis: true,
        render: (url: string) => (
            <Tooltip title={url}>
                <Text copyable={{ text: url }} style={{ maxWidth: 260, display: 'inline-block' }} ellipsis>
                    {url}
                </Text>
            </Tooltip>
        ),
    },
    {
        title: 'Label',
        dataIndex: 'label',
        key: 'label',
        ellipsis: true,
        width: 180,
        render: (label: string) => label || <span style={{ color: '#8c8c8c' }}>—</span>,
    },
    {
        title: 'Clicks',
        dataIndex: 'clickCount',
        key: 'clickCount',
        sorter: (a, b) => a.clickCount - b.clickCount,
        defaultSortOrder: 'descend',
        width: 100,
    },
    {
        title: 'Status',
        key: 'status',
        render: (_, record: Link) => (
            <Tag color={record.isActive ? 'success' : 'error'}>{record.isActive ? 'Active' : 'Inactive'}</Tag>
        ),
        width: 100,
    },
    {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => formatDate(date),
        width: 120,
    },
    {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 100,
        render: (_, record) => (
            <Space>
                <Tooltip title="Edit">
                    <Button
                        type="text"
                        size="small"
                        icon={<Edit2 size={14} />}
                        onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                    />
                </Tooltip>
                <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                    <Button
                        type="text"
                        size="small"
                        icon={record.isActive ? <ToggleLeft size={14} color="#ff4d4f" /> : <ToggleRight size={14} color="#52c41a" />}
                        onClick={(e) => { e.stopPropagation(); onToggle(record); }}
                    />
                </Tooltip>
            </Space>
        ),
    },
];
