export interface SipCadenceAmounts {
    daily: number;
    weekly: number;
    monthly: number;
}

export interface SipPlan {
    _id: string;
    name: string;
    description?: string;
    targetAmount: number;
    totalPayout: number;
    // Absent on plans created before the per-cadence-amount migration.
    cadenceAmounts?: SipCadenceAmounts;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface SipSubscriber {
    _id: string;
    user?: { _id: string; fullName: string; email: string; username: string };
    gateway: 'razorpay' | 'cashfree';
    installmentAmount: number;
    cadence: 'daily' | 'weekly' | 'monthly';
    status: 'pending_auth' | 'active' | 'completed' | 'cancelled' | 'failed_auth';
    cumulativePaidAmount: number;
    targetAmount: number;
    startDate?: string;
    consecutiveMissedInstallments: number;
}

export const SIP_PLAN_STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export const SIP_SUBSCRIPTION_STATUS_COLORS: Record<SipSubscriber['status'], string> = {
    pending_auth: 'gold',
    active: 'success',
    completed: 'blue',
    cancelled: 'default',
    failed_auth: 'error',
};

export const SIP_GATEWAY_COLORS: Record<SipSubscriber['gateway'], string> = {
    razorpay: 'geekblue',
    cashfree: 'purple',
};
