'use client';

import React, { useState, useMemo } from 'react';
import {
  Row, Col, Card, Statistic, Skeleton, Typography, Divider, DatePicker, ConfigProvider, theme, Table, Tag, Space, Button
} from 'antd';
import { Eye, TrendingUp, Instagram, Youtube } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrafficData {
  totalViews: number;
  bySource: Record<string, number>;
  topTrips: { slug: string; title: string; views: number }[];
}

interface ApiTrafficResponse {
  data: TrafficData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  google: '#4285f4',
  direct: '#52c41a',
  youtube: '#ff0000',
  whatsapp: '#25d366',
  x: '#1da1f2',
  others: '#8c8c8c',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  google: 'Google',
  direct: 'Direct',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  x: 'X / Twitter',
  others: 'Others',
};

type Preset = 'today' | '15d' | '30d' | 'custom';

const toISO = (d: Dayjs) => d.format('YYYY-MM-DD');

// ─── Component ────────────────────────────────────────────────────────────────

export default function TripAnalyticsPage() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [customSingle, setCustomSingle] = useState<Dayjs | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const today = dayjs();
    if (preset === 'today') return { startDate: toISO(today), endDate: toISO(today) };
    if (preset === '15d') return { startDate: toISO(today.subtract(14, 'day')), endDate: toISO(today) };
    if (preset === '30d') return { startDate: toISO(today.subtract(29, 'day')), endDate: toISO(today) };
    if (preset === 'custom') {
      if (customRange) return { startDate: toISO(customRange[0]), endDate: toISO(customRange[1]) };
      if (customSingle) return { startDate: toISO(customSingle), endDate: toISO(customSingle) };
    }
    return { startDate: toISO(today.subtract(29, 'day')), endDate: toISO(today) };
  }, [preset, customRange, customSingle]);

  const { data: response, isLoading } = useGetData({
    key: ['trip-analytics-traffic'],
    url: api.getTripAnalyticsTraffic,
    params: { startDate, endDate },
  });

  const traffic = (response as ApiTrafficResponse)?.data;

  const chartData = useMemo(() => {
    if (!traffic?.bySource) return [];
    return Object.entries(traffic.bySource)
      .map(([source, count]) => ({ source: PLATFORM_LABELS[source] || source, count, key: source }))
      .sort((a, b) => b.count - a.count);
  }, [traffic]);

  const topTripsColumns = [
    { title: '#', dataIndex: 'rank', key: 'rank', width: 50, render: (_: unknown, __: unknown, i: number) => i + 1 },
    { title: 'Trip', dataIndex: 'title', key: 'title', render: (t: string, r: { slug: string }) => (
      <a href={`https://wondrr.in/trip/${r.slug}`} target="_blank" rel="noreferrer" style={{ color: '#1890ff' }}>{t}</a>
    )},
    { title: 'Views', dataIndex: 'views', key: 'views', width: 100, render: (v: number) => (
      <Tag color="blue">{v.toLocaleString()}</Tag>
    )},
  ];

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
  };

  const presets: { key: Preset; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '15d', label: 'Last 15 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#1890ff' } }}>
      <div>
        <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>Trip Analytics</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Platform-wise view tracking across all trips
        </Text>

        {/* Date filter */}
        <Card style={{ ...cardStyle, marginBottom: 20 }} styles={{ body: { padding: '16px 20px' } }}>
          <Space wrap>
            {presets.map(p => (
              <Button
                key={p.key}
                type={preset === p.key ? 'primary' : 'default'}
                size="small"
                onClick={() => setPreset(p.key)}
              >
                {p.label}
              </Button>
            ))}
            {preset === 'custom' && (
              <Space>
                <DatePicker
                  placeholder="Single date"
                  onChange={(d) => { setCustomSingle(d); setCustomRange(null); }}
                  style={{ width: 140 }}
                />
                <RangePicker
                  placeholder={['Start', 'End']}
                  onChange={(r) => { setCustomRange(r as [Dayjs, Dayjs] | null); setCustomSingle(null); }}
                  style={{ width: 240 }}
                />
              </Space>
            )}
          </Space>
          <Text type="secondary" style={{ marginLeft: 16, fontSize: 12 }}>
            {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
          </Text>
        </Card>

        {/* Total views */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Card style={{ ...cardStyle, background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24,144,255,0.25)' }} styles={{ body: { padding: '20px 24px' } }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  {isLoading ? <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} /> : (
                    <Statistic
                      title={<span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>Total Views</span>}
                      value={traffic?.totalViews ?? 0}
                      styles={{ content: { color: '#1890ff', fontSize: 28, fontWeight: 700 } }}
                    />
                  )}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(24,144,255,0.1)', border: '1px solid rgba(24,144,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                  <Eye size={22} color="#1890ff" />
                </div>
              </div>
            </Card>
          </Col>

          {/* Per-platform quick stats */}
          {['instagram', 'google', 'direct', 'youtube'].map(platform => (
            <Col key={platform} xs={12} sm={4}>
              <Card style={cardStyle} styles={{ body: { padding: '16px' } }}>
                {isLoading ? <Skeleton active paragraph={{ rows: 0 }} title={{ width: '70%' }} /> : (
                  <Statistic
                    title={<span style={{ color: '#8c8c8c', fontSize: 12 }}>{PLATFORM_LABELS[platform]}</span>}
                    value={traffic?.bySource?.[platform] ?? 0}
                    styles={{ content: { color: PLATFORM_COLORS[platform], fontSize: 20, fontWeight: 700 } }}
                  />
                )}
              </Card>
            </Col>
          ))}
        </Row>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0 20px' }} />

        <Row gutter={[20, 20]}>
          {/* Bar chart */}
          <Col xs={24} lg={14}>
            <Card
              title={<span style={{ color: '#fff' }}><TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Views by Platform</span>}
              style={cardStyle}
              styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff' }, body: { padding: '16px 20px' } }}
            >
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>No data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="source" tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                    <RechartTooltip
                      contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#8c8c8c' }}
                    />
                    <Bar dataKey="count" name="Views" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={PLATFORM_COLORS[entry.key] || '#8c8c8c'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>

          {/* Top trips */}
          <Col xs={24} lg={10}>
            <Card
              title={<span style={{ color: '#fff' }}><Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Top Trips</span>}
              style={cardStyle}
              styles={{ header: { borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff' }, body: { padding: '0 0 8px' } }}
            >
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} style={{ padding: '16px 20px' }} />
              ) : (
                <Table
                  dataSource={traffic?.topTrips ?? []}
                  columns={topTripsColumns}
                  rowKey="slug"
                  pagination={false}
                  size="small"
                  style={{ background: 'transparent' }}
                  locale={{ emptyText: <span style={{ color: '#8c8c8c' }}>No data</span> }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* All platform breakdown */}
        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />
        <Text style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
          All Platforms
        </Text>
        <Row gutter={[16, 16]}>
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <Col key={key} xs={12} sm={8} md={6} lg={4}>
              <Card style={{ background: `${PLATFORM_COLORS[key]}18`, border: `1px solid ${PLATFORM_COLORS[key]}44`, borderRadius: 10 }} styles={{ body: { padding: '16px' } }}>
                {isLoading ? <Skeleton active paragraph={{ rows: 0 }} /> : (
                  <Statistic
                    title={<span style={{ color: '#8c8c8c', fontSize: 12 }}>{label}</span>}
                    value={traffic?.bySource?.[key] ?? 0}
                    styles={{ content: { color: PLATFORM_COLORS[key], fontSize: 22, fontWeight: 700 } }}
                  />
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </ConfigProvider>
  );
}
