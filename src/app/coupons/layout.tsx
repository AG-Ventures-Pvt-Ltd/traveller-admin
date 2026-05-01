import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission={PERMISSIONS.COUPONS}>
      {children}
    </PermissionGuard>
  );
}
