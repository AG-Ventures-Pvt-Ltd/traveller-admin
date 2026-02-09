import type { TableProps } from 'antd';
import { PAYMENT_STATUS, PAYMENT_MODES, Payment } from '../constants';
import { formatDateTime } from '../utils';

export const paymentColumns: TableProps<Payment>['columns'] = [
  {
    title: 'Payment ID',
    dataIndex: 'payment_id',
    key: 'payment_id',
  },
  {
    title: 'Trip ID',
    dataIndex: 'trip_id',
    key: 'trip_id',
  },
  {
    title: 'Date & Time',
    dataIndex: 'date_time',
    key: 'date_time',
    render: (date: Date) => formatDateTime(date),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: PAYMENT_STATUS.map(s => ({ text: s.label, value: s.value })),
    onFilter: (value, record) => record.status === value,
    render: (status: string) => {
      let color = 'green';
      if (status === 'failed') color = 'red';
      if (status === 'refunded') color = 'orange';
      const label = PAYMENT_STATUS.find(s => s.value === status)?.label || status;
      return <span style={{ color }}>{label}</span>;
    },
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => name,
  },
  {
    title: 'Mode',
    dataIndex: 'mode',
    key: 'mode',
    filters: PAYMENT_MODES.map(m => ({ text: m.label, value: m.value })),
    onFilter: (value, record) => record.mode === value,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number) => `₹${amount}`,
  },
];
