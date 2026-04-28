'use client';

import React from 'react';
import { Modal, List, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface CancellationPolicyModalProps {
    visible: boolean;
    onClose: () => void;
    policyPoints: string[];
}

const CancellationPolicyModal: React.FC<CancellationPolicyModalProps> = ({ visible, onClose, policyPoints }) => (
    <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        title={<Title level={4}>Cancellation Policy</Title>}
        width={500}
    >
        <List
            dataSource={policyPoints}
            renderItem={(item: string) => <List.Item><Paragraph>{item}</Paragraph></List.Item>}
        />
    </Modal>
);

export default CancellationPolicyModal;

