'use client';

import { useState } from 'react';
import {
  Card, Typography, Form, Input, Button, Switch, Select, Space,
  ConfigProvider, theme, message, Tabs, Tag,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import { sanitizeHtml } from '@/common/utils/sanitizeHtml';
import ImageInput from '@/common/ui/ImageInput';
import RelatedTripsField from '../components/RelatedTripsField';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CATEGORIES = [
  'Travel Tips', 'Destination Guide', 'Adventure', 'Budget Travel',
  'Solo Travel', 'Group Travel', 'Culture', 'Food & Cuisine', 'General',
];

export default function NewBlogPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState('write');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSave = async (publish: boolean) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await baseAPI.post(api.createBlog, {
        ...values,
        content,
        tags,
        isPublished: publish,
      });

      message.success(publish ? 'Blog published!' : 'Draft saved!');
      router.push('/blogs');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

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
            <Title level={4} className="!text-white !m-0">New Blog Post</Title>
          </div>
          <Space>
            <Button
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => handleSave(false)}
            >
              Save Draft
            </Button>
            <Button
              type="primary"
              loading={saving}
              onClick={() => handleSave(true)}
            >
              Publish
            </Button>
          </Space>
        </div>

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
                  <Input placeholder="Enter blog title..." size="large" className="!bg-white/10 !border-white/20 !text-white" />
                </Form.Item>

                <Form.Item
                  name="excerpt"
                  label={<span className="text-gray-300">Excerpt <span className="text-gray-500 text-xs">(shown in cards & SEO description)</span></span>}
                  rules={[{ max: 320 }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Short summary of the post (max 320 chars)..."
                    maxLength={320}
                    showCount
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
              </Form>

              {/* Content editor */}
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
                      placeholder="Write your blog content here. You can use HTML for formatting: <h2>, <p>, <ul>, <li>, <strong>, <em>, <a href='...'>, <img src='...'> etc."
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
            {/* Publish settings */}
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Publish Settings</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="isVisible" initialValue={true} label={<span className="text-gray-300 text-sm">Visible on site</span>}>
                  <Switch defaultChecked />
                </Form.Item>
              </Form>
            </Card>

            {/* Category & Tags */}
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Category & Tags</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="category" initialValue="General" label={<span className="text-gray-300 text-sm">Category</span>}>
                  <Select
                    options={CATEGORIES.map((c) => ({ label: c, value: c }))}
                    className="w-full"
                  />
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

            {/* Related Trips */}
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Related Trips</span>}>
              <Form form={form} layout="vertical">
                <RelatedTripsField />
              </Form>
            </Card>

            {/* Author */}
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">Author</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="authorName" label={<span className="text-gray-300 text-sm">Author Name</span>}>
                  <Input
                    placeholder="e.g. Shreyansh Agrawal"
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
                <Form.Item name="authorRole" initialValue="Wondrr Team" label={<span className="text-gray-300 text-sm">Author Role</span>}>
                  <Input
                    placeholder="e.g. Co-founder, Wondrr"
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
              </Form>
            </Card>

            {/* SEO */}
            <Card className="!bg-white/5 !border-white/10" title={<span className="text-gray-300">SEO Overrides</span>}>
              <Form form={form} layout="vertical">
                <Form.Item name="metaTitle" label={<span className="text-gray-300 text-sm">Meta Title <span className="text-gray-500">(max 70)</span></span>}>
                  <Input
                    maxLength={70}
                    showCount
                    placeholder="Falls back to title if empty"
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
                <Form.Item name="metaDescription" label={<span className="text-gray-300 text-sm">Meta Description <span className="text-gray-500">(max 160)</span></span>}>
                  <TextArea
                    rows={3}
                    maxLength={160}
                    showCount
                    placeholder="Falls back to excerpt if empty"
                    className="!bg-white/10 !border-white/20 !text-white"
                  />
                </Form.Item>
                <Form.Item name="coverImage" label={<span className="text-gray-300 text-sm">Cover Image</span>}>
                  <ImageInput text="Upload cover image" />
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
