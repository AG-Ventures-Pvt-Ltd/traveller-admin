export interface Admin {
    _id: string;
    username: string;
    avatar?: string;
    permissions: string[];
    createdAt: string;
    password?: string; // Optional property for added admin response
}
