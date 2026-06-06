'use client';

import React, { useState, useMemo } from 'react';
import {
  Row, Col, Card, Statistic, Skeleton, Tooltip, Typography, Divider, DatePicker, ConfigProvider, theme, Tag, Empty, Select
} from 'antd';
import {
  Activity, Clock, AlertTriangle, Zap, TrendingUp, Server
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
  date: string;
  totalRequests: number;
  avgLatencyMs: number;
  errorRate: number;
  slowestEndpoint: { route: string; method: string; maxLatencyMs: number } | null;
  peakTrafficHour: number | null;
  totalActiveEndpoints: number;
}

interface EndpointRecord {
  route: string;
  method: string;
  requestCount: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorCount: number;
  successCount: number;
  statusCodes: Record<string, number>;
  hourlyRequests: { hour: number; count: number }[];
  deviceTypes: { mobile: number; desktop: number; tablet: number; bot: number };
}

interface TrendDay {
  date: string;
  totalRequests: number;
  totalErrors: number;
  avgLatencyMs: number;
  endpointCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: '#52c41a',
  POST: '#1890ff',
  PUT: '#faad14',
  PATCH: '#722ed1',
  DELETE: '#ff4d4f',
};

const DEVICE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'];
const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#ff4d4f', '#13c2c2', '#eb2f96', '#fa8c16'];

const formatHour = (h: number) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

// ─── Summary Cards ─────────────────────────────────────────────────────────────

const CARD_CONFIGS = [
  {
    key: 'totalRequests',
    label: 'Total Requests',
    icon: Activity,
    color: '#1890ff',
    bg: 'rgba(24, 144, 255, 0.1)',
    border: 'rgba(24, 144, 255, 0.25)',
    tooltip: 'Total API requests processed on this date',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'avgLatencyMs',
    label: 'Avg API Latency',
    icon: Clock,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.25)',
    tooltip: 'Weighted average response latency across all endpoints',
    suffix: 'ms',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'errorRate',
    label: 'Error Rate',
    icon: AlertTriangle,
    color: '#ff4d4f',
    bg: 'rgba(255, 77, 79, 0.1)',
    border: 'rgba(255, 77, 79, 0.25)',
    tooltip: 'Percentage of requests that returned HTTP 4xx or 5xx',
    suffix: '%',
    format: (v: number) => v.toFixed(2),
  },
  {
    key: 'slowestEndpoint',
    label: 'Slowest Endpoint',
    icon: Zap,
    color: '#faad14',
    bg: 'rgba(250, 173, 20, 0.1)',
    border: 'rgba(250, 173, 20, 0.25)',
    tooltip: 'Endpoint with the highest maximum response time',
    isCustom: true,
  },
  {
    key: 'peakTrafficHour',
    label: 'Peak Traffic Hour',
    icon: TrendingUp,
    color: '#722ed1',
    bg: 'rgba(114, 46, 209, 0.1)',
    border: 'rgba(114, 46, 209, 0.25)',
    tooltip: 'Hour (IST) with the most API requests',
    isCustom: true,
  },
  {
    key: 'totalActiveEndpoints',
    label: 'Active Endpoints',
    icon: Server,
    color: '#13c2c2',
    bg: 'rgba(19, 194, 194, 0.1)',
    border: 'rgba(19, 194, 194, 0.25)',
    tooltip: 'Unique route+method combinations with traffic on this date (1 when endpoint selected)',
    format: (v: number) => v.toLocaleString(),
  },
] as const;

const SummaryCards = ({ summary, loading }: { summary: Summary | undefined; loading: boolean }) => (
  <Row gutter={[16, 16]}>
    {CARD_CONFIGS.map(cfg => {
      const Icon = cfg.icon;
      let content: React.ReactNode;

      if (loading) {
        content = <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />;
      } else if (cfg.key === 'slowestEndpoint') {
        const ep = summary?.slowestEndpoint;
        content = ep ? (
          <div>
            <Text style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              {cfg.label}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Tag color={METHOD_COLORS[ep.method] ?? '#888'} style={{ margin: 0, fontWeight: 700 }}>
                {ep.method}
              </Tag>
              <Text style={{ color: '#faad14', fontSize: 13, wordBreak: 'break-all' }}>{ep.route}</Text>
            </div>
            <Text style={{ color: '#faad14', fontSize: 22, fontWeight: 700 }}>{ep.maxLatencyMs} ms</Text>
          </div>
        ) : (
          <Statistic title={<span style={{ color: '#8c8c8c', fontSize: 13 }}>{cfg.label}</span>} value="—" styles={{ content: { color: cfg.color } }} />
        );
      } else if (cfg.key === 'peakTrafficHour') {
        const hour = summary?.peakTrafficHour;
        content = (
          <Statistic
            title={<span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>}
            value={hour !== null && hour !== undefined ? formatHour(hour) : '—'}
            styles={{ content: { color: cfg.color, fontSize: 22, fontWeight: 700 } }}
          />
        );
      } else {
        const raw = summary?.[cfg.key as keyof Summary] as number | undefined;
        const formatted = raw !== undefined && cfg.format ? cfg.format(raw) : (raw ?? 0);
        content = (
          <Statistic
            title={<span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>}
            value={formatted}
            suffix={('suffix' in cfg) ? cfg.suffix : undefined}
            styles={{ content: { color: cfg.color, fontSize: 28, fontWeight: 700 } }}
          />
        );
      }

      return (
        <Col key={cfg.key} xs={24} sm={12} lg={8}>
          <Tooltip title={cfg.tooltip} placement="top">
            <Card
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, height: '100%' }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>{content}</div>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: cfg.bg,
                  border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginLeft: 12,
                }}>
                  <Icon size={20} color={cfg.color} />
                </div>
              </div>
            </Card>
          </Tooltip>
        </Col>
      );
    })}
  </Row>
);

// ─── Chart wrapper ─────────────────────────────────────────────────────────────

const ChartCard = ({ title, children, span = 12 }: { title: string; children: React.ReactNode; span?: number }) => (
  <Col xs={24} lg={span}>
    <Card
      title={<span style={{ color: '#fff', fontWeight: 600 }}>{title}</span>}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      {children}
    </Card>
  </Col>
);

// ─── Individual Charts ─────────────────────────────────────────────────────────

interface EndpointTrendDay {
  date: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
}

const EndpointTrendChart = ({ data, loading }: { data: EndpointTrendDay[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;
  if (!data.length) return <Empty description="No trend data for this endpoint" />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ color: '#8c8c8c' }} />
        <Line type="monotone" dataKey="requestCount" stroke="#1890ff" dot={false} name="Requests" strokeWidth={2} />
        <Line type="monotone" dataKey="errorCount" stroke="#ff4d4f" dot={false} name="Errors" strokeWidth={2} />
        <Line type="monotone" dataKey="avgLatencyMs" stroke="#52c41a" dot={false} name="Avg Latency (ms)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const RequestTrendChart = ({ data, loading }: { data: TrendDay[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;
  if (!data.length) return <Empty description="No trend data" />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <YAxis tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ color: '#8c8c8c' }} />
        <Line type="monotone" dataKey="totalRequests" stroke="#1890ff" dot={false} name="Requests" strokeWidth={2} />
        <Line type="monotone" dataKey="totalErrors" stroke="#ff4d4f" dot={false} name="Errors" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const TopEndpointsChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;
  const top = data.slice(0, 10).map(r => ({ name: `${r.method} ${r.route}`, requests: r.requestCount }));
  if (!top.length) return <Empty description="No endpoint data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={top} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={230} tick={{ fill: '#8c8c8c', fontSize: 10 }} />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="requests" fill="#1890ff" radius={[0, 4, 4, 0]} name="Requests" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const LatencyChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;
  const top = data
    .filter(r => r.p99LatencyMs > 0)
    .slice(0, 8)
    .map(r => ({
      name: r.route.split('/').slice(-2).join('/') || r.route,
      fullName: `${r.method} ${r.route}`,
      p50: r.p50LatencyMs,
      p95: r.p95LatencyMs,
      p99: r.p99LatencyMs,
    }));
  if (!top.length) return <Empty description="No latency data" />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={top}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" tick={{ fill: '#8c8c8c', fontSize: 10 }} />
        <YAxis tick={{ fill: '#8c8c8c', fontSize: 11 }} unit="ms" />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          formatter={(value, _name, _item, _index, payload) => {
            const v = Number(value);
            const name = String(_name);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fullName = (payload as any)?.[0]?.payload?.fullName;
            return [fullName ? `${fullName}: ${v} ms` : `${v} ms`, name];
          }}
        />
        <Legend wrapperStyle={{ color: '#8c8c8c' }} />
        <Bar dataKey="p50" fill="#52c41a" name="P50" radius={[2, 2, 0, 0]} />
        <Bar dataKey="p95" fill="#faad14" name="P95" radius={[2, 2, 0, 0]} />
        <Bar dataKey="p99" fill="#ff4d4f" name="P99" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const HourlyTrafficChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;

  const hourlyTotals = new Array(24).fill(0).map((_, h) => ({ hour: formatHour(h), count: 0, h }));
  for (const r of data) {
    for (const { hour, count } of (r.hourlyRequests || [])) {
      if (hour >= 0 && hour < 24) hourlyTotals[hour].count += count;
    }
  }

  if (hourlyTotals.every(h => h.count === 0)) return <Empty description="No hourly data" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={hourlyTotals}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="hour" tick={{ fill: '#8c8c8c', fontSize: 10 }} />
        <YAxis tick={{ fill: '#8c8c8c', fontSize: 11 }} />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
        />
        <Bar dataKey="count" fill="#722ed1" radius={[3, 3, 0, 0]} name="Requests" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const StatusCodeChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;

  const totals: Record<string, number> = {};
  for (const r of data) {
    for (const [code, count] of Object.entries(r.statusCodes || {})) {
      totals[code] = (totals[code] || 0) + count;
    }
  }

  const pieData = Object.entries(totals)
    .map(([code, value]) => ({ name: code, value }))
    .sort((a, b) => b.value - a.value);

  if (!pieData.length) return <Empty description="No status code data" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`} labelLine={false}>
          {pieData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          formatter={(value) => [Number(value).toLocaleString(), 'Requests']}
        />
        <Legend wrapperStyle={{ color: '#8c8c8c', fontSize: 12 }} formatter={(name) => `HTTP ${name}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const DeviceTypeChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;

  const totals = { mobile: 0, desktop: 0, tablet: 0, bot: 0 };
  for (const r of data) {
    const d = r.deviceTypes || {};
    totals.mobile += d.mobile || 0;
    totals.desktop += d.desktop || 0;
    totals.tablet += d.tablet || 0;
    totals.bot += d.bot || 0;
  }

  const pieData = Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  if (!pieData.length) return <Empty description="No device data" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
          {pieData.map((_, i) => (
            <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
          ))}
        </Pie>
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ color: '#8c8c8c', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ErrorRateChart = ({ data, loading }: { data: EndpointRecord[]; loading: boolean }) => {
  if (loading) return <Skeleton active />;

  const withErrors = data
    .filter(r => r.errorCount > 0)
    .slice(0, 10)
    .map(r => ({
      name: r.route.split('/').slice(-2).join('/') || r.route,
      fullName: `${r.method} ${r.route}`,
      errorRate: r.requestCount > 0 ? parseFloat(((r.errorCount / r.requestCount) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);

  if (!withErrors.length) return <Empty description="No errors on this date 🎉" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={withErrors} layout="vertical" margin={{ left: 0, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#8c8c8c', fontSize: 11 }} unit="%" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" width={200} tick={{ fill: '#8c8c8c', fontSize: 10 }} />
        <RechartTooltip
          contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
          formatter={(v, _name, _item, _index, payload) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fullName = (payload as any)?.[0]?.payload?.fullName;
            return [`${Number(v).toFixed(1)}%`, fullName ?? 'Error Rate'];
          }}
        />
        <Bar dataKey="errorRate" fill="#ff4d4f" radius={[0, 4, 4, 0]} name="Error Rate %" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function ApiAnalyticsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().subtract(1, 'day'));
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const dateStr = selectedDate.format('YYYY-MM-DD');

  const { data: summaryRes, isLoading: summaryLoading } = useGetData({
    key: ['api-analytics-summary', dateStr],
    url: api.getApiAnalyticsSummary,
    params: { date: dateStr },
  });

  const { data: endpointsRes, isLoading: endpointsLoading } = useGetData({
    key: ['api-analytics-endpoints', dateStr],
    url: api.getApiAnalyticsEndpoints,
    params: { date: dateStr },
  });

  const { data: trendRes, isLoading: trendLoading } = useGetData({
    key: ['api-analytics-trend'],
    url: api.getApiAnalyticsTrend,
    params: { days: 30 },
  });

  const summary: Summary | undefined = (summaryRes as { data: Summary })?.data;
  const endpoints: EndpointRecord[] = useMemo(
    () => ((endpointsRes as { data: { records: EndpointRecord[] } })?.data?.records ?? []),
    [endpointsRes]
  );
  const trend: TrendDay[] = useMemo(
    () => ((trendRes as { data: TrendDay[] })?.data ?? []),
    [trendRes]
  );

  const endpointOptions = useMemo(
    () => endpoints
      .filter(r => r.method !== 'OPTIONS')
      .map(r => ({ label: `${r.method} ${r.route}`, value: `${r.method} ${r.route}` })),
    [endpoints]
  );

  const filteredEndpoints = useMemo(
    () => selectedEndpoint
      ? endpoints.filter(r => r.method !== 'OPTIONS' && `${r.method} ${r.route}` === selectedEndpoint)
      : endpoints.filter(r => r.method !== 'OPTIONS'),
    [endpoints, selectedEndpoint]
  );

  // When a specific endpoint is selected, derive summary stats from that record
  // instead of showing day-level aggregates.
  const endpointSummary = useMemo<Summary | undefined>(() => {
    if (!selectedEndpoint || filteredEndpoints.length === 0) return undefined;
    const r = filteredEndpoints[0];
    const errorRate = r.requestCount > 0
      ? parseFloat(((r.errorCount / r.requestCount) * 100).toFixed(2))
      : 0;
    const peakHour = r.hourlyRequests?.length
      ? r.hourlyRequests.reduce((best, h) => h.count > best.count ? h : best).hour
      : null;
    return {
      date: dateStr,
      totalRequests: r.requestCount,
      avgLatencyMs: r.avgLatencyMs,
      errorRate,
      slowestEndpoint: { route: r.route, method: r.method, maxLatencyMs: r.maxLatencyMs },
      peakTrafficHour: peakHour,
      totalActiveEndpoints: 1,
    };
  }, [selectedEndpoint, filteredEndpoints, dateStr]);

  // Parse selected endpoint into method + route for the trend API
  const parsedEndpoint = useMemo(() => {
    if (!selectedEndpoint) return null;
    const spaceIdx = selectedEndpoint.indexOf(' ');
    return { method: selectedEndpoint.slice(0, spaceIdx), route: selectedEndpoint.slice(spaceIdx + 1) };
  }, [selectedEndpoint]);

  const { data: endpointTrendRes, isLoading: endpointTrendLoading } = useGetData({
    key: ['api-analytics-endpoint-trend', parsedEndpoint?.method ?? '', parsedEndpoint?.route ?? ''],
    url: api.getApiAnalyticsEndpointTrend,
    params: parsedEndpoint ? { route: parsedEndpoint.route, method: parsedEndpoint.method, days: 30 } : {},
    enabled: !!parsedEndpoint,
  });

  const endpointTrend: EndpointTrendDay[] = useMemo(
    () => ((endpointTrendRes as { data: EndpointTrendDay[] })?.data ?? []),
    [endpointTrendRes]
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
              API Analytics
            </Title>
            <Text style={{ color: '#8c8c8c' }}>
              Daily endpoint performance, traffic patterns, and error analysis
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <DatePicker
              value={selectedDate}
              onChange={(d) => { if (d) { setSelectedDate(d); setSelectedEndpoint(null); } }}
              disabledDate={(d) => d.isAfter(dayjs().subtract(1, 'day'))}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
              allowClear={false}
            />
            <Select
              value={selectedEndpoint}
              onChange={setSelectedEndpoint}
              placeholder="All endpoints"
              allowClear
              showSearch
              style={{ minWidth: 320 }}
              options={endpointOptions}
              loading={endpointsLoading}
              optionFilterProp="label"
            />
          </div>
        </div>

        {/* Summary Cards — endpoint-level when one is selected, otherwise day-level */}
        <SummaryCards
          summary={endpointSummary ?? summary}
          loading={endpointSummary ? false : summaryLoading}
        />

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '28px 0 20px' }} />

        {selectedEndpoint ? (
          /* ── Single-endpoint view ───────────────────────────────── */
          <>
            {/* Row 1: Endpoint trend + Hourly */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <ChartCard title="Request Volume — Last 30 Days (this endpoint)" span={14}>
                <EndpointTrendChart data={endpointTrend} loading={endpointTrendLoading} />
              </ChartCard>
              <ChartCard title="Hourly Traffic Distribution" span={10}>
                <HourlyTrafficChart data={filteredEndpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>

            {/* Row 2: Latency + Status Codes */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <ChartCard title="Latency Percentiles (P50 / P95 / P99)" span={12}>
                <LatencyChart data={filteredEndpoints} loading={endpointsLoading} />
              </ChartCard>
              <ChartCard title="Status Code Distribution" span={12}>
                <StatusCodeChart data={filteredEndpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>

            {/* Row 3: Device Types + Error Rate */}
            <Row gutter={[16, 16]}>
              <ChartCard title="Device Type Distribution" span={12}>
                <DeviceTypeChart data={filteredEndpoints} loading={endpointsLoading} />
              </ChartCard>
              <ChartCard title="Error Rate" span={12}>
                <ErrorRateChart data={filteredEndpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>
          </>
        ) : (
          /* ── General / all-endpoints view ───────────────────────── */
          <>
            {/* Row 1: Trend + Hourly */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <ChartCard title="Request Volume — Last 30 Days" span={14}>
                <RequestTrendChart data={trend} loading={trendLoading} />
              </ChartCard>
              <ChartCard title="Hourly Traffic Distribution" span={10}>
                <HourlyTrafficChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>

            {/* Row 2: Top Endpoints + Error Rate */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <ChartCard title="Top 10 Endpoints by Request Count" span={12}>
                <TopEndpointsChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
              <ChartCard title="Top Endpoints by Error Rate" span={12}>
                <ErrorRateChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>

            {/* Row 3: Latency Percentiles */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <ChartCard title="Latency Percentiles (P50 / P95 / P99) — Top 8 Endpoints" span={24}>
                <LatencyChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>

            {/* Row 4: Status codes + Devices */}
            <Row gutter={[16, 16]}>
              <ChartCard title="Status Code Distribution" span={12}>
                <StatusCodeChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
              <ChartCard title="Device Type Distribution" span={12}>
                <DeviceTypeChart data={endpoints} loading={endpointsLoading} />
              </ChartCard>
            </Row>
          </>
        )}
      </div>
    </ConfigProvider>
  );
}
