import { USER_STATUS, PLAN_CONFIG, ROLE_CONFIG, UserStatus, User } from '../constant'
import { formatCurrency, formatDate } from '../../../common/utils/date'
import { CheckCircle, User as UserIcon, Ban } from 'lucide-react';
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
} from 'antd';
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import {
  Mail,
} from 'lucide-react';

interface UserDetailModalProps {
  selectedUser: User | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

interface StatusConfigItem {
  color: PresetStatusColorType | 'default';
  text: string;
  icon: React.ReactNode;
}

export const UserDetailModal = ({ selectedUser, modalVisible, setModalVisible }: UserDetailModalProps) => {
  const STATUS_CONFIG: Record<UserStatus, StatusConfigItem> = {
    [USER_STATUS.ACTIVE]: {
      color: 'success',
      text: 'Active',
      icon: <CheckCircle size={14} />
    },
    [USER_STATUS.INACTIVE]: {
      color: 'default',
      text: 'Inactive',
      icon: <UserIcon size={14} />
    },
    [USER_STATUS.SUSPENDED]: {
      color: 'error',
      text: 'Suspended',
      icon: <Ban size={14} />
    },
  };


  const { Text } = Typography;

  return (
    <Modal
      title={
        <Space>
          <Avatar src={selectedUser?.avatar} size={32}>
            {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
          </Avatar>
          <span style={{ color: '#fff' }}>
            {selectedUser?.fullName}
          </span>
        </Space>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      width={700}
      footer={null}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        body: { backgroundColor: '#1f1f1f' }
      }}
    >
      {selectedUser && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Contact Information</Text>
                  <div className='flex items-center'>
                    <Mail size={14} style={{ marginRight: '8px', color: '#8c8c8c' }} />
                    <Text style={{ color: '#8c8c8c' }}>{selectedUser.email}</Text>
                  </div>
                  <div>
                    <Text style={{ color: '#8c8c8c' }}>{selectedUser.phone}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Account Status</Text>
                  <div className='flex gap-4'>
                    <Badge
                      status={STATUS_CONFIG[selectedUser.status].color as PresetStatusColorType}
                      text={STATUS_CONFIG[selectedUser.status].text}
                    />
                    <div>
                      {selectedUser.isVerified ? (
                        <Tag color="success">Verified</Tag>
                      ) : (
                        <Tag color="warning">Unverified</Tag>
                      )}
                    </div>
                  </div>
                  <div>
                    <Tag color={ROLE_CONFIG[selectedUser.role].color}>
                      {ROLE_CONFIG[selectedUser.role].text}
                    </Tag>
                    <Tag color={PLAN_CONFIG[selectedUser.plan].color}>
                      {PLAN_CONFIG[selectedUser.plan].text}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Activity</Text>
                  <div>
                    <Text style={{ color: '#8c8c8c' }}>
                      Total Trips: <Text style={{ color: '#fff' }}>{selectedUser.totalOrders}</Text>
                    </Text>
                  </div>
                  <div>
                    <Text style={{ color: '#8c8c8c' }}>
                      Total Spent: <Text style={{ color: '#fff' }}>{formatCurrency(selectedUser.totalSpent)}</Text>
                    </Text>
                  </div>
                  <div>
                    <Text style={{ color: '#8c8c8c' }}>
                      Avg. Order: <Text style={{ color: '#fff' }}>
                        {selectedUser.totalOrders > 0
                          ? formatCurrency(selectedUser.totalSpent / selectedUser.totalOrders)
                          : '$0.00'
                        }
                      </Text>
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#fff' }}>Dates</Text>
                  <div>
                    <Text style={{ color: '#8c8c8c' }}>
                      Joined: <Text style={{ color: '#fff' }}>{formatDate(selectedUser.createdAt)}</Text>
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  )
}