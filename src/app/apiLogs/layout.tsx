import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function ApiLogsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.API_LOGS}>
            {children}
        </PermissionGuard>
    );
}
