import React from 'react'
import Typography from 'antd/es/typography/Typography';


export const Trips = () => {

    const { Title, Text } = Typography;

    return (
        <div>
            <Title level={2} style={{ color: '#fff' }}>User Trips</Title>
            <Text style={{ color: '#8c8c8c' }}>Add, edit, and manage your product catalog.</Text>
        </div>
    )
}

