import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function ApiAnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.API_ANALYTICS}>
            {children}
        </PermissionGuard>
    );
}
