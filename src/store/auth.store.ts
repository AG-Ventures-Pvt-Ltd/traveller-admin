import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Role } from "@/common/constants/rolePermissions";
import { Permission } from "@/common/constants/permissions";
import Cookies from 'js-cookie';


export interface User {
    
    name: string;
    token: string;
    id: string;
    permissions?: Permission[]; 
    
}

interface AuthState {
    user: User | null
    role: Role | null
    givenPermissions: Permission[] | null

    login: (user: User) => void
    logout: () => void

    hasRole: (role: Role[]) => boolean
    hasPermission: (permission: Permission) => boolean

}


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
            name: 'auth-storage', 
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({
                user: state.user,
                role: state.role,
                givenPermissions: state.givenPermissions
            }),
        }
    )
)