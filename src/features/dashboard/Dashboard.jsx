import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Avatar,
  Dropdown,
  Space,
  Button,
  ConfigProvider,
  theme,
  Card,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  LogOut,
  ChevronDown,
  AlignJustify,
} from 'lucide-react';
import { handleUserMenuClick } from './utils';
import SideBar from './components/SideBar/SideBar';
import { Users } from '../Users/Users';
import { Trips } from '../Trips/Trips';
import { Payments } from '../Payments/Payments';
import { Settings } from '../Settings/Settings';
import { UserSupport } from '../UserSupport/UserSupport';
import { useSearchParams } from "react-router-dom";
import { AdminUser } from '../AdminUser/AdminUser';


const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setSelectedKey(searchParams.get("menu"));
  }, [searchParams]);

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Space>
          <Users size={16} />
          Profile
        </Space>
      )
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogOut size={16} />
          Logout
        </Space>
      ),
      danger: true
    }
  ];

  const renderContent = () => {
    const contentMap = {
      dashboard: (
        <div>
          <Title level={2} style={{ color: '#fff', marginBottom: '24px' }}>
            Dashboard Overview
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ background: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Total Users</span>}
                  value={1234}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ background: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.2)' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Total Orders</span>}
                  value={567}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ background: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.2)' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Revenue</span>}
                  value={89012}
                  prefix="$"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ background: 'rgba(235, 47, 150, 0.1)', border: '1px solid rgba(235, 47, 150, 0.2)' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c' }}>Products</span>}
                  value={345}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
      users: <Users/>,
      trips: <Trips/>,
      orders: (
        <div>
          <Title level={2} style={{ color: '#fff' }}>Orders Management</Title>
          <Text style={{ color: '#8c8c8c' }}>Track and manage customer orders.</Text>
        </div>
      ),
      analytics: (
        <div>
          <Title level={2} style={{ color: '#fff' }}>Analytics</Title>
          <Text style={{ color: '#8c8c8c' }}>View detailed analytics and insights.</Text>
        </div>
      ),
      reports: (
        <div>
          <Title level={2} style={{ color: '#fff' }}>Reports</Title>
          <Text style={{ color: '#8c8c8c' }}>Generate and view various reports.</Text>
        </div>
      ),
      payments: <Payments/>,
      userSupport : <UserSupport/>,
      adminusers: <AdminUser/>,
      settings: <Settings/>
    };

    return contentMap[selectedKey] || contentMap.dashboard;
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen">
        <SideBar collapsed={collapsed} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
        <Layout
          className={`transition-all duration-200`}
        >
          <Header className="px-6 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
              <Button
                type="text"
                icon={<AlignJustify size={18} />}
                onClick={() => setCollapsed(!collapsed)}
                className="!text-white !w-10 !h-10"
              />
            </div>

            <Space size="middle">
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                trigger={["click"]}
              >
                <div className="cursor-pointer flex items-center">
                  <Avatar size={32} className="!bg-blue-500 mr-2">
                    A
                  </Avatar>
                  <Space>
                    <span className="text-white">Admin User</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </Space>
                </div>
              </Dropdown>
            </Space>
          </Header>
          <Content className="m-6 p-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 min-h-[calc(100vh-112px)]">
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
