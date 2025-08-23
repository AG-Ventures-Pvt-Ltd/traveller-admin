import React from 'react'
import { PERMISSIONS, USER_PERMISSIONS } from '../../constants'
import { useNavigate, useLocation } from "react-router-dom";
import { MenuItems } from './components/MenuItems';
import { Layout, Typography, Menu } from 'antd';
import {Shield, Settings} from 'lucide-react'


const SideBar = ({ collapsed, selectedKey, setSelectedKey }) => {

    const { Sider } = Layout
    const { Title } = Typography;


    const navigate = useNavigate();
    const location = useLocation();
    

    const handleMenuClick = ({ key }) => {
        setSelectedKey(key);
    
        const searchParams = new URLSearchParams(location.search);
        searchParams.set("menu", key);
    
        navigate(`${location.pathname}?${searchParams.toString()}`);
    };
    
    const filteredMenuItems = MenuItems.filter(item =>
        USER_PERMISSIONS.includes(item.permission)
      );

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            className="!bg-black/20 !backdrop-blur-md !border-r !border-white/10 fixed h-screen left-0 top-0 bottom-0 z-50"
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
                    items={filteredMenuItems}
                />
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    className="!bg-transparent !border-none mt-4"
                    items={[{
                        key: 'settings',
                        icon: <Settings size={18} />,
                        label: 'Settings',
                        permission: PERMISSIONS.SETTINGS
                    }]}
                />
            </div>
        </Sider>
    )
}

export default SideBar