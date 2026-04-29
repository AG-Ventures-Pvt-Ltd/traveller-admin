import { PRIORITY_LEVELS, STATUS_CONFIG, Ticket } from "../../constant";
import { Card, Tag, Space, Avatar, Typography, Badge } from "antd";
import { ExternalLink, MessageSquare, Clock } from 'lucide-react';
import type { PresetStatusColorType } from 'antd/es/_util/colors';

interface TicketCardProps {
  ticket: Ticket;
  handleTicketClick: (ticket: Ticket) => void;
}

export const TicketCard = ({ ticket, handleTicketClick }: TicketCardProps) => {

  const { Title, Text, Paragraph } = Typography;

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      hoverable
      onClick={() => handleTicketClick(ticket)}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer'
      }}
      styles={{ body: { padding: '20px' } }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Title level={5} className="!text-white m-0 mb-2">
            #{ticket?._id} - {ticket?.type}
          </Title>
          <Text type="secondary" className="text-xs flex items-center">
            <Clock size={12} className="mr-1" />
            {formatRelativeTime(ticket?.createdAt)}
          </Text>
        </div>
        <Space direction="vertical" align="end" size={4}>
          <Badge
            status={STATUS_CONFIG[ticket?.status].color as PresetStatusColorType}
            text={STATUS_CONFIG[ticket?.status].text}
            style={{ color: '#fff' }}
          />
          <Tag color={PRIORITY_LEVELS[ticket?.priority?.toUpperCase()]?.color} >
            {PRIORITY_LEVELS[ticket?.priority?.toUpperCase()]?.text || ticket?.priority}
          </Tag>
        </Space>
      </div>

      <Paragraph
        ellipsis={{ rows: 2 }}
        className="text-[#8c8c8c] text-sm mb-4"
      >
        {ticket?.description}
      </Paragraph>

      <div className="flex justify-between items-center">
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>

          </Avatar>
          <div>
            <Text className="!text-white text-xs block">
              {ticket?._id}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {ticket?._id}
            </Text>
          </div>
        </Space>
        <Space size={16} direction="vertical">
          <span className="text-[#8c8c8c] text-xs flex items-center">
            <MessageSquare size={16} className="mr-1" />
          </span>
          {(ticket?.attachments) && (
            <ExternalLink size={16} className="text-[#1890ff]" />
          )}
        </Space>
      </div>
    </Card>
  )
}