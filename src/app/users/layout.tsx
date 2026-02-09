import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.USERS}>
            {children}
        </PermissionGuard>
    );
}
