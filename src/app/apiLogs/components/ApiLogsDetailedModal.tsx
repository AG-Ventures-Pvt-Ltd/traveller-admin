import React from 'react';
import { Modal, Typography, Tag, Divider, Space, Descriptions } from 'antd';
import { formatDateTime } from '../../../common/utils/date';
import { APILog } from '../constant';

const { Title, Text, Paragraph } = Typography;

interface ApiLogDetailModalProps {
    visible: boolean;
    onClose: () => void;
    apiLog: APILog | null;
}

const ApiLogDetailModal: React.FC<ApiLogDetailModalProps> = ({ visible, onClose, apiLog }) => {
    if (!apiLog) return null;

    const getStatusColor = (status: number): string => {
        if (!status) return 'gray';
        if (status >= 500) return 'red';
        if (status >= 400) return 'orange';
        if (status >= 300) return 'blue';
        return 'green';
    };

    const formatDuration = (duration: string): string => {
        if (!duration) return '-';
        const ms = parseFloat(duration);
        if (ms < 1000) {
            return `${ms.toFixed(2)} milliseconds`;
        } else {
            return `${(ms / 1000).toFixed(2)} seconds`;
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <Tag color={getStatusColor(apiLog.status)}>
                        {apiLog.status}
                    </Tag>
                    API Log Details
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
                <Descriptions.Item label="Time">
                    <Text strong>{formatDateTime(apiLog.time)}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Status Code">
                    <Tag color={getStatusColor(apiLog.status)}>
                        {apiLog.status}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Host">
                    <Text copyable style={{ fontFamily: 'monospace' }}>
                        {apiLog.host}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Request">
                    <Text copyable style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                        {apiLog.request}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Duration">
                    <Text strong style={{ color: '#1890ff' }}>
                        {formatDuration(apiLog.duration)}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="IP Address">
                    <Text copyable style={{ fontFamily: 'monospace' }}>
                        {apiLog.ip || '-'}
                    </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Message">
                    <Paragraph
                        style={{
                            margin: 0,
                            padding: '12px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                            wordBreak: 'break-word',
                            fontFamily: 'monospace',
                            fontSize: '13px'
                        }}
                    >
                        {apiLog.message || '-'}
                    </Paragraph>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ApiLogDetailModal;