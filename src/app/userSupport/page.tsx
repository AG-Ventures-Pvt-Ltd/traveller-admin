'use client'
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Pagination,
  Typography,
  Empty,
  ConfigProvider,
  theme,
  message,
  Button
} from 'antd';
import {
  Filter,
  Calendar,
  ChevronUp,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { STATUS_CONFIG, SORT_OPTIONS, PRIORITY_LEVELS, Ticket, TicketStatus, SortOption } from './constant';
import { TicketCard } from './components/TicketCard/TicketCard';
import { TicketModal } from './components/TicketModal/TicketModal';
import { useGetData } from '../../services/useGetData'
import { api } from '../../common/constants/api.urls';
import dayjs, { Dayjs } from 'dayjs';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Define the response type for useGetData
interface TicketsResponse {
  data: Ticket[];
  totalItems: number;
}

const UserSupport = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  // RangePicker value type
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.DATE_DESC);

  // useGetData returns { data: TicketsResponse } basically, but it's typed as any in the hook (or we can cast it)
  // Assuming useGetData returns the fetched data directly as constructed in the hook
  const { data, isLoading, refetch } = useGetData({
    key: ['support_tickets_data', String(currentPage), String(pageSize)],
    url: `${api.getSupportTickets}?page=${currentPage}&limit=${pageSize}`
  }) as { data: TicketsResponse | undefined, isLoading: boolean, refetch: () => void };



  const handleSendReply = () => {
    if (!replyText.trim()) {
      message.warning('Please enter a reply message');
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      message: replyText,
      timestamp: new Date().toISOString(),
      attachments: null
    };

    if (!selectedTicket) return;

    const updatedTicket: Ticket = {
      ...selectedTicket,
      messages: [...(selectedTicket.messages || []), newMessage],
      updatedAt: new Date().toISOString()
    };
    const updatedTickets = tickets.map(ticket =>
      ticket._id === selectedTicket._id ? updatedTicket : ticket
    );

    setTickets(updatedTickets);
    setSelectedTicket(updatedTicket);
    setReplyText('');
    message.success('Reply sent successfully');
  };


  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (dateRange?.[0] && dateRange?.[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate >= startDate && ticketDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.DATE_ASC:
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case SORT_OPTIONS.DATE_DESC:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case SORT_OPTIONS.PRIORITY_ASC:
          return PRIORITY_LEVELS[a.priority]?.value - PRIORITY_LEVELS[b.priority]?.value || 0;
        case SORT_OPTIONS.PRIORITY_DESC:
          return PRIORITY_LEVELS[b.priority]?.value - PRIORITY_LEVELS[a.priority]?.value || 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [tickets, statusFilter, dateRange, sortBy]);


  useEffect(() => {
    if (data) {
    
      const ticketsData = data?.data?.data?.data || [];
    
      setTickets(ticketsData);
    }
  }, [data]);


  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
    setReplyText('');
  };




  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div
        className="min-h-screen p-6"
        style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}
      >
        <div className="mb-6">
          <Title level={2} className="!text-white mb-2">
            Support Tickets
          </Title>
          <Text type="secondary">
            Manage and respond to customer support requests
          </Text>
        </div>

        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong className="!text-white block mb-2">
                  <Filter size={16} className="inline mr-2" />
                  Status Filter
                </Text>
                <Select value={statusFilter} onChange={setStatusFilter} className="w-full">
                  <Option value="all">All Statuses</Option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.text}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div>
                <Text strong className="!text-white block mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date Range
                </Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                  className="w-full"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong className="!text-white block mb-2">Sort By</Text>
                <Select value={sortBy} onChange={setSortBy} className="w-full">
                  <Option value={SORT_OPTIONS.DATE_DESC}>
                    <ChevronDown size={14} className="inline mr-2" />
                    Newest First
                  </Option>
                  <Option value={SORT_OPTIONS.DATE_ASC}>
                    <ChevronUp size={14} className="inline mr-2" />
                    Oldest First
                  </Option>
                  <Option value={SORT_OPTIONS.PRIORITY_DESC}>Priority: High to Low</Option>
                  <Option value={SORT_OPTIONS.PRIORITY_ASC}>Priority: Low to High</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <div className="text-right">
                <Text strong className="!text-white block mb-2">
                  Refetch
                </Text>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<RefreshCw size={18} />}
                  onClick={() => refetch()}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <div className="text-right">
                <Text strong className="!text-white block mb-2">
                  Results
                </Text>
                <Text className="text-[#1890ff] text-lg font-bold">
                  {filteredTickets.length}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  {isLoading ? 'Loading tickets...' : 'No tickets found with current filters'}
                </Text>
              }
            />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              {filteredTickets.map((ticket) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={ticket._id}>
                  <TicketCard ticket={ticket} handleTicketClick={handleTicketClick} />
                </Col>
              ))}
            </Row>

            <div className="text-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={data?.totalItems}
                onChange={setCurrentPage}
                onShowSizeChange={(current, size) => {
                  setCurrentPage(1);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} tickets`}
                pageSizeOptions={['6', '12', '24', '48', '96']}
              />
            </div>
          </>
        )}

        <TicketModal
          handleSendReply={handleSendReply}
          modalVisible={modalVisible}
          selectedTicket={selectedTicket}
          replyText={replyText}
          setModalVisible={setModalVisible}
          setReplyText={setReplyText}
        />
      </div>
    </ConfigProvider>
  );
}

export default UserSupport;