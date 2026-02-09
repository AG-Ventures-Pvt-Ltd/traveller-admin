import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function TripsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // PRODUCTS maps to 'trips' in permissions currently
    return (
        <PermissionGuard permission={PERMISSIONS.PRODUCTS}>
            {children}
        </PermissionGuard>
    );
}
