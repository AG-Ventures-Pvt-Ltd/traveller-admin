'use client'
import React, { useState } from 'react';
import { Layout, Button, theme, ConfigProvider, Avatar, Dropdown, Space } from 'antd';
import { AlignJustify, ChevronDown, Users } from 'lucide-react';
import SideBar from './dashboard/components/SideBar/SideBar';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

const { Header, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname(); // Add usePathname
    const { user, logout } = useAuthStore(); // Check user from store
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // If user is not logged in and not on auth page, redirect to auth
        if (!user && pathname !== '/auth') {
            router.push('/auth');
        }

        // If user is logged in and on auth page, redirect to dashboard
        if (user && pathname === '/auth') {
            router.push('/dashboard');
        }
    }, [user, pathname, router, isMounted]);

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
                    <div className="text-red-500 flex gap-2">
                        Logout
                    </div>
                </Space>
            ),
            onClick: () => {
                logout();
                router.push('/auth');
            }
        }
    ];

    const handleUserMenuClick = ({ key }: { key: string }) => {
        console.log('Menu clicked', key);
        if (key === 'logout') {
            logout();
            router.push('/auth');
        }
    };

    // Prevent hydration mismatch and flash of content
    if (!isMounted) return null;

    if (pathname === '/auth') {
        return <>{children}</>;
    }

    if (!user) {
        return null; // Or a loading spinner
    }

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
            <Layout className="h-screen overflow-hidden">
                <SideBar collapsed={collapsed} />
                <Layout className="h-screen flex flex-col">
                    <Header className="px-6 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between h-16 flex-shrink-0">
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
                                        {(user?.name as string)?.[0]?.toUpperCase() || 'A'}
                                    </Avatar>
                                    <Space>
                                        <span className="text-white">{(user?.name as string) || 'Admin User'}</span>
                                        <ChevronDown size={16} className="text-gray-400" />
                                    </Space>
                                </div>
                            </Dropdown>
                        </Space>
                    </Header>
                    <Content className="flex-1 overflow-y-auto bg-white/5 backdrop-blur-md rounded-lg border border-white/10 m-6 p-6">
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
