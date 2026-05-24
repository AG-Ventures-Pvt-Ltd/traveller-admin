'use client'
import React, { Suspense } from 'react'
import { useAuthStore } from '@/store/auth.store';

import { useRouter, usePathname } from 'next/navigation';
import { MenuItems, PermissionedItem } from './MenuItems';
import type { Permission } from '@/common/constants/permissions';
import { Layout, Typography, Menu } from 'antd';
import { Shield, Settings, LogOut } from 'lucide-react'

// Recursively filter items by user permissions
function filterItems(items: PermissionedItem[], hasPermission: (p: Permission) => boolean): PermissionedItem[] {
    return items.reduce<PermissionedItem[]>((acc, item) => {
        if (item.children) {
            const filteredChildren = filterItems(item.children, hasPermission);
            if (filteredChildren.length > 0) {
                acc.push({ ...item, children: filteredChildren });
            }
        } else if (!item.permission || hasPermission(item.permission)) {
            acc.push(item);
        }
        return acc;
    }, []);
}

// Strip permission field so Ant Design Menu doesn't receive unknown props
function toAntdItems(items: PermissionedItem[]): object[] {
    return items.map(({ permission, children, ...rest }) => ({
        ...rest,
        ...(children ? { children: toAntdItems(children) } : {}),
    }));
}

// Find which group key contains the currently active route
function findOpenGroupKey(items: PermissionedItem[], activeKey: string): string[] {
    for (const item of items) {
        if (item.children?.some(child => child.key === activeKey)) {
            return [item.key];
        }
    }
    return [];
}

const SideBarContent = ({ collapsed }: { collapsed: boolean }) => {

    const { Sider } = Layout
    const { Title } = Typography;

    const router = useRouter()
    const pathname = usePathname()
    const selectedKey = pathname?.split('/').pop() || 'dashboard';

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'dashboard') {
            router.push('/dashboard');
        } else {
            router.push(`/${key}`);
        }
    };

    const { hasPermission, logout } = useAuthStore();

    const filteredItems = filterItems(MenuItems, hasPermission);
    const antdItems = toAntdItems(filteredItems);
    const defaultOpenKeys = collapsed ? [] : findOpenGroupKey(filteredItems, selectedKey);

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
                    defaultOpenKeys={defaultOpenKeys}
                    onClick={handleMenuClick}
                    className="!bg-transparent !border-none mt-4"
                    items={antdItems as any}
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
                            key: 'logout',
                            icon: <LogOut size={18} />,
                            label: 'Logout',
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