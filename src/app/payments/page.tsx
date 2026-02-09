'use client'
import React, { useState } from 'react';
import { Typography, Row, Col, Select, DatePicker, Button, Modal } from 'antd';
import type { TableProps } from 'antd';
import type { Dayjs } from 'dayjs';

import PaymentTable from './components/PaymentTable';
import { paymentColumns as basePaymentColumns } from './components/PaymentColumns';
import { PAYMENT_STATUS, PAYMENT_MODES, Payment } from './constants';

const { Title, Text } = Typography;

const initialPayments: Payment[] = [
    {
        payment_id: 'P001',
        trip_id: 'T101',
        date_time: new Date('2025-08-29T10:30:00'),
        status: PAYMENT_STATUS[0].value,
        name: 'John Doe',
        mode: PAYMENT_MODES[0].value,
        amount: 2500,
    },
    {
        payment_id: 'P002',
        trip_id: 'T102',
        date_time: new Date('2025-08-28T14:15:00'),
        status: PAYMENT_STATUS[1].value,
        name: 'Jane Smith',
        mode: PAYMENT_MODES[1].value,
        amount: 1800,
    },
    {
        payment_id: 'P003',
        trip_id: 'T103',
        date_time: new Date('2025-08-27T09:00:00'),
        status: PAYMENT_STATUS[2].value,
        name: 'Amit Kumar',
        mode: PAYMENT_MODES[2].value,
        amount: 3200,
    },
];

const Payments = () => {
    const [status, setStatus] = useState<string[]>([]);
    const [mode, setMode] = useState<string[]>([]);
    const [date, setDate] = useState<Dayjs | null>(null);
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [loading, setLoading] = useState(false);
    const [refundModal, setRefundModal] = useState<{ open: boolean; payment: string | null }>({ open: false, payment: null });

    // Filter logic
    const filteredPayments = payments.filter((payment: Payment) => {
        let match = true;
        if (status && status.length > 0) match = match && status.includes(payment.status);
        if (mode && mode.length > 0) match = match && mode.includes(payment.mode);
        if (date) {
            const paymentDate = new Date(payment.date_time);
            match = match &&
                paymentDate.getFullYear() === date.year() &&
                paymentDate.getMonth() === date.month() &&
                paymentDate.getDate() === date.date();
        }
        return match;
    });

    const resetFilters = () => {
        setStatus([]);
        setMode([]);
        setDate(null);
    };

    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setPayments([...initialPayments]); // Replace with real API call in production
            setLoading(false);
        }, 700);
    };

    // Add refund action
    const handleRefund = (payment_id: string) => {
        setRefundModal({ open: true, payment: payment_id });
    };

    const confirmRefund = () => {
        setLoading(true);
        setRefundModal({ open: false, payment: null });
        setTimeout(() => {
            setPayments(prev => prev.map(p => p.payment_id === refundModal.payment ? { ...p, status: PAYMENT_STATUS[2].value } : p));
            setLoading(false);
        }, 700);
    };

    // Extend columns with action
    // Center align all columns
    const paymentColumns: TableProps<Payment>['columns'] = [
        ...(basePaymentColumns || []).map(col => ({ ...col, align: 'center' as const })),
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) =>
                record.status === PAYMENT_STATUS[0].value ? (
                    <Button size="small" danger onClick={() => handleRefund(record.payment_id)} loading={loading}>
                        Refund
                    </Button>
                ) : null,
        },
    ];

    return (
        <div>
            <Title level={2} style={{ color: '#fff' }}>Payments</Title>
            <Text style={{ color: '#8c8c8c' }}>Manage payment methods and transactions.</Text>
            <div style={{ marginTop: 24, marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Status"
                            style={{ minWidth: 120 }}
                            value={status}
                            onChange={setStatus}
                            options={PAYMENT_STATUS.map(s => ({ label: s.label, value: s.value }))}
                        />
                    </Col>
                    <Col>
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Mode"
                            style={{ minWidth: 120 }}
                            value={mode}
                            onChange={setMode}
                            options={PAYMENT_MODES.map(m => ({ label: m.label, value: m.value }))}
                        />
                    </Col>
                    <Col>
                        <DatePicker
                            allowClear
                            placeholder="Date"
                            value={date}
                            onChange={setDate}
                            style={{ minWidth: 120 }}
                        />
                    </Col>
                    <Col>
                        <Button onClick={resetFilters}>Reset</Button>
                    </Col>
                    <Col>
                        <Button onClick={handleRefresh} loading={loading} type="primary">Refresh</Button>
                    </Col>
                </Row>
            </div>
            <div style={{ marginTop: 8 }}>
                <PaymentTable columns={paymentColumns} data={filteredPayments} loading={loading} />
            </div>
            <Modal
                open={refundModal.open}
                onOk={confirmRefund}
                onCancel={() => setRefundModal({ open: false, payment: null })}
                okText="Confirm Refund"
                cancelText="Cancel"
                centered
                title="Confirm Refund"
                confirmLoading={loading}
            >
                Are you sure you want to refund this payment?
            </Modal>
        </div>
    );
};

export default Payments;