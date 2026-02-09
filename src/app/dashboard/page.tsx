'use client';

import React, { Suspense } from 'react';
import { Typography, Row } from 'antd';

const { Title } = Typography;

const DashboardContent = () => {
  return (
    <div>
      <Title level={2} style={{ color: '#fff', marginBottom: '24px' }}>
        Dashboard Overview
      </Title>
      <Row gutter={[16, 16]}>
        <div className="text-white">Welcome to the Admin Dashboard. Select a menu item from the sidebar to get started.</div>
      </Row>
    </div>
  );
};



export default function Dashboard() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
