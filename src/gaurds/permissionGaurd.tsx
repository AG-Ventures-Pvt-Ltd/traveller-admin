import { Permission } from '@/common/constants/permissions'
import { useAuthStore } from '@/store/auth.store'
import React, { ReactNode } from 'react'

function PermissionGaurd({ permission, children }: {
  permission: Permission
  children: ReactNode
}) {
  const hasPermission = useAuthStore((s) => (s.hasPermission(permission)))

  if (!hasPermission) return null; // Fixed: Check the result of hasPermission, not the permission prop
  return <>{children}</>
}

export default PermissionGaurd
