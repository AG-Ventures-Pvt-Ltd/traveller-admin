# Traveller Admin - Structure Overview

## 1. Overall App Structure & Routing

### Tech Stack
- **Framework**: Next.js 16.1.4 with App Router
- **UI Library**: Ant Design (v6.2.1) + Tailwind CSS
- **State Management**: Zustand (for auth)
- **Data Fetching**: React Query (TanStack Query v5)
- **HTTP Client**: Axios with interceptors
- **Authentication**: NextAuth v4.24.14
- **Icons**: Lucide React + Ant Design Icons

### Folder Structure
```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with QueryProvider
│   ├── MainLayout.tsx           # Auth wrapper + sidebar layout
│   ├── globals.css              # Global styles
│   ├── dashboard/               # Main dashboard page
│   ├── users/                   # User management
│   ├── hosts/                   # Host management
│   ├── trips/                   # Trip management
│   ├── bookings/                # Booking management
│   ├── coupons/                 # Coupon management
│   ├── payments/                # Payment tracking
│   ├── configs/                 # App configuration (cities, categories, locations)
│   ├── userSupport/             # Support tickets
│   ├── errorLogs/               # Error tracking
│   ├── apiLogs/                 # API request logs
│   ├── serverHealth/            # Server monitoring
│   ├── AdminUser/               # Admin user management
│   ├── auth/                    # Authentication pages
│   └── settings/                # App settings (placeholder)
├── common/
│   ├── constants/
│   │   ├── api.urls.ts          # Centralized API endpoints
│   │   ├── permissions.ts       # Permission constants
│   │   └── rolePermissions.ts   # Role-based access control
│   └── utils/
│       └── date.ts              # Date utilities
├── services/                     # API service hooks
│   ├── baseApi.ts               # Axios instance with interceptors
│   ├── useGetData.ts            # React Query GET hook
│   ├── usePostData.ts           # React Query POST hook (mutations)
│   └── usePutData.ts            # React Query PUT hook (mutations)
├── store/
│   └── auth.store.ts            # Zustand auth store (user, token, permissions)
└── guards/                       # Route guards (if any)
```

## 2. Admin Pages/Components Organization

### Routing Pattern
Each admin section follows a consistent structure:
```
src/app/[section]/
├── page.tsx              # Main page component (list/table view)
├── layout.tsx            # Optional: section-specific layout
├── components/           # Reusable components for that section
│   ├── ColumnDefs.tsx   # Table column definitions
│   ├── FormModal.tsx    # Create/Edit form modals
│   ├── DetailModal.tsx  # Detail view modals
│   └── ...
├── constants.ts          # Type definitions and constants
└── utils.ts              # Helper functions
```

### Key Pages Implemented

#### Dashboard (`/dashboard`)
- **Purpose**: Overview of platform statistics
- **Features**: 
  - 5 stat cards (Active Trips, Total Hosts, Total Travelers, Active Batches, Bookings)
  - Icon-based cards with custom colors
  - Real-time data via React Query
- **API Used**: `getDashboardStats`

#### Coupons (`/coupons`)
- **Purpose**: Manage discount coupons
- **Features**:
  - Searchable data table with pagination
  - Filter by status and created type
  - Create/Edit via modal forms
  - Enable/Disable toggles with confirmation dialogs
  - View coupon usage history
- **Components**: `CouponFormModal`, `CouponUsagesModal`, `CouponColumns`
- **API Used**: GET/POST/PUT `/api/admin/v1/coupons`

#### Hosts (`/hosts`)
- **Purpose**: Manage trip hosts/partners
- **Features**:
  - Searchable host table with filters
  - Host detail modal with full profile
  - Create new host functionality
  - Verification status management
  - Certificate management
- **Components**: `HostDetailModal`, `CreateHostModal`
- **API Used**: GET/POST `/api/admin/v1/hosts`

#### Configs (`/configs`)
- **Purpose**: Manage platform configuration
- **Sub-sections**:
  - **Cities Management**: Add/Edit/Delete cities with state codes and coordinates
  - **Categories**: Manage trip categories
  - **Featured Categories**: Manage landing page featured trip categories with priority
  - **Active Locations**: Manage active destinations
- **Features**:
  - Tab-based organization for different config types
  - Inline table editing with modals
  - Toggle for featured status
  - Priority ordering
- **API Used**: Multiple config endpoints for cities, categories, featured categories

#### Users (`/users`)
- **Purpose**: Manage traveler accounts
- **Features**: 
  - User search and filtering
  - User detail modal
  - Permission management per user
- **Components**: `UserDetailModal`

#### Trips (`/trips`)
- **Purpose**: Manage trip listings
- **Features**: 
  - Trip search and filtering
  - Publish/Unpublish trips
  - Category assignment
  - Batch management
  - Review management
  - Location updates

#### Admin Users (`/AdminUser`)
- **Purpose**: Manage admin accounts and permissions
- **Features**:
  - Add/Delete admin users
  - Permission assignment per user
  - Role-based access control

## 3. Patterns Used for Forms, API Calls & State Management

### API Call Pattern (React Query)

#### GET Operations
```typescript
// Hook pattern for fetching data
const { data, isLoading, refetch } = useGetData({
  key: ['coupons', JSON.stringify(queryParams)],
  url: api.getCoupons,
  params: queryParams,  // Pagination, filters, search
});

// Data structure: { data: [...items] } or { data: { items: [...], total: number } }
const items = data?.data?.coupons || [];
const total = data?.data?.total || 0;
```

**React Query Config**:
- `staleTime`: 5 minutes (fresh data, no background refetch)
- `gcTime`: 10 minutes (keep in cache after unmount)
- `refetchOnWindowFocus`: false
- `refetchOnMount`: false

#### POST/PUT Operations (Mutations)
```typescript
// Create operation
const { mutateAsync, isPending } = usePostData<ResponseType, PayloadType>(
  url,
  {
    onSuccess: (data, variables) => {
      message.success('Created successfully');
      form.resetFields();
      refetch();  // Refetch parent data
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed');
    }
  }
);

// Update operation
const { mutateAsync, isPending } = usePutData<ResponseType, PayloadType>(
  url,
  { onSuccess, onError }
);

// Execute mutation
const handleSubmit = async (values) => {
  await mutateAsync(values);
};
```

### Form Pattern (Ant Design Form + React Query)

```typescript
// Typical form structure
const [form] = Form.useForm<FormValues>();
const isEdit = !!existingItem;

// Handle submission
const handleFinish = async (values: FormValues) => {
  const payload = {
    ...values,
    dateField: values.dateField?.toISOString(),  // Convert Dayjs to ISO
  };
  
  if (isEdit) {
    await updateMutation(payload);
  } else {
    await createMutation(payload);
  }
};

// Prefill form for edit mode
useEffect(() => {
  if (open && existingItem) {
    form.setFieldsValue({
      code: existingItem.code,
      startDate: dayjs(existingItem.startDate),
      // ... other fields
    });
  } else if (open) {
    form.resetFields();
  }
}, [open, existingItem, form]);

// Modal wrapper
<Modal
  open={open}
  title={isEdit ? `Edit: ${existingItem?.name}` : 'Create New'}
  onCancel={() => { form.resetFields(); onClose(); }}
  onOk={() => form.submit()}
  confirmLoading={isPending}
>
  <Form form={form} layout="vertical" onFinish={handleFinish}>
    <Form.Item name="field" rules={[...validation rules]}>
      <Input />
    </Form.Item>
  </Form>
</Modal>
```

### State Management

#### Authentication (Zustand Store)
```typescript
// auth.store.ts
interface User {
  name: string;
  token: string;
  id: string;
  permissions?: Permission[];
}

interface AuthState {
  user: User | null;
  role: Role | null;
  givenPermissions: Permission[] | null;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

// Usage
const { user } = useAuthStore();
const canAccess = useAuthStore(state => state.hasPermission('users'));
```

**Storage**: Persisted in cookies (7-day expiry) using zustand persist middleware

#### Local State
- Filters and search: `useState`
- Modal visibility: `useState`
- Selected items: `useState`
- Pagination: `useState(page, pageSize)`

### Base API Setup

```typescript
// baseApi.ts - Axios instance with interceptors
const baseAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - adds auth token
baseAPI.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    config.headers.Authorization = `Bearer ${user}`;
  }
  return config;
});

// Response interceptor - handles 401 errors
baseAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 4. Config & Settings Management Pages

### Centralized Configuration

#### API URLs (`common/constants/api.urls.ts`)
```typescript
export const api = {
  // Auth
  login: '/api/admin/v1/login',
  
  // Admin Users
  addAdminUser: '/api/admin/v1/users/add',
  getAdminUser: '/api/admin/v1/users/all',
  updateAdminUserPermissions: (id) => `/api/admin/v1/users/${id}/permissions`,
  
  // App Configuration
  getTripCategories: '/api/admin/v1/config/trip-categories',
  getCities: '/api/admin/v1/config/cities',
  getFeaturedCategories: '/api/admin/v1/landing-page/categories',
  getActiveLocations: '/api/admin/v1/config/active-locations',
  
  // Data Resources
  getHosts: '/api/admin/v1/hosts',
  getTrips: '/api/admin/v1/trips',
  getCoupons: '/api/admin/v1/coupons',
  getPayments: '/api/admin/v1/payments',
  
  // Computed paths
  updateCity: (id) => `/api/admin/v1/config/cities/${id}`,
  toggleCoupon: (id) => `/api/admin/v1/coupons/${id}/toggle`,
  // ... many more
} as const;
```

#### Permissions & Roles (`common/constants/permissions.ts`)
```typescript
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
  SECURITY: 'security',
  SERVER_HEALTH: 'serverhealth',
  CONFIGS: 'configs',
  COUPONS: 'coupons',
} as const;
```

#### Role-Based Menu (`dashboard/components/SideBar/MenuItems.tsx`)
```typescript
export const MenuItems = [
  { key: 'dashboard', icon: <Home />, label: 'Dashboard', permission: PERMISSIONS.DASHBOARD },
  { key: 'users', icon: <Users />, label: 'Users', permission: PERMISSIONS.USERS },
  { key: 'hosts', icon: <Building2 />, label: 'Hosts', permission: PERMISSIONS.HOSTS },
  { key: 'coupons', icon: <Tag />, label: 'Coupons', permission: PERMISSIONS.COUPONS },
  { key: 'configs', icon: <Settings />, label: 'App Config', permission: PERMISSIONS.CONFIGS },
  // ... filtered by user permissions
];
```

### Settings Page (Placeholder)
- **Location**: `/settings`
- **Status**: Currently a placeholder (empty configuration page)
- **Potential Use Cases**:
  - Global platform settings
  - Email configuration
  - Notification preferences
  - Feature flags
  - System-wide defaults

### Configs Page (Full Implementation)
- **Location**: `/configs`
- **Features**:
  - **Cities**: Add/Edit/Delete with state codes, pincodes, coordinates
  - **Categories**: Manage trip categories
  - **Featured Categories**: Landing page featured trips with priority ordering
  - **Active Locations**: Toggle active destinations
- **Pattern**: Tab-based layout with inline table editing

## 5. Examples of Existing Admin Features

### Feature 1: Dashboard Statistics
```typescript
// Real-time stats dashboard
STAT_CONFIG = [
  { key: 'totalActiveTrips', label: 'Active Trips', icon: Map, color: '#1890ff' },
  { key: 'totalHosts', label: 'Total Hosts', icon: Users, color: '#52c41a' },
  { key: 'totalTravelers', label: 'Total Travelers', icon: Backpack, color: '#faad14' },
  { key: 'totalActiveBatches', label: 'Active Batches', icon: CalendarCheck, color: '#722ed1' },
  { key: 'totalSuccessfulBookings', label: 'Successful Bookings', icon: CheckCircle2, color: '#eb2f96' },
];
```

### Feature 2: Searchable, Filterable Tables
```typescript
// Coupons page example
- Search by code or description
- Filter by status (active, expired, etc.)
- Filter by created type (admin, system, etc.)
- Pagination (20 items/page)
- Refetch on filter change
```

### Feature 3: Modal-Based CRUD Operations
```typescript
// CouponFormModal pattern
- Create: Empty form in modal
- Edit: Pre-filled form with validation
- Delete: Confirmation dialog
- Success: Message toast + refetch data + close modal
- Error: Message toast with server error message
```

### Feature 4: Permission-Based Access Control
```typescript
// SideBar.tsx checks permissions
const visibleMenuItems = MenuItems.filter(item => 
  useAuthStore(state => state.hasPermission(item.permission))
);
```

### Feature 5: Configuration Management
```typescript
// Cities, Categories, Featured Categories, Active Locations
- CRUD operations via modals
- Toggle status switches
- Priority ordering (Featured Categories)
- Validation of required fields
```

### Feature 6: Data Export/Reporting
```typescript
// Available on payment and logs pages
- Filter data by date range, status, etc.
- Display metrics and aggregated data
- Track request/error patterns
```

## Key Takeaways

1. **Consistent Architecture**: Each module follows the same pattern: page component → API hooks → tables/modals → mutations
2. **React Query for Caching**: Smart cache management with 5-min stale time and 10-min garbage collection
3. **Type Safety**: Full TypeScript with proper interfaces for API responses and form values
4. **Permission-Based Navigation**: All routes protected by permission checks in auth store
5. **Reusable Service Hooks**: `useGetData`, `usePostData`, `usePutData` abstract away React Query boilerplate
6. **Zustand for Auth**: Lightweight auth store with cookie persistence
7. **Ant Design + Tailwind**: Consistent UI with dark theme and backdrop blur effects
8. **Modal-Driven Workflows**: Most CRUD operations done via modals, not separate pages
