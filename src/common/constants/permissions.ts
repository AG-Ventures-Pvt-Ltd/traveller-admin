export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  HOSTS: 'hosts',
  BOOKINGS: 'bookings',
  PRODUCTS: 'trips',
  ORDERS: 'stories',
  // ANALYTICS: 'analytics',
  // REPORTS: 'reports',
  PAYMENTS: 'payments',
  USER_SUPPORT: 'usersupport',
  SETTINGS: 'settings',
  ADMIN_USERS: 'adminusers',
  ERROR_LOGS: 'reports',
  API_LOGS: 'analytics',
  SECURITY: 'security',
  SERVER_HEALTH: 'serverhealth',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];