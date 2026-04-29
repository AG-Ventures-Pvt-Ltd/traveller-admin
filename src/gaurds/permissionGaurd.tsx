'use client'
import { Permission } from '@/common/constants/permissions'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect } from 'react'

function PermissionGaurd({ permission, children }: {
  permission: Permission
  children: ReactNode
}) {
  const { hasPermission, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/auth')
    }
  }, [user, router])

  if (!user || !hasPermission(permission)) return null
  return <>{children}</>
}

export default PermissionGaurd
