'use client'
import React, { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@/common/constants/rolePermissions'
import { useRouter } from 'next/navigation'
import { Chiron_Sung_HK } from 'next/font/google'


function RoleGaurd({allowedRoles, children}:{
    allowedRoles: Role[]
    children: ReactNode
}) {

    const role = useAuthStore((s)=>(s.role))
    const route = useRouter()

    if (!allowedRoles.includes(role!)){
        route.replace('/unauthorsed')
        return null 
    }
    
    return <>{children}</>
    
}

export default RoleGaurd
