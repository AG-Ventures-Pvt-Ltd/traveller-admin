import React from 'react'
import { PRIORITY_LEVELS, Ticket } from '../../constant';
import { Modal, Space, Tag, Card, Row, Col, Typography, Input, Button, Image } from 'antd';
import { Send, Eye } from 'lucide-react';

interface TicketModalProps {
  handleSendReply: () => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedTicket: Ticket | null;
  replyText: string;
  setReplyText: (text: string) => void;
}

export const TicketModal = ({ handleSendReply, modalVisible, setModalVisible, selectedTicket, replyText, setReplyText }: TicketModalProps) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const { Title, Text, Paragraph } = Typography;
  const { TextArea } = Input;

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-white">
            Ticket #{selectedTicket?._id} - {selectedTicket?.type}
          </span>
        </div>
      }
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      width={800}
      footer={null}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        body: { backgroundColor: '#1f1f1f' }
      }}
    >
      {selectedTicket && (
        <div className="max-h-[70vh] overflow-y-auto">
          <Card
            size="small"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '16px'
            }}
          >
            <Row gutter={36}>
              <Col span={8}>
                <Text strong className="text-white">Customer:</Text>
                <br />
                <Space>
                  {/* <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                    {selectedTicket?.user.avatar}
                  </Avatar> */}
                  <div>
                    <Text className="text-white">{selectedTicket?.createdBy}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{selectedTicket?.createdBy}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={8}>
                <Text strong className="text-white">Created:</Text>
                <br />
                <Text type="secondary">{formatDate(selectedTicket?.createdAt)}</Text>
              </Col>
              <Col span={8}>
                <Text strong className="text-white">Priority:</Text>
                <br />
                <Tag color={PRIORITY_LEVELS[selectedTicket?.priority.toUpperCase()]?.color}>
                  {PRIORITY_LEVELS[selectedTicket?.priority.toUpperCase()]?.text}
                </Tag>
              </Col>
            </Row>
          </Card>

          <div className="mb-5">
            <Card
              size="small"
              style={{
                background: 'rgba(24, 144, 255, 0.1)',
                border: '1px solid rgba(24, 144, 255, 0.2)',
                marginBottom: '12px'
              }}
            >
              <Title level={5} className="text-white mb-4">Query :</Title>
              <Paragraph className={`text-white ${selectedTicket?.attachments ? 'mb-3' : 'mb-0'}`}>
                {selectedTicket?.description}
              </Paragraph>
              {selectedTicket.attachments && (
                <div>
                  <Title level={5} className="text-white mb-2">Attachments:</Title>
                  <Space wrap>
                    {selectedTicket?.attachments.map((url, imgIndex) => (
                      <Image
                        key={imgIndex}
                        width={100}
                        height={75}
                        src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}${url}`}
                        className="object-cover rounded"
                        preview={{
                          mask: <Eye size={16} className="text-white" />
                        }}
                      />
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          </div>
          <Card
            title={
              <span className="text-white flex items-center">
                <Send size={16} className="mr-2" />
                Send Reply
              </span>
            }
            size="small"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <TextArea
              rows={4}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                marginBottom: '12px'
              }}
            />
            <div className="text-right">
              <Button
                type="primary"
                icon={<Send size={16} />}
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                Send Reply
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  )
}
