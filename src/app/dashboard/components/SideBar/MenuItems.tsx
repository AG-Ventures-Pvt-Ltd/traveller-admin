import React from 'react';
import {
  Home, Users, ShoppingCart, Shield, Package, CreditCard,
  Headset, AlertTriangle, Activity, Server, Building2, Settings, Tag, Mail, BarChart2, MapPin, BookOpen, TrendingUp, Link2, PiggyBank
} from 'lucide-react';
import { PERMISSIONS, Permission } from '@/common/constants/permissions';

export type PermissionedItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission?: Permission;
  children?: PermissionedItem[];
};

export const MenuItems: PermissionedItem[] = [
  {
    key: 'dashboard',
    icon: <Home size={18} />,
    label: 'Dashboard',
    permission: PERMISSIONS.DASHBOARD,
  },
  {
    key: 'people',
    icon: <Users size={18} />,
    label: 'People',
    children: [
      {
        key: 'users',
        icon: <Users size={16} />,
        label: 'Users',
        permission: PERMISSIONS.USERS,
      },
      {
        key: 'hosts',
        icon: <Building2 size={16} />,
        label: 'Hosts',
        permission: PERMISSIONS.HOSTS,
      },
      {
        key: 'AdminUser',
        icon: <Shield size={16} />,
        label: 'Admin Users',
        permission: PERMISSIONS.ADMIN_USERS,
      },
    ],
  },
  {
    key: 'commerce',
    icon: <ShoppingCart size={18} />,
    label: 'Commerce',
    children: [
      {
        key: 'trips',
        icon: <Package size={16} />,
        label: 'Trips',
        permission: PERMISSIONS.PRODUCTS,
      },
      {
        key: 'bookings',
        icon: <ShoppingCart size={16} />,
        label: 'Bookings',
        permission: PERMISSIONS.BOOKINGS,
      },
      {
        key: 'payments',
        icon: <CreditCard size={16} />,
        label: 'Payments',
        permission: PERMISSIONS.PAYMENTS,
      },
      {
        key: 'coupons',
        icon: <Tag size={16} />,
        label: 'Coupons',
        permission: PERMISSIONS.COUPONS,
      },
      {
        key: 'links',
        icon: <Link2 size={16} />,
        label: 'Links',
        permission: PERMISSIONS.LINKS,
      },
      {
        key: 'sip-plans',
        icon: <PiggyBank size={16} />,
        label: 'SIP Plans',
        permission: PERMISSIONS.SIP_PLANS,
      },
    ],
  },
  {
    key: 'blogs',
    icon: <BookOpen size={18} />,
    label: 'Blogs',
    permission: PERMISSIONS.BLOGS,
  },
  {
    key: 'userSupport',
    icon: <Headset size={18} />,
    label: 'Support',
    permission: PERMISSIONS.USER_SUPPORT,
  },
  {
    key: 'system',
    icon: <Server size={18} />,
    label: 'System',
    children: [
      {
        key: 'errorLogs',
        icon: <AlertTriangle size={16} />,
        label: 'Error Logs',
        permission: PERMISSIONS.ERROR_LOGS,
      },
      {
        key: 'apiLogs',
        icon: <Activity size={16} />,
        label: 'API Logs',
        permission: PERMISSIONS.API_LOGS,
      },
      {
        key: 'apiAnalytics',
        icon: <BarChart2 size={16} />,
        label: 'API Analytics',
        permission: PERMISSIONS.API_ANALYTICS,
      },
      {
        key: 'serverHealth',
        icon: <Server size={16} />,
        label: 'Server Health',
        permission: PERMISSIONS.SERVER_HEALTH,
      },
      {
        key: 'configs',
        icon: <Settings size={16} />,
        label: 'App Config',
        permission: PERMISSIONS.CONFIGS,
      },
      {
        key: 'emails',
        icon: <Mail size={16} />,
        label: 'Emails',
        permission: PERMISSIONS.EMAILS,
      },
      {
        key: 'locationAnalytics',
        icon: <MapPin size={16} />,
        label: 'Locations',
        permission: PERMISSIONS.LOCATION_ANALYTICS,
      },
      {
        key: 'tripAnalytics',
        icon: <TrendingUp size={16} />,
        label: 'Trip Analytics',
        permission: PERMISSIONS.TRIP_ANALYTICS,
      },
    ],
  },
];
