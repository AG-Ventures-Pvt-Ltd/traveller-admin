'use client';

import React, { Suspense } from 'react';
import { Row, Col, Card, Statistic, Skeleton, Tooltip, Typography, Divider } from 'antd';
import { Map, Users, Backpack, CalendarCheck, CheckCircle2, Wallet, CircleDollarSign, Ban, TrendingUp } from 'lucide-react';
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

