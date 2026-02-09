import React from 'react';
import { Modal, Typography, Tag, Divider, Space, Descriptions } from 'antd';
import { ErrorLog } from '../constant';

const { Title, Text, Paragraph } = Typography;

interface ErrorLogDetailModalProps {
    visible: boolean;
    onClose: () => void;
    errorLog: ErrorLog | null;
}

const ErrorLogDetailModal: React.FC<ErrorLogDetailModalProps> = ({ visible, onClose, errorLog }) => {
    if (!errorLog) return null;

    const getLevelColor = (level: string | undefined): string => {
        switch (level?.toLowerCase()) {
            case 'error':
                return 'red';
            case 'warn':
            case 'warning':
                return 'orange';
            case 'info':
                return 'blue';
            case 'debug':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getStatusColor = (statusCode: number | undefined): string => {
        if (!statusCode) return 'gray';
        if (statusCode >= 500) return 'red';
        if (statusCode >= 400) return 'orange';
        if (statusCode >= 300) return 'blue';
        return 'green';
    };

    return (
        <Modal
            title={
                <Space>
                    <Tag color={getLevelColor(errorLog.level)}>
                        {errorLog.level?.toUpperCase()}
                    </Tag>
                    Error Log Details
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            style={{ top: 20 }}
        >
            <Descriptions
                bordered
                column={1}
                size="small"
                style={{ marginTop: 16 }}
            >
                <Descriptions.Item label="Level">
                    <Tag color={getLevelColor(errorLog.level)}>
                        {errorLog.level?.toUpperCase()}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Method">
                    <Tag>{errorLog.method}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="URL">
                    <Text copyable style={{ wordBreak: 'break-all' }}>
                        {errorLog.url}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Status Code">
                    {errorLog.statusCode ? (
                        <Tag color={getStatusColor(errorLog.statusCode)}>
                            {errorLog.statusCode}
                        </Tag>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="IP Address">
                    <Text copyable>{errorLog.ip || '-'}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Message">
                    <Paragraph
                        style={{
                            margin: 0,
                            padding: '8px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                            wordBreak: 'break-word'
                        }}
                    >
                        {errorLog.message || '-'}
                    </Paragraph>
                </Descriptions.Item>

                {errorLog.stack && (
                    <Descriptions.Item label="Stack Trace">
                        <pre style={{
                            background: 'rgba(0,0,0,0.05)',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto',
                            maxHeight: '300px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {errorLog.stack}
                        </pre>
                    </Descriptions.Item>
                )}

                {errorLog.errors && (
                    <Descriptions.Item label="Additional Errors">
                        <pre style={{
                            background: 'rgba(0,0,0,0.05)',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto',
                            maxHeight: '200px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {typeof errorLog.errors === 'string'
                                ? errorLog.errors
                                : JSON.stringify(errorLog.errors, null, 2)
                            }
                        </pre>
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};

export default ErrorLogDetailModal;