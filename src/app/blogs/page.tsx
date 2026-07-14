'use client';

import { useState } from 'react';
import {
  Card, Typography, Table, Tag, Button, Space, Input, Select,
  Modal, message, Tooltip, ConfigProvider, theme, Switch, Tabs,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined,
  SearchOutlined, BookOutlined,
} from '@ant-design/icons';
import { useGetData } from '@/services/useGetData';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import TopicApprovalBoard from './components/TopicApprovalBoard';

const { Title, Text } = Typography;

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorType: string;
  isPublished: boolean;
  isVisible: boolean;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogsResponse {
  data: { data: Blog[]; totalItems: number };
}

export default function BlogsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const params: Record<string, unknown> = {
    page,
    limit,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(searchText && { search: searchText }),
  };

  const { data: blogsResponse, isLoading, refetch } = useGetData({
    key: ['blogs'],
    url: api.getBlogs,
    params,
  });

  const payload = (blogsResponse as BlogsResponse | undefined)?.data;
  const blogs: Blog[] = payload?.data || [];
  const total = payload?.totalItems || 0;

  const handleToggleVisibility = async (blog: Blog) => {
    try {
      await baseAPI.patch(api.toggleBlogVisibility(blog._id));
      message.success(`Blog ${blog.isVisible ? 'hidden' : 'shown'}`);
      refetch();
    } catch {
      message.error('Failed to update visibility');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await baseAPI.patch(api.toggleBlogPublish(blog._id));
      message.success(`Blog ${blog.isPublished ? 'unpublished' : 'published'}`);
      refetch();
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await baseAPI.delete(api.deleteBlog(deleteTarget._id));
      message.success('Blog deleted');
      setDeleteTarget(null);
      refetch();
    } catch {
      message.error('Failed to delete blog');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (text: string, record: Blog) => (
        <div>
          <Text className="!text-white font-medium block">{text}</Text>
          <Text className="!text-gray-400 text-xs">{record.category} · {record.readTime} min read</Text>
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName',
      render: (text: string, record: Blog) => (
        <div>
          <Text className="!text-gray-300 text-sm">{text || '—'}</Text>
          <Tag color={record.authorType === 'admin' ? 'blue' : 'green'} className="ml-1 text-xs">
            {record.authorType}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: Blog) => (
        <Space direction="vertical" size={4}>
          <Tag color={record.isPublished ? 'green' : 'orange'}>
            {record.isPublished ? 'Published' : 'Draft'}
          </Tag>
          {!record.isVisible && <Tag color="red">Hidden</Tag>}
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text className="!text-gray-400 text-sm">{dayjs(date).format('DD MMM YYYY')}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Blog) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="!text-blue-400"
              onClick={() => router.push(`/blogs/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title={record.isPublished ? 'Unpublish' : 'Publish'}>
            <Switch
              size="small"
              checked={record.isPublished}
              onChange={() => handleTogglePublish(record)}
            />
          </Tooltip>
          <Tooltip title={record.isVisible ? 'Hide' : 'Show'}>
            <Button
              type="text"
              icon={record.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              className={record.isVisible ? '!text-gray-400' : '!text-red-400'}
              onClick={() => handleToggleVisibility(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="!text-red-400"
              onClick={() => setDeleteTarget(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOutlined className="text-blue-400 text-xl" />
          <Title level={4} className="!text-white !m-0">Blogs</Title>
        </div>

        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'All Blogs',
              children: (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Tag color="blue">{total} total</Tag>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => router.push('/blogs/new')}
                    >
                      New Blog
                    </Button>
                  </div>

                  {/* Filters */}
                  <Card className="!bg-white/5 !border-white/10">
                    <div className="flex gap-3 flex-wrap">
                      <Input
                        placeholder="Search blogs..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                        className="max-w-xs"
                        allowClear
                      />
                      <Select
                        value={statusFilter}
                        onChange={(v) => { setStatusFilter(v); setPage(1); }}
                        className="w-36"
                        options={[
                          { label: 'All', value: 'all' },
                          { label: 'Published', value: 'published' },
                          { label: 'Draft', value: 'draft' },
                        ]}
                      />
                      <Button onClick={() => { setSearchText(''); setStatusFilter('all'); setPage(1); }}>
                        Reset
                      </Button>
                    </div>
                  </Card>

                  {/* Table */}
                  <Card className="!bg-white/5 !border-white/10">
                    <Table
                      dataSource={blogs}
                      columns={columns}
                      loading={isLoading}
                      rowKey="_id"
                      pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        onChange: setPage,
                        showSizeChanger: false,
                        showTotal: (t) => `${t} blogs`,
                      }}
                      className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead_th]:!bg-white/10 [&_.ant-table-row]:!bg-transparent [&_.ant-table-row:hover_td]:!bg-white/5"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'topics',
              label: 'Topic Approvals',
              children: <TopicApprovalBoard />,
            },
          ]}
        />
      </div>

      <Modal
        title="Delete Blog"
        open={!!deleteTarget}
        onOk={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.</p>
      </Modal>
    </ConfigProvider>
  );
}
