export interface Payment {
    _id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    bookingId: string;
    gatewayTransactionId?: string;
    gatewayOrderId?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        _id: string;
        username: string;
        email: string;
        avatar?: string;
    };
    tripTitle?: string;
    batchStartDate?: string;
}

export const PAYMENT_STATUS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
];

export const PAYMENT_METHODS = [
    { label: 'Card', value: 'card' },
    { label: 'Net Banking', value: 'netbanking' },
    { label: 'Wallet', value: 'wallet' },
    { label: 'UPI', value: 'upi' },
    { label: 'EMI', value: 'emi' },
    { label: 'Cardless EMI', value: 'cardless_emi' },
    { label: 'Pay Later', value: 'paylater' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
];

