'use client';

import { useState, useEffect } from 'react';
import {
  Card, Typography, Form, Input, Button, Switch, Select, Space,
  ConfigProvider, theme, message, Tabs, Tag, Spin, Alert,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import { sanitizeHtml } from '@/common/utils/sanitizeHtml';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CATEGORIES = [
  'Travel Tips', 'Destination Guide', 'Adventure', 'Budget Travel',
  'Solo Travel', 'Group Travel', 'Culture', 'Food & Cuisine', 'General',
];

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  isVisible: boolean;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form] = Form.useForm();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState('write');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await baseAPI.get(api.getBlogById(id));
        const b: Blog = (data as { data: { blog: Blog } }).data.blog;
        setBlog(b);
        setContent(b.content || '');
        setTags(b.tags || []);
        form.setFieldsValue({
          title: b.title,
          excerpt: b.excerpt,
          category: b.category || 'General',
          authorName: b.authorName,
          authorRole: b.authorRole || 'Wondrr Team',
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          coverImage: b.coverImage,
          isVisible: b.isVisible,
        });
      } catch {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, form]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSave = async (publish?: boolean) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: Record<string, unknown> = { ...values, content, tags };
      if (publish !== undefined) payload.isPublished = publish;

      await baseAPI.patch(api.updateBlog(id), payload);
      message.success('Blog updated!');
      router.push('/blogs');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    try {
      await baseAPI.delete(api.deleteBlog(id));
      message.success('Blog deleted');
      router.push('/blogs');
    } catch {
      message.error('Failed to delete blog');
    }
  };

  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  if (loading) return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
    </ConfigProvider>
  );

  if (error) return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Alert type="error" message={error} className="m-4" />
    </ConfigProvider>
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="p-4 flex flex-col gap-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/blogs')}
              className="!text-gray-400"
            />
            <div>
              <Title level={4} className="!text-white !m-0">Edit Blog</Title>
              {blog && (
                <Text className="!text-gray-500 text-xs">
                  Last updated {dayjs(blog.updatedAt).format('DD MMM YYYY HH:mm')} · /blog/{blog.slug}
                </Text>
              )}
            </div>
          </div>
          <Space>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              {deleteConfirm ? 'Confirm Delete' : 'Delete'}
            </Button>
            {deleteConfirm && (
              <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            )}
            <Button icon={<SaveOutlined />} loading={saving} onClick={() => handleSave()}>
              Save
            </Button>
            {blog && (
              <Button type="primary" loading={saving} onClick={() => handleSave(!blog.isPublished)}>
                {blog.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            )}
          </Space>
        </div>

        {blog && !blog.isPublished && (
          <Alert
            type="warning"
            message="This blog is a draft — not visible on the public site yet."
            showIcon
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main content */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <Card className="!bg-white/5 !border-white/10">
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label={<span className="text-gray-300">Title</span>}
                  rules={[{ required: true, message: 'Title required' }, { max: 120 }]}
                >
                  <Input size="large" className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>

                <Form.Item
                  name="excerpt"
                  label={<span className="text-gray-300">Excerpt</span>}
                  rules={[{ max: 320 }]}
                >
                  <TextArea
                    rows={3}
                    maxLength={320}
                    showCount
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
              </Form>

              <div className="mt-2">
                <Tabs
                  activeKey={previewTab}
                  onChange={setPreviewTab}
                  items={[
                    { key: 'write', label: 'Write (HTML)' },
                    { key: 'preview', label: 'Preview' },
                  ]}
                />
                {previewTab === 'write' ? (
                  <div>
                    <TextArea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      autoSize={{ minRows: 18, maxRows: 40 }}
                      className="!bg-white/10 !border-white/20 !text-white font-mono text-sm"
                    />
                    <Text className="!text-gray-500 text-xs mt-1 block">
                      {wordCount} words · ~{readTime} min read
                    </Text>
                  </div>
                ) : (
                  <div
                    className="prose prose-invert max-w-none min-h-[300px] p-4 bg-white/5 rounded-lg border border-white/10 text-gray-200"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) || '<p class="text-gray-500">Nothing to preview yet...</p>' }}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar settings */}
          <div className="flex flex-col gap-4">
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Publish Settings</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="isVisible" label={<span className="text-gray-300 text-sm">Visible on site</span>} valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Form>
            </Card>

            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Category & Tags</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="category" label={<span className="text-gray-300 text-sm">Category</span>}>
                  <Select options={CATEGORIES.map((c) => ({ label: c, value: c }))} className="w-full" />
                </Form.Item>
              </Form>
              <div className="mt-2">
                <Text className="text-gray-400 text-sm block mb-2">Tags</Text>
                <div className="flex gap-2 flex-wrap mb-2">
                  {tags.map((t) => (
                    <Tag key={t} closable onClose={() => removeTag(t)} color="blue">{t}</Tag>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    size="small"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={addTag}
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                  <Button size="small" icon={<PlusOutlined />} onClick={addTag} />
                </div>
              </div>
            </Card>

            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Author</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="authorName" label={<span className="text-gray-300 text-sm">Author Name</span>}>
                  <Input className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>
                <Form.Item name="authorRole" label={<span className="text-gray-300 text-sm">Author Role</span>}>
                  <Input className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>
              </Form>
            </Card>

            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">SEO Overrides</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="metaTitle" label={<span className="text-gray-300 text-sm">Meta Title</span>}>
                  <Input maxLength={70} showCount className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>
                <Form.Item name="metaDescription" label={<span className="text-gray-300 text-sm">Meta Description</span>}>
                  <TextArea rows={3} maxLength={160} showCount className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>
                <Form.Item name="coverImage" label={<span className="text-gray-300 text-sm">Cover Image URL</span>}>
                  <Input placeholder="https://..." className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
