import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function ConfigsLayout({ children }: { children: React.ReactNode }) {
    return <PermissionGuard permission={PERMISSIONS.CONFIGS}>{children}</PermissionGuard>;
}
