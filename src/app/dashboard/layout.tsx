import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.DASHBOARD}>
            {children}
        </PermissionGuard>
    );
}
