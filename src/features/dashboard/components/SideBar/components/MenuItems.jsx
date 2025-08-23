import React from 'react';
import {
    Home, Users, ShoppingCart, BarChart3, FileText, Shield, Package, CreditCard,
    User, Headset
} from 'lucide-react';
import { PERMISSIONS } from '../../../constants';


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
      key: 'trips',
      icon: <Package size={18} />,
      label: 'Trips',
      permission: PERMISSIONS.PRODUCTS
    },
    {
      key: 'orders',
      icon: <ShoppingCart size={18} />,
      label: 'Orders',
      permission: PERMISSIONS.ORDERS
    },
    {
      key: 'analytics',
      icon: <BarChart3 size={18} />,
      label: 'Analytics',
      permission: PERMISSIONS.ANALYTICS
    },
    {
      key: 'reports',
      icon: <FileText size={18} />,
      label: 'Reports',
      permission: PERMISSIONS.REPORTS
    },
    {
      key: 'userSupport',
      icon: <Headset size={18} />,
      label: 'User Queries',
      permission: PERMISSIONS.REPORTS
    },
    {
      key: 'payments',
      icon: <CreditCard size={18} />,
      label: 'Payments',
      permission: PERMISSIONS.PAYMENTS
    },
    {
      key: 'adminusers',
      icon: <Shield size={18} />,
      label: 'Admin Users',
      permission: PERMISSIONS.ADMIN_USERS
  },

  ];
