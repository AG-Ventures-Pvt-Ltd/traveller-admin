'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card, Typography, Tag, Button, Space, Input, Select, Modal,
  Form, message, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, SettingOutlined, CheckOutlined,
  CloseOutlined, UndoOutlined, AimOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// GAS Web App is a separate backend (Google Sheet), not our own API — talked
// to directly via fetch, not baseAPI, so no auth header / baseURL is applied.
const STORAGE_KEY = 'blog_topics_gas_url';
const DEFAULT_URL = process.env.NEXT_PUBLIC_BLOG_TOPICS_GAS_URL || '';

type TopicStatus = 'pending' | 'approved' | 'rejected';
type TopicType = 'new' | 'edit';

interface Topic {
  id: string;
  title: string;
  target_keyword?: string;
  type?: TopicType;
  intent?: string;
  opportunity_score?: string | number;
  internal_links?: string;
  competitor_notes?: string;
  reviewer_notes?: string;
  status?: TopicStatus;
  drafted?: boolean | string;
  published?: boolean | string;
  created_at?: string;
}

const STATUS_TABS: { key: TopicStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const TYPE_TABS: { key: TopicType | 'all'; label: string }[] = [
  { key: 'all', label: 'Any type' },
  { key: 'new', label: 'New blog' },
  { key: 'edit', label: 'Edit' },
];

const isTrue = (v: unknown) => v === true || v === 'TRUE';

const statusColor = (s: string) =>
  s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'gold';

export default function TopicApprovalBoard() {
  const [apiUrl, setApiUrl] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || DEFAULT_URL : DEFAULT_URL),
  );
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<TopicType | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [form] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const load = useCallback(async () => {
    if (!apiUrl) return;
    setLoading(true);
    setErrored(false);
    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const d = await res.json();
      const sorted = ((d.topics || []) as Topic[]).sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
      );
      setTopics(sorted);
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const apiPost = (payload: Record<string, unknown>) =>
    // text/plain avoids a CORS preflight against Apps Script
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    }).then((r) => r.json());

  const setStatus = async (id: string, status: TopicStatus) => {
    try {
      await apiPost({ action: 'status', id, status });
      setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      message.success(`Marked ${status}`);
    } catch {
      message.error('Failed — check connection');
    }
  };

  const submitAdd = async (values: Record<string, string>) => {
    try {
      await apiPost({ action: 'add', ...values, status: 'pending' });
      message.success('Topic added');
      setAddOpen(false);
      form.resetFields();
      load();
    } catch {
      message.error('Failed — check connection');
    }
  };

  const openSettings = () => {
    settingsForm.setFieldsValue({ url: apiUrl });
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    const values = await settingsForm.validateFields();
    const url = values.url.trim();
    localStorage.setItem(STORAGE_KEY, url);
    setApiUrl(url);
    setSettingsOpen(false);
    message.success('Saved');
  };

  const count = (s: TopicStatus) => topics.filter((t) => t.status === s).length;
  const stats = [
    { n: topics.length, l: 'Total' },
    { n: count('pending'), l: 'Pending' },
    { n: count('approved'), l: 'Approved' },
    { n: count('rejected'), l: 'Rejected' },
    { n: topics.filter((t) => isTrue(t.drafted)).length, l: 'Drafted' },
    { n: topics.filter((t) => isTrue(t.published)).length, l: 'Published' },
  ];

  const list = topics.filter(
    (t) =>
      (statusFilter === 'all' || (t.status || 'pending') === statusFilter) &&
      (typeFilter === 'all' || t.type === typeFilter),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Text className="!text-gray-400 text-sm">
          Agent proposes → you decide → agent drafts approved topics only.
        </Text>
        <Space>
          <Button icon={<SettingOutlined />} onClick={openSettings}>Settings</Button>
          <Button icon={<ReloadOutlined />} onClick={load} disabled={!apiUrl}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)} disabled={!apiUrl}>
            Add topic
          </Button>
        </Space>
      </div>

      {!apiUrl ? (
        <Card className="!bg-white/5 !border-white/10">
          <Empty description={
            <span className="text-gray-400">
              No backend connected yet. Open <b>Settings</b> and paste the Google Apps Script Web App URL.
            </span>
          } />
        </Card>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap">
            {stats.map((s) => (
              <Card key={s.l} className="!bg-white/5 !border-white/10" styles={{ body: { padding: '12px 16px', minWidth: 96 } }}>
                <div className="text-xl font-bold !text-white">{s.n}</div>
                <div className="text-[11px] uppercase tracking-wide !text-gray-400">{s.l}</div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-36"
              options={STATUS_TABS.map((t) => ({ label: t.label, value: t.key }))}
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-36"
              options={TYPE_TABS.map((t) => ({ label: t.label, value: t.key }))}
            />
          </div>

          <Spin spinning={loading}>
            {errored ? (
              <Card className="!bg-white/5 !border-white/10">
                <Empty description={
                  <span className="text-gray-400">
                    Could not reach the backend. Check the URL in Settings and that the web app is deployed to &quot;Anyone&quot;.
                  </span>
                } />
              </Card>
            ) : !list.length ? (
              <Card className="!bg-white/5 !border-white/10">
                <Empty description="Nothing here yet" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {list.map((t) => {
                  const status = t.status || 'pending';
                  const links = String(t.internal_links || '').split(',').map((s) => s.trim()).filter(Boolean);
                  return (
                    <Card key={t.id} className="!bg-white/5 !border-white/10">
                      <div className="flex justify-between gap-3 items-start">
                        <div>
                          <Title level={5} className="!text-white !m-0">{t.title}</Title>
                          <Text className="!text-blue-400 text-xs flex items-center gap-1 mt-1">
                            <AimOutlined /> {t.target_keyword || '—'}
                          </Text>
                        </div>
                        <Tag color={statusColor(status)}>{status}</Tag>
                      </div>

                      <div className="flex gap-2 flex-wrap mt-2">
                        <Tag color={t.type === 'edit' ? 'purple' : 'blue'}>{t.type === 'edit' ? 'Edit' : 'New blog'}</Tag>
                        {t.opportunity_score !== '' && t.opportunity_score != null && (
                          <Tag>Opp {t.opportunity_score}</Tag>
                        )}
                        {t.intent && <Tag>{t.intent}</Tag>}
                        {isTrue(t.drafted) && <Tag color="cyan">drafted</Tag>}
                        {isTrue(t.published) && <Tag color="green">published</Tag>}
                      </div>

                      {t.competitor_notes && (
                        <Text className="!text-gray-400 text-sm block mt-2">
                          <b className="!text-gray-200">Angle:</b> {t.competitor_notes}
                        </Text>
                      )}
                      {!!links.length && (
                        <Text className="!text-gray-400 text-xs block mt-1">
                          🔗 links to {links.map((l) => (
                            <code key={l} className="bg-white/10 px-1.5 py-0.5 rounded text-green-400 mr-1">{l}</code>
                          ))}
                        </Text>
                      )}
                      {t.reviewer_notes && (
                        <Text className="!text-gray-400 text-sm block mt-1">
                          <b className="!text-gray-200">Note:</b> {t.reviewer_notes}
                        </Text>
                      )}

                      <Space className="mt-3">
                        {status !== 'approved' && (
                          <Button size="small" icon={<CheckOutlined />} className="!bg-green-600 !text-white !border-none"
                            onClick={() => setStatus(t.id, 'approved')}>
                            Approve
                          </Button>
                        )}
                        {status !== 'rejected' && (
                          <Button size="small" danger icon={<CloseOutlined />} onClick={() => setStatus(t.id, 'rejected')}>
                            Reject
                          </Button>
                        )}
                        {status !== 'pending' && (
                          <Button size="small" icon={<UndoOutlined />} onClick={() => setStatus(t.id, 'pending')}>
                            Reset
                          </Button>
                        )}
                      </Space>
                    </Card>
                  );
                })}
              </div>
            )}
          </Spin>
        </>
      )}

      <Modal
        title="Add a topic"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText="Add topic"
      >
        <Form form={form} layout="vertical" onFinish={submitAdd}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title required' }]}>
            <Input placeholder="e.g. Best 5-day Ladakh road-trip itinerary" />
          </Form.Item>
          <Space.Compact className="w-full">
            <Form.Item name="target_keyword" label="Target keyword" className="w-1/2" style={{ marginRight: 8 }}>
              <Input placeholder="ladakh road trip itinerary" />
            </Form.Item>
            <Form.Item name="type" label="Type" initialValue="new" className="w-1/2">
              <Select options={[{ label: 'New blog', value: 'new' }, { label: 'Edit existing', value: 'edit' }]} />
            </Form.Item>
          </Space.Compact>
          <Space.Compact className="w-full">
            <Form.Item name="intent" label="Search intent" className="w-1/2" style={{ marginRight: 8 }}>
              <Input placeholder="informational / commercial" />
            </Form.Item>
            <Form.Item name="opportunity_score" label="Opportunity score" className="w-1/2">
              <Input placeholder="0-100" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="internal_links" label="Internal links (trips / partners)">
            <Input placeholder="/trips/ladakh-bike, /partners/xyz" />
          </Form.Item>
          <Form.Item name="competitor_notes" label="Notes / competitor angle">
            <TextArea rows={3} placeholder="What angle beats the current top results?" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Settings"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={saveSettings}
        okText="Save"
      >
        <Form form={settingsForm} layout="vertical">
          <Form.Item
            name="url"
            label="Google Apps Script Web App URL"
            rules={[{ required: true, message: 'URL required' }]}
            help="Paste the deploy URL from the blog topics Google Sheet's Apps Script. Saved in this browser."
          >
            <Input placeholder="https://script.google.com/macros/s/..../exec" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
