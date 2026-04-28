import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function HostsLayout({ children }: { children: React.ReactNode }) {
    return <PermissionGuard permission={PERMISSIONS.HOSTS}>{children}</PermissionGuard>;
}
