import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission={PERMISSIONS.LINKS}>
      {children}
    </PermissionGuard>
  );
}
