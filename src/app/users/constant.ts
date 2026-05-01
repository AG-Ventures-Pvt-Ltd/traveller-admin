

export const USER_ROLES = {
  HOST: 'host',
  JOINEE: 'joinee',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_CONFIG: Record<UserRole, { color: string; text: string }> = {
  [USER_ROLES.HOST]: {
    color: 'purple',
    text: 'Host'
  },
  [USER_ROLES.JOINEE]: {
    color: 'green',
    text: 'Joinee'
  },
  [USER_ROLES.ADMIN]: {
    color: 'red',
    text: 'Admin'
  }
};

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

export const PLAN_CONFIG: Record<SubscriptionPlan, { color: string; text: string }> = {
  [SUBSCRIPTION_PLANS.FREE]: {
    color: 'default',
    text: 'Free'
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    color: 'blue',
    text: 'Basic'
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    color: 'gold',
    text: 'Pro'
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    color: 'purple',
    text: 'Enterprise'
  }
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
  phone: string;
  isVerified: boolean;
  createdAt: string;
}

