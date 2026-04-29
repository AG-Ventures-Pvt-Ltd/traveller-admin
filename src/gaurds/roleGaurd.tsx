'use client'
import React, { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@/common/constants/rolePermissions'
import { useRouter } from 'next/navigation'


function RoleGaurd({allowedRoles, children}:{
    allowedRoles: Role[]
    children: ReactNode
}) {
    const { role, user } = useAuthStore()
    const router = useRouter()

    if (!user) {
        router.replace('/auth')
        return null
    }

    if (!allowedRoles.includes(role as Role)) return null
    
    return <>{children}</>
    
}

export default RoleGaurd
