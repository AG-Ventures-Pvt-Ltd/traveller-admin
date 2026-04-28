'use client';

import React, { Suspense } from 'react';
import { Row, Col, Card, Statistic, Skeleton, Tooltip, Typography } from 'antd';
import { Map, Users, Backpack, CalendarCheck, CheckCircle2 } from 'lucide-react';
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
] as const;

type StatKey = typeof STAT_CONFIG[number]['key'];

interface StatsData {
  totalActiveTrips?: number;
  totalHosts?: number;
  totalTravelers?: number;
  totalActiveBatches?: number;
  totalSuccessfulBookings?: number;
}

interface StatCardProps {
  config: typeof STAT_CONFIG[number];
  value: number | undefined;
  loading: boolean;
}

const StatCard = ({ config, value, loading }: StatCardProps) => {
  const Icon = config.icon;
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
                valueStyle={{ color: config.color, fontSize: 32, fontWeight: 700 }}
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

  return (
    <Row gutter={[16, 16]}>
      {STAT_CONFIG.map((config) => (
        <Col key={config.key} xs={24} sm={12} lg={8} xl={8} xxl={4} style={{ flex: '1 1 0' }}>
          <StatCard
            config={config}
            value={(stats as StatsData)?.[config.key as StatKey]}
            loading={isLoading}
          />
        </Col>
      ))}
    </Row>
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
