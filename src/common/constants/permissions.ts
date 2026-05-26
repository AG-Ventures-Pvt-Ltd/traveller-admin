export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  HOSTS: 'hosts',
  BOOKINGS: 'bookings',
  PRODUCTS: 'trips',
  ORDERS: 'stories',
  PAYMENTS: 'payments',
  USER_SUPPORT: 'usersupport',
  SETTINGS: 'settings',
  ADMIN_USERS: 'adminusers',
  ERROR_LOGS: 'errorlogs',
  API_LOGS: 'apilogs',
  API_ANALYTICS: 'apianalytics',
  SECURITY: 'security',
  SERVER_HEALTH: 'serverhealth',
  CONFIGS: 'configs',
  COUPONS: 'coupons',
  EMAILS: 'emails',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];