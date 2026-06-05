import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function LocationAnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.LOCATION_ANALYTICS}>
            {children}
        </PermissionGuard>
    );
}
