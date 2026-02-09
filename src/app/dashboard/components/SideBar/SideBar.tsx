'use client'
import React, { Suspense } from 'react'
import { PERMISSIONS } from '@/common/constants/permissions';
import { useAuthStore } from '@/store/auth.store';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MenuItems } from './MenuItems';
import { Layout, Typography, Menu } from 'antd';
import { Shield, Settings, LogOut } from 'lucide-react'


const SideBarContent = ({ collapsed }: { collapsed: boolean }) => {

    const { Sider } = Layout
    const { Title } = Typography;


    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams();
    const selectedKey = pathname?.split('/').pop() || 'dashboard';

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'dashboard') {
            router.push('/dashboard');
        } else {
            router.push(`/${key}`);
        }
    };

    const { hasPermission, logout } = useAuthStore();

    const filteredMenuItems = MenuItems.filter(item =>
        hasPermission(item.permission as any)
    );

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            className="!bg-black/20 !backdrop-blur-md !border-r !border-white/10 h-screen overflow-y-auto"
        >
            <div
                className={`h-16 flex items-center ${collapsed ? "justify-center px-0" : "justify-start px-6"
                    } border-b border-white/10`}
            >
                <Shield size={32} className="text-blue-500" />
                {!collapsed && (
                    <Title level={4} className="!text-white !m-0 ml-3">
                        Admin Panel
                    </Title>
                )}
            </div>
            <div className='flex flex-col justify-between w-full h-[90%]'>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    className="!bg-transparent !border-none mt-4"
                    items={filteredMenuItems.map(item => {
                        const { permission, ...rest } = item;
                        return rest;
                    })}
                />
                <div>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        onClick={handleMenuClick}
                        className="!bg-transparent !border-none mt-4"
                        items={[{
                            key: 'settings',
                            icon: <Settings size={18} />,
                            label: 'Settings',
                        }]}
                    />
                    <Menu
                        mode="inline"
                        onClick={logout}
                        className="!bg-transparent !border-none mt-4"
                        items={[{
                            key: 'settings',
                            icon: <LogOut size={18} />,
                            label: 'logout',
                        }]}
                    />

                </div>
                
            </div>
        </Sider>
    )
}

const SideBar = ({ collapsed }: { collapsed: boolean }) => {
    return (
        <Suspense fallback={<div className="w-[260px] h-screen bg-black/20" />}>
            <SideBarContent collapsed={collapsed} />
        </Suspense>
    )
}

export default SideBar