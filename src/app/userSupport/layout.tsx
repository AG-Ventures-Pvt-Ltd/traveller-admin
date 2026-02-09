import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/common/constants/permissions';

export default function UserSupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard permission={PERMISSIONS.USER_SUPPORT}>
            {children}
        </PermissionGuard>
    );
}
