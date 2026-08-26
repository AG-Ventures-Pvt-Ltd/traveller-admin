import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function SipPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission={PERMISSIONS.SIP_PLANS}>
      {children}
    </PermissionGuard>
  );
}
