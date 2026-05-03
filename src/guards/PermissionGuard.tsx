'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Permission } from '@/common/constants/permissions';
import { Result, Button } from 'antd';

interface PermissionGuardProps {
    permission: Permission;
    children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
    const { hasPermission, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace('/auth');
        }
    }, [user, router]);

    if (!user) {
        return null; // or a loading spinner if needed
    }

    const isAuthorized = hasPermission(permission);

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#0c0c0c] text-white">
                <Result
                    status="403"
                    title={<span className="text-white">403</span>}
                    subTitle={<span className="text-gray-400">Sorry, you are not authorized to access this page.</span>}
                    extra={
                        <Button type="primary" onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    }
                />
            </div>
        );
    }

    return <>{children}</>;
};

export default PermissionGuard;
