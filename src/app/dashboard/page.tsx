'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Skeleton, Tooltip, Typography, Divider, Button, Space, DatePicker } from 'antd';
import { Map, Users, Backpack, CalendarCheck, CheckCircle2, Wallet, CircleDollarSign, Ban, TrendingUp, Eye } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Cell, ResponsiveContainer } from 'recharts';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

const STAT_CONFIG = [
  {
    key: 'totalActiveTrips',
    label: 'Active Trips',
    icon: Map,
    color: '#1890ff',
    bg: 'rgba(24, 144, 255, 0.1)',
    border: 'rgba(24, 144, 255, 0.25)',
    tooltip: 'Trips currently in published status',
  },
  {
    key: 'totalHosts',
    label: 'Total Hosts',
    icon: Users,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.25)',
    tooltip: 'Registered host accounts',
  },
  {
    key: 'totalTravelers',
    label: 'Total Travelers',
    icon: Backpack,
    color: '#faad14',
    bg: 'rgba(250, 173, 20, 0.1)',
    border: 'rgba(250, 173, 20, 0.25)',
    tooltip: 'Registered traveler accounts',
  },
  {
    key: 'totalActiveBatches',
    label: 'Active Batches',
    icon: CalendarCheck,
    color: '#722ed1',
    bg: 'rgba(114, 46, 209, 0.1)',
    border: 'rgba(114, 46, 209, 0.25)',
    tooltip: 'Trip batches currently available or filling fast',
  },
  {
    key: 'totalSuccessfulBookings',
    label: 'Successful Bookings',
    icon: CheckCircle2,
    color: '#eb2f96',
    bg: 'rgba(235, 47, 150, 0.1)',
    border: 'rgba(235, 47, 150, 0.25)',
    tooltip: 'All-time confirmed bookings',
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: TrendingUp,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.25)',
    tooltip: 'Sum of grandTotal across all confirmed bookings',
    prefix: '₹',
  },
] as const;

const WALLET_STAT_CONFIG = [
  {
    key: 'totalWondrrCashGiven',
    label: 'Total Wondrr Cash Given',
    icon: Wallet,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.1)',
    border: 'rgba(82, 196, 26, 0.25)',
    tooltip: 'Cumulative Wondrr Cash credited to all users (all-time)',
    prefix: '₹',
  },
  {
    key: 'totalActiveCash',
    label: 'Active Wondrr Cash',
    icon: CircleDollarSign,
    color: '#1890ff',
    bg: 'rgba(24, 144, 255, 0.1)',
    border: 'rgba(24, 144, 255, 0.25)',
    tooltip: 'Total Wondrr Cash currently active and available in user wallets',
    prefix: '₹',
  },
  {
    key: 'totalExpiredCash',
    label: 'Expired Wondrr Cash',
    icon: Ban,
    color: '#ff4d4f',
    bg: 'rgba(255, 77, 79, 0.1)',
    border: 'rgba(255, 77, 79, 0.25)',
    tooltip: 'Total Wondrr Cash that has expired across all user wallets',
    prefix: '₹',
  },
] as const;

type StatKey = typeof STAT_CONFIG[number]['key'];
type WalletStatKey = typeof WALLET_STAT_CONFIG[number]['key'];

interface StatsData {
  totalActiveTrips?: number;
  totalHosts?: number;
  totalTravelers?: number;
  totalActiveBatches?: number;
  totalSuccessfulBookings?: number;
  totalRevenue?: number;
  totalWondrrCashGiven?: number;
  totalActiveCash?: number;
  totalExpiredCash?: number;
}

interface ApiStatsResponse {
  data: StatsData;
}

interface StatCardProps {
  config: (typeof STAT_CONFIG[number]) | (typeof WALLET_STAT_CONFIG[number]);
  value: number | undefined;
  loading: boolean;
}

const StatCard = ({ config, value, loading }: StatCardProps) => {
  const Icon = config.icon;
  const prefix = 'prefix' in config ? config.prefix : undefined;
  return (
    <Tooltip title={config.tooltip} placement="top">
      <Card
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: 12,
          height: '100%',
          cursor: 'default',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
            ) : (
              <Statistic
                title={
                  <span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>
                    {config.label}
                  </span>
                }
                value={value ?? 0}
                prefix={prefix}
                styles={{ content: { color: config.color, fontSize: 28, fontWeight: 700 } }}
              />
            )}
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: config.bg,
              border: `1px solid ${config.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 12,
              marginTop: 4,
            }}
          >
            <Icon size={22} color={config.color} />
          </div>
        </div>
      </Card>
    </Tooltip>
  );
};

const DashboardStats = () => {
  const { data: stats, isLoading } = useGetData({
    key: ['dashboard-stats'],
    url: api.getDashboardStats,
  });

  const statsData = (stats as ApiStatsResponse)?.data;

  return (
    <>
      <Row gutter={[16, 16]}>
        {STAT_CONFIG.map((config) => (
          <Col key={config.key} xs={24} sm={12} lg={8} xl={8} xxl={4} style={{ flex: '1 1 0' }}>
            <StatCard
              config={config}
              value={statsData?.[config.key as StatKey]}
              loading={isLoading}
            />
          </Col>
        ))}
      </Row>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '28px 0 20px' }} />

      <Text
        style={{
          color: '#8c8c8c',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 14,
        }}
      >
        Wondrr Cash
      </Text>

      <Row gutter={[16, 16]}>
        {WALLET_STAT_CONFIG.map((config) => (
          <Col key={config.key} xs={24} sm={8}>
            <StatCard
              config={config}
              value={statsData?.[config.key as WalletStatKey]}
              loading={isLoading}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

// ─── Trip Traffic Section ─────────────────────────────────────────────────────

const { RangePicker } = DatePicker;

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

type TrafficPreset = 'today' | '15d' | '30d' | 'custom';

interface TrafficData {
  totalViews: number;
  bySource: Record<string, number>;
  topTrips: { slug: string; title: string; views: number }[];
}

interface ApiTrafficResponse {
  data: TrafficData;
}

const toISO = (d: Dayjs) => d.format('YYYY-MM-DD');

const TripTrafficSection = () => {
  const [preset, setPreset] = useState<TrafficPreset>('30d');
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
    key: ['dashboard-trip-traffic'],
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

  const presets: { key: TrafficPreset; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '15d', label: '15 Days' },
    { key: '30d', label: '30 Days' },
    { key: 'custom', label: 'Custom' },
  ];

  const cardBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 };

  return (
    <>
      <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '28px 0 20px' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <Text style={{ color: '#8c8c8c', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Trip Traffic
        </Text>
        <Space wrap size={6}>
          {presets.map(p => (
            <Button
              key={p.key}
              type={preset === p.key ? 'primary' : 'default'}
              size="small"
              onClick={() => setPreset(p.key)}
              style={{ fontSize: 12 }}
            >
              {p.label}
            </Button>
          ))}
          {preset === 'custom' && (
            <>
              <DatePicker
                placeholder="Single date"
                size="small"
                onChange={(d) => { setCustomSingle(d); setCustomRange(null); }}
                style={{ width: 130 }}
              />
              <RangePicker
                placeholder={['Start', 'End']}
                size="small"
                onChange={(r) => { setCustomRange(r as [Dayjs, Dayjs] | null); setCustomSingle(null); }}
                style={{ width: 220 }}
              />
            </>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Total views */}
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title="Unique views recorded in the selected period">
            <Card style={{ ...cardBase, background: 'rgba(24,144,255,0.1)', border: '1px solid rgba(24,144,255,0.25)' }} styles={{ body: { padding: '20px 24px' } }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
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
          </Tooltip>
        </Col>

        {/* Bar chart */}
        <Col xs={24} sm={12} lg={18}>
          <Card style={cardBase} styles={{ body: { padding: '12px 16px' } }}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#8c8c8c', fontSize: 13 }}>No views recorded in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="source" tick={{ fill: '#8c8c8c', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8c8c8c', fontSize: 11 }} />
                  <RechartTooltip
                    contentStyle={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }}
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
      </Row>

      {/* Per-platform breakdown */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
          <Col key={key} xs={12} sm={8} md={6} xl={3}>
            <Card style={{ background: `${PLATFORM_COLORS[key]}18`, border: `1px solid ${PLATFORM_COLORS[key]}44`, borderRadius: 10 }} styles={{ body: { padding: '12px 16px' } }}>
              {isLoading ? <Skeleton active paragraph={{ rows: 0 }} title={{ width: '70%' }} /> : (
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: 11 }}>{label}</span>}
                  value={traffic?.bySource?.[key] ?? 0}
                  styles={{ content: { color: PLATFORM_COLORS[key], fontSize: 18, fontWeight: 700 } }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

const DashboardContent = () => {
  return (
    <div>
      <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
        Dashboard Overview
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Platform-wide stats at a glance
      </Text>
      <DashboardStats />
      <TripTrafficSection />
    </div>
  );
};

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

