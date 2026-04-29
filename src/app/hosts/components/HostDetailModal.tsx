'use client'

import React from 'react';
import {
    Card,
    Space,
    Tag,
    Avatar,
    Modal,
    Row,
    Col,
    Typography,
    Badge,
    Divider,
    List,
    Empty,
} from 'antd';
import {
    Mail,
    Phone,
    MapPin,
    Briefcase,
    FileText,
    CreditCard,
    Share2,
    CheckCircle,
    Building,
} from 'lucide-react';

const { Text } = Typography;

interface SocialMedia {
    _id: string;
    platform: string;
    url: string;
}

interface PaymentDetails {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    accountHolderName?: string;
}

interface Location {
    city?: string;
    state?: string;
    country?: string;
}

interface Host {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
    fullName?: string;
    contactNumber?: string;
    type?: string;
    isEmailVerified?: boolean;
    isProfileVerified?: boolean;
    gstnumber?: string;
    panCardNumber?: string;
    yearsOfExperience?: number;
    location?: Location;
    companyDocuments?: Array<{ name?: string; url?: string } | string>;
    socialMedias?: SocialMedia[];
    paymentDetails?: PaymentDetails;
    profile?: {
        mobileNumber?: string;
        countryCode?: string;
    };
}

interface HostDetailModalProps {
    selectedHost: Host | null;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
}

export const HostDetailModal: React.FC<HostDetailModalProps> = ({
    selectedHost,
    modalVisible,
    setModalVisible,
}) => {
    if (!selectedHost) return null;

    const displayName = selectedHost.fullName || selectedHost.username || 'N/A';
    const phone = selectedHost.contactNumber ||
        (selectedHost.profile?.countryCode && selectedHost.profile?.mobileNumber
            ? `${selectedHost.profile.countryCode} ${selectedHost.profile.mobileNumber}`
            : selectedHost.profile?.mobileNumber) ||
        'N/A';

    return (
        <Modal
            title={
                <Space>
                    <Avatar
                        size={40}
                        src={selectedHost.avatar}
                        style={{ backgroundColor: '#1890ff' }}
                    >
                        {displayName[0]?.toUpperCase() || 'H'}
                    </Avatar>
                    <div>
                        <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
                            {displayName}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            @{selectedHost.username || 'N/A'}
                        </div>
                    </div>
                </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            width={900}
            footer={null}
            styles={{
                mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                body: { backgroundColor: '#1f1f1f' },
            }}
        >
            <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingTop: '16px' }}>
                <Row gutter={[16, 16]}>
                    {/* Contact Information */}
                    <Col span={12}>
                        <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                    <Mail size={16} style={{ marginRight: '8px' }} />
                                    Contact Information
                                </Text>
                                <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                <div>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Email</Text>
                                    <Text style={{ color: '#fff' }}>{selectedHost.email || 'N/A'}</Text>
                                </div>

                                <div>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Phone Number</Text>
                                    <Text style={{ color: '#fff' }}>
                                        <Phone size={14} style={{ marginRight: '6px' }} />
                                        {phone}
                                    </Text>
                                </div>

                                {selectedHost.type && (
                                    <div>
                                        <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Type</Text>
                                        <Tag color="blue">{selectedHost.type}</Tag>
                                    </div>
                                )}

                                <div>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Created At</Text>
                                    <Text style={{ color: '#fff' }}>
                                        {selectedHost.createdAt
                                            ? new Date(selectedHost.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Verification Status */}
                    <Col span={12}>
                        <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                    <CheckCircle size={16} style={{ marginRight: '8px' }} />
                                    Verification Status
                                </Text>
                                <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                <div>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Verified</Text>
                                    {(selectedHost.isVerified ?? selectedHost.isProfileVerified) ? (
                                        <Badge
                                            status="success"
                                            text={<span style={{ color: '#52c41a' }}>Verified</span>}
                                        />
                                    ) : (
                                        <Badge
                                            status="error"
                                            text={<span style={{ color: '#ff4d4f' }}>Not Verified</span>}
                                        />
                                    )}
                                </div>

                                {selectedHost.isEmailVerified !== undefined && (
                                    <div>
                                        <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Email Verification</Text>
                                        {selectedHost.isEmailVerified ? (
                                            <Badge
                                                status="success"
                                                text={<span style={{ color: '#52c41a' }}>Verified</span>}
                                            />
                                        ) : (
                                            <Badge
                                                status="error"
                                                text={<span style={{ color: '#ff4d4f' }}>Not Verified</span>}
                                            />
                                        )}
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    {/* Business Information */}
                    <Col span={12}>
                        <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                    <Building size={16} style={{ marginRight: '8px' }} />
                                    Business Information
                                </Text>
                                <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                {selectedHost?.gstnumber ? (
                                    <div>
                                        <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>GST Number</Text>
                                        <Text style={{ color: '#fff' }}>{selectedHost.gstnumber}</Text>
                                    </div>
                                ) : selectedHost?.panCardNumber ? (
                                    <div>
                                        <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>PAN Card Number</Text>
                                        <Text style={{ color: '#fff' }}>{selectedHost.panCardNumber}</Text>
                                    </div>
                                ) : (
                                    <Text style={{ color: '#8c8c8c' }}>No tax details available</Text>
                                )}

                                <div>
                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Years of Experience</Text>
                                    <Text style={{ color: '#fff' }}>
                                        <Briefcase size={14} style={{ marginRight: '6px' }} />
                                        {selectedHost.yearsOfExperience
                                            ? `${selectedHost.yearsOfExperience} years`
                                            : 'N/A'}
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Location */}
                    <Col span={12}>
                        <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                    <MapPin size={16} style={{ marginRight: '8px' }} />
                                    Location
                                </Text>
                                <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                {selectedHost.location ? (
                                    <>
                                        {selectedHost.location.city && (
                                            <div>
                                                <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>City</Text>
                                                <Text style={{ color: '#fff' }}>{selectedHost.location.city}</Text>
                                            </div>
                                        )}
                                        {selectedHost.location.state && (
                                            <div>
                                                <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>State</Text>
                                                <Text style={{ color: '#fff' }}>{selectedHost.location.state}</Text>
                                            </div>
                                        )}
                                        {selectedHost.location.country && (
                                            <div>
                                                <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Country</Text>
                                                <Text style={{ color: '#fff' }}>{selectedHost.location.country}</Text>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Text style={{ color: '#8c8c8c' }}>No location details available</Text>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    {/* Company Documents */}
                    {selectedHost.companyDocuments !== undefined && (
                        <Col span={24}>
                            <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                        <FileText size={16} style={{ marginRight: '8px' }} />
                                        Company Documents
                                    </Text>
                                    <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                    {selectedHost.companyDocuments && selectedHost.companyDocuments.length > 0 ? (
                                        <List
                                            size="small"
                                            dataSource={selectedHost.companyDocuments}
                                            renderItem={(doc) => {
                                                const docObj = typeof doc === 'string' ? { url: doc } : doc;
                                                return (
                                                    <List.Item
                                                        style={{
                                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                                            padding: '8px 0',
                                                        }}
                                                    >
                                                        <Space>
                                                            <FileText size={14} style={{ color: '#1890ff' }} />
                                                            <a
                                                                href={docObj.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: '#1890ff' }}
                                                            >
                                                                {docObj.name ||
                                                                    (typeof docObj.url === 'string'
                                                                        ? docObj.url.split('/').pop()
                                                                        : 'Document')}
                                                            </a>
                                                        </Space>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    ) : (
                                        <Empty
                                            description={
                                                <span style={{ color: '#8c8c8c' }}>No documents available</span>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    )}

                    {/* Social Media */}
                    {selectedHost.socialMedias !== undefined && (
                        <Col span={12}>
                            <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                        <Share2 size={16} style={{ marginRight: '8px' }} />
                                        Social Media
                                    </Text>
                                    <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                    {selectedHost.socialMedias && selectedHost.socialMedias.length > 0 ? (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            {selectedHost.socialMedias.map((sm) => (
                                                <div key={sm._id}>
                                                    <Text
                                                        style={{
                                                            color: '#8c8c8c',
                                                            fontSize: '12px',
                                                            display: 'block',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {sm.platform}
                                                    </Text>
                                                    <a
                                                        href={sm.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#1890ff', wordBreak: 'break-all' }}
                                                    >
                                                        {sm.url}
                                                    </a>
                                                </div>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text style={{ color: '#8c8c8c' }}>No social media links available</Text>
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    )}

                    {/* Payment Details */}
                    {selectedHost.paymentDetails !== undefined && (
                        <Col span={12}>
                            <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                        <CreditCard size={16} style={{ marginRight: '8px' }} />
                                        Payment Details
                                    </Text>
                                    <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                    {selectedHost.paymentDetails ? (
                                        <>
                                            {selectedHost.paymentDetails.accountNumber && (
                                                <div>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>
                                                        Account Number
                                                    </Text>
                                                    <Text style={{ color: '#fff' }}>
                                                        {selectedHost.paymentDetails.accountNumber}
                                                    </Text>
                                                </div>
                                            )}
                                            {selectedHost.paymentDetails.ifscCode && (
                                                <div>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>
                                                        IFSC Code
                                                    </Text>
                                                    <Text style={{ color: '#fff' }}>
                                                        {selectedHost.paymentDetails.ifscCode}
                                                    </Text>
                                                </div>
                                            )}
                                            {selectedHost.paymentDetails.bankName && (
                                                <div>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>
                                                        Bank Name
                                                    </Text>
                                                    <Text style={{ color: '#fff' }}>
                                                        {selectedHost.paymentDetails.bankName}
                                                    </Text>
                                                </div>
                                            )}
                                            {selectedHost.paymentDetails.accountHolderName && (
                                                <div>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>
                                                        Account Holder Name
                                                    </Text>
                                                    <Text style={{ color: '#fff' }}>
                                                        {selectedHost.paymentDetails.accountHolderName}
                                                    </Text>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Text style={{ color: '#8c8c8c' }}>No payment details available</Text>
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>
        </Modal>
    );
};
