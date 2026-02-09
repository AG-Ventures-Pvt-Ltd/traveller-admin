'use client';

import { Typography } from 'antd';

const { Title, Text } = Typography;

const Settings = () => {
    return (
        <div>
            <Title level={2} style={{ color: '#fff' }}>Settings</Title>
            <Text style={{ color: '#8c8c8c' }}>Configure application settings and preferences.</Text>
        </div>
    )
}

export default Settings;