import React from 'react';
import {
  Home, Users, ShoppingCart, BarChart3, FileText, Shield, Package, CreditCard,
  User, Headset, AlertTriangle, Activity, Server, Building2
} from 'lucide-react';
import { PERMISSIONS } from '@/common/constants/permissions';


export const MenuItems = [
  {
    key: 'dashboard',
    icon: <Home size={18} />,
    label: 'Dashboard',
    permission: PERMISSIONS.DASHBOARD
  },
  {
    key: 'users',
    icon: <Users size={18} />,
    label: 'Users',
    permission: PERMISSIONS.USERS
  },
  {
    key: 'hosts',
    icon: <Building2 size={18} />,
    label: 'Hosts',
    permission: PERMISSIONS.HOSTS
  },
  {
    key: 'trips',
    icon: <Package size={18} />,
    label: 'Trips',
    permission: PERMISSIONS.PRODUCTS
  },
  {
    key: 'bookings',
    icon: <ShoppingCart size={18} />,
    label: 'Bookings',
    permission: PERMISSIONS.BOOKINGS
  },
  // {
  //   key: 'analytics',
  //   icon: <BarChart3 size={18} />,
  //   label: 'Analytics',
  //   permission: PERMISSIONS.ANALYTICS
  // },
  // {
  //   key: 'reports',
  //   icon: <FileText size={18} />,
  //   label: 'Reports',
  //   permission: PERMISSIONS.REPORTS
  // },
  {
    key: 'userSupport',
    icon: <Headset size={18} />,
    label: 'User Queries',
    permission: PERMISSIONS.USER_SUPPORT
  },
  {
    key: 'payments',
    icon: <CreditCard size={18} />,
    label: 'Payments',
    permission: PERMISSIONS.PAYMENTS
  },
  {
    key: 'AdminUser',
    icon: <Shield size={18} />,
    label: 'Admin Users',
    permission: PERMISSIONS.ADMIN_USERS
  },
  {
    key: 'errorLogs',
    icon: <AlertTriangle size={18} />,
    label: 'Error Logs',
    permission: PERMISSIONS.ERROR_LOGS
  },
  {
    key: 'apiLogs',
    icon: <Activity size={18} />,
    label: 'API Logs',
    permission: PERMISSIONS.API_LOGS
  },
  {
    key: 'serverhealth',
    icon: <Server size={18} />,
    label: 'Server Health',
    permission: PERMISSIONS.SERVER_HEALTH
  },

];
