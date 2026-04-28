export const api = {
    getSupportTickets: '/api/admin/v1/support/getTickets',

    addAdminUser: '/api/admin/v1/users/add',
    getAdminUser: '/api/admin/v1/users/all',
    deleteAdminUser: '/api/admin/v1/users/delete',

    getErrorLogs: '/api/admin/v1/errors/logs',

    login: '/api/admin/v1/login',

    getApiLogs: '/api/admin/v1/api-logs/logs',
    getBookings: '/api/client/v1/bookings/all',

    getHosts: '/api/admin/v1/users/hosts',
    createHost: '/api/admin/v1/users/hosts/create',
    verifyHost: '/api/admin/v1/users/hosts/verify',
    getClientUsers: '/api/admin/v1/users/clients',

    getDashboardStats: '/api/admin/v1/stats',

    // Categories
    getTripCategories: '/api/admin/v1/config/trip-categories',
    addTripCategories: '/api/admin/v1/config/trip-categories/add',
    deleteTripCategory: '/api/admin/v1/config/trip-categories/delete',

    // Cities
    getCities: '/api/admin/v1/config/cities',
    addCity: '/api/admin/v1/config/cities/add',
    updateCity: (id: string) => `/api/admin/v1/config/cities/${id}`,
    deleteCity: (id: string) => `/api/admin/v1/config/cities/${id}`,

    // Featured Trips (Landing Page Categories)
    getFeaturedCategories: '/api/admin/v1/landing-page/categories',
    createFeaturedCategory: '/api/admin/v1/landing-page/categories',
    updateFeaturedCategory: (id: string) => `/api/admin/v1/landing-page/categories/${id}`,
    deleteFeaturedCategory: (id: string) => `/api/admin/v1/landing-page/categories/${id}`,
    getPublishedTripsForDropdown: '/api/admin/v1/landing-page/trips',

    // Trips
    getTrips: '/api/admin/v1/trips',
    getTripById: (id: string) => `/api/admin/v1/trips/${id}`,
    publishTrip: (id: string) => `/api/admin/v1/trips/${id}/publish`,
    updateTripCategories: (id: string) => `/api/admin/v1/trips/${id}/categories`,
    updateTripLocation: (id: string) => `/api/admin/v1/trips/${id}/location`,

    // Trip Batches
    getTripBatches: (tripId: string) => `/api/admin/v1/trips/${tripId}/batches`,
    updateBatch: (tripId: string, batchId: string) => `/api/admin/v1/trips/${tripId}/batches/${batchId}`,

    // Admin Reviews
    getTripReviews: (tripId: string) => `/api/admin/v1/trips/${tripId}/reviews`,
    addReview: (tripId: string) => `/api/admin/v1/trips/${tripId}/reviews`,
    updateReview: (tripId: string, reviewId: string) => `/api/admin/v1/trips/${tripId}/reviews/${reviewId}`,
    deleteReview: (tripId: string, reviewId: string) => `/api/admin/v1/trips/${tripId}/reviews/${reviewId}`,
} as const;
