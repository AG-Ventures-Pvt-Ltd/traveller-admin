import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Role, ROLE_PERMISSIONS } from "@/common/constants/rolePermissions";
import { Permission, PERMISSIONS } from "@/common/constants/permissions";


// Define a User interface based on usage
export interface User {
    
    name: string;
    token: string;
    id: string;
    permissions?: Permission[]; // Explicit permissions from backend
    
}

// export const DUMMY_USERS: Record<string, User> = {
//     ADMIN: {
       
//         name: 'Admin User',
//         token: 'string',
//         role: 'admin',
//         permissions: [] 
//     },
// };

interface AuthState {
    user: User | null
    role: Role | null
    givenPermissions: Permission[] | null

    login: (user: User) => void
    logout: () => void

    hasRole: (role: Role[]) => boolean
    hasPermission: (permission: Permission) => boolean

}

import Cookies from 'js-cookie';


// Custom storage adapter for cookies
const cookieStorage: StateStorage = {
    getItem: (name: string): string | null => {
        return Cookies.get(name) || null;
    },
    setItem: (name: string, value: string): void => {
        // Set cookie with 7 days expiry
        Cookies.set(name, value, { expires: 7, path: '/' });
    },
    removeItem: (name: string): void => {
        Cookies.remove(name, { path: '/' });
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            role: null,
            givenPermissions: [],

            login: (user) => {

                

                // If user has a role, fetch permissions from ROLE_PERMISSIONS
                // console.log(user.permissions)
                set({
                    user,
                    givenPermissions: user.permissions
                });
            },

            logout: () => {
                Cookies.remove('auth-storage');
                set({ user: null, role: null, givenPermissions: [] });
            },

            hasRole: (roles) => (roles.includes(get().role as Role)),

            hasPermission: (permission) => {
                const givenPermissions = get().givenPermissions || [];
                return givenPermissions.includes(permission);
            }
        }),
        {
            name: 'auth-storage', // name of the cookie
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({
                user: state.user,
                role: state.role,
                givenPermissions: state.givenPermissions
            }),
        }
    )
)