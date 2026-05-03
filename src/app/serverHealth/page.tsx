'use client'
import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, Spin, Alert } from 'antd';
import { Monitor, Cpu, HardDrive, MemoryStick, Clock } from 'lucide-react';
import { api } from '@/common/constants/api.urls';
import { formatDateTime } from '@/common/utils/date';

const { Title, Text } = Typography;

interface HealthData {
  hostname: string;
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    usage: number;
  };
  uptime: {
    formatted: string;
  };
  processMemory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

const ServerHealth = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user') || '';

    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${api.getServerHealth}?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setHealthData(data);
        setLoading(false);
        setError(null);
      } catch (e) {
        setError('Failed to parse health data');
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      setError('Failed to connect to health stream');
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: '10px' }}>Connecting to server health stream...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Connection Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div>
      <Title level={2} style={{ color: '#fff', marginBottom: '20px' }}>
        <Monitor size={24} style={{ marginRight: '10px' }} />
        Server Health Monitor
      </Title>
      <Text style={{ color: '#8c8c8c', marginBottom: '30px', display: 'block' }}>
        Real-time server health metrics for {healthData?.hostname} streamed via Server-Sent Events.
      </Text>
      <Text style={{ color: '#8c8c8c', marginBottom: '20px', display: 'block' }}>
        Last updated: {healthData?.timestamp ? formatDateTime(healthData.timestamp) : 'N/A'}
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><Cpu size={16} style={{ marginRight: '5px' }} />CPU Usage</span>}
              value={healthData?.cpu?.usage || 0}
              suffix="%"
              styles={{ content: { color: '#1890ff' } }}
            />
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {healthData?.cpu?.cores} cores
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><MemoryStick size={16} style={{ marginRight: '5px' }} />RAM Used</span>}
              value={healthData?.memory?.used || 0}
              suffix="GB"
              styles={{ content: { color: '#faad14' } }}
            />
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Total: {healthData?.memory?.total || 0} GB | Usage: {healthData?.memory?.percentage}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(235, 47, 150, 0.1)', border: '1px solid rgba(235, 47, 150, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><HardDrive size={16} style={{ marginRight: '5px' }} />Disk Usage</span>}
              value={healthData?.disk?.usage || 0}
              suffix="%"
              styles={{ content: { color: '#eb2f96' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><Clock size={16} style={{ marginRight: '5px' }} />Uptime</span>}
              value={healthData?.uptime?.formatted || 'N/A'}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(114, 46, 209, 0.1)', border: '1px solid rgba(114, 46, 209, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Node Heap Used</span>}
              value={healthData?.processMemory?.heapUsed || 0}
              suffix="MB"
              styles={{ content: { color: '#722ed1' } }}
            />
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Total: {healthData?.processMemory?.heapTotal} MB
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'rgba(140, 140, 140, 0.1)', border: '1px solid rgba(140, 140, 140, 0.2)' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Process RSS</span>}
              value={healthData?.processMemory?.rss || 0}
              suffix="MB"
              styles={{ content: { color: '#8c8c8c' } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ServerHealth;