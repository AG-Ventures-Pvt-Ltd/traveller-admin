
export const USER_ROLES = {
  HOST: 'host',
  JOINEE: 'joinee'
};

export const ROLE_CONFIG = {
  [USER_ROLES.HOST]: {
    color: 'purple',
    text: 'Host'
  },
  [USER_ROLES.JOINEE]: {
    color: 'green',
    text: 'Joinee'
  }
};

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

export const PLAN_CONFIG = {
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
};
