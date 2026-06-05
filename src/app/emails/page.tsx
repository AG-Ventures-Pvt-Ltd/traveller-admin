'use client';

import React from 'react';
import { Card, Button, Typography, ConfigProvider, theme } from 'antd';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EMAIL_TEMPLATES, cardStyle } from './_shared';

const { Title, Text } = Typography;

export default function EmailsPage() {
    const router = useRouter();

    return (
        <ConfigProvider
            theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#1890ff', borderRadius: 8 } }}
        >
            <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>Emails</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
                    Select a template to compose and send to travellers.
                </Text>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {EMAIL_TEMPLATES.map(template => (
                        <Card
                            key={template.id}
                            hoverable
                            style={cardStyle}
                            styles={{ body: { padding: 20 } }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: 'rgba(24,144,255,0.15)', border: '1px solid rgba(24,144,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, color: '#1890ff',
                                }}>
                                    {template.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text strong style={{ color: '#fff', fontSize: 15, display: 'block', marginBottom: 4 }}>
                                        {template.name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 13, lineHeight: '1.5' }}>
                                        {template.description}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    block
                                    icon={<Send size={14} />}
                                    onClick={() => router.push(`/emails/compose/${template.id}`)}
                                    style={{ borderRadius: 8 }}
                                >
                                    Use Template
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </ConfigProvider>
    );
}
