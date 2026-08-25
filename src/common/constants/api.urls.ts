export const api = {
    getSupportTickets: '/api/admin/v1/support/getTickets',

    addAdminUser: '/api/admin/v1/users/add',
    getAdminUser: '/api/admin/v1/users/all',
    deleteAdminUser: '/api/admin/v1/users/delete',
    updateAdminUserPermissions: (id: string) => `/api/admin/v1/users/${id}/permissions`,
    resetAdminUserPassword: (id: string) => `/api/admin/v1/users/${id}/reset-password`,

    getErrorLogs: '/api/admin/v1/errors/logs',

    login: '/api/admin/v1/login',

    getApiLogs: '/api/admin/v1/api-logs/logs',

    // API Analytics
    getApiAnalyticsSummary: '/api/admin/v1/api-analytics/summary',
    getApiAnalyticsEndpoints: '/api/admin/v1/api-analytics/endpoints',
    getApiAnalyticsTrend: '/api/admin/v1/api-analytics/trend',
    getApiAnalyticsEndpointTrend: '/api/admin/v1/api-analytics/endpoint-trend',

    getBookings: '/api/client/v1/bookings/all',

    getHosts: '/api/admin/v1/hosts',
    createHost: '/api/admin/v1/hosts/create',
    verifyHost: '/api/admin/v1/hosts/verify',
    addHostCertificate: '/api/admin/v1/hosts/certificate/add',
    removeHostCertificate: '/api/admin/v1/hosts/certificate/remove',
    getClientUsers: '/api/admin/v1/users/clients',

    getDashboardStats: '/api/admin/v1/stats',

    getServerHealth: '/api/admin/v1/health/stream',

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
    getTripSummaryBySlug: (slug: string) => `/api/admin/v1/trips/slug/${slug}`,
    getTrips: '/api/admin/v1/trips',
    getTripById: (id: string) => `/api/admin/v1/trips/${id}`,
    publishTrip: (id: string) => `/api/admin/v1/trips/${id}/publish`,
    updateTripCategories: (id: string) => `/api/admin/v1/trips/${id}/categories`,
    updateTripLocation: (id: string) => `/api/admin/v1/trips/${id}/location`,
    updateTripType: (id: string) => `/api/admin/v1/trips/${id}/type`,

    // Trip Batches
    getTripBatches: (tripId: string) => `/api/admin/v1/trips/${tripId}/batches`,
    updateBatch: (tripId: string, batchId: string) => `/api/admin/v1/trips/${tripId}/batches/${batchId}`,

    // Admin Reviews
    getTripReviews: (tripId: string) => `/api/admin/v1/trips/${tripId}/reviews`,
    addReview: (tripId: string) => `/api/admin/v1/trips/${tripId}/reviews`,
    updateReview: (tripId: string, reviewId: string) => `/api/admin/v1/trips/${tripId}/reviews/${reviewId}`,
    deleteReview: (tripId: string, reviewId: string) => `/api/admin/v1/trips/${tripId}/reviews/${reviewId}`,
    
    // Host Profile Reviews (GET and POST only)
    getProfileReviews: (hostId: string) => `/api/admin/v1/hosts/${hostId}/reviews`,
    addProfileReview: (hostId: string) => `/api/admin/v1/hosts/${hostId}/reviews`,

    // Payments
    getPayments: '/api/admin/v1/payments',
    markPaymentRefund: (id: string) => `/api/admin/v1/payments/${id}/refund`,

    // Coupons
    getCoupons: '/api/admin/v1/coupons',
    createCoupon: '/api/admin/v1/coupons',
    updateCoupon: (id: string) => `/api/admin/v1/coupons/${id}`,
    toggleCoupon: (id: string) => `/api/admin/v1/coupons/${id}/toggle`,
    getCouponUsages: (id: string) => `/api/admin/v1/coupons/${id}/usages`,

    // Links
    getLinks: '/api/admin/v1/links',
    createLink: '/api/admin/v1/links',
    updateLink: (shortCode: string) => `/api/admin/v1/links/${shortCode}`,
    deleteLink: (shortCode: string) => `/api/admin/v1/links/${shortCode}`,

    // Active Locations
    getActiveLocations: '/api/admin/v1/config/active-locations',
    addActiveLocation: '/api/admin/v1/config/active-locations/add',
    updateActiveLocation: (id: string) => `/api/admin/v1/config/active-locations/${id}`,
    toggleActiveLocation: (id: string) => `/api/admin/v1/config/active-locations/${id}/toggle`,
    deleteActiveLocation: (id: string) => `/api/admin/v1/config/active-locations/${id}`,

    // Signup Bonus
    getSignupBonus: '/api/admin/v1/config/signup-bonus',
    updateSignupBonus: '/api/admin/v1/config/signup-bonus',

    // Payment Gateway
    getPaymentGateway: '/api/admin/v1/config/payment-gateway',
    updatePaymentGateway: '/api/admin/v1/config/payment-gateway',

    // Traveler Stats
    getTravelerStats: '/api/admin/v1/config/traveler-stats',
    updateGlobalTravelerStats: '/api/admin/v1/config/traveler-stats/global',
    updateTripTravelerStats: (slug: string) => `/api/admin/v1/config/traveler-stats/trip/${slug}`,
    deleteTripTravelerStats: (slug: string) => `/api/admin/v1/config/traveler-stats/trip/${slug}`,

    // Explore States (landing page "Explore by Destination")
    getExploreStates: '/api/admin/v1/config/explore-states',
    updateExploreStates: '/api/admin/v1/config/explore-states',

    // Wallet
    addWalletCash: (userId: string) => `/api/admin/v1/users/${userId}/wallet/add-cash`,
    getUserCancelledBookings: (userId: string) => `/api/admin/v1/users/${userId}/bookings/cancelled`,

    // Emails
    sendEngagementEmail: '/api/admin/v1/emails/send-engagement',
    sendMarketingEmail: '/api/admin/v1/emails/send-marketing',

    // Location Analytics
    getLocationAnalytics: '/api/admin/v1/location-analytics',

    // Trip Analytics
    getTripAnalyticsTraffic: '/api/admin/v1/trip-analytics/traffic',

    // Blogs
    getBlogs: '/api/admin/v1/blogs',
    getBlogById: (id: string) => `/api/admin/v1/blogs/${id}`,
    createBlog: '/api/admin/v1/blogs',
    updateBlog: (id: string) => `/api/admin/v1/blogs/${id}`,
    deleteBlog: (id: string) => `/api/admin/v1/blogs/${id}`,
    toggleBlogVisibility: (id: string) => `/api/admin/v1/blogs/${id}/visibility`,
    toggleBlogPublish: (id: string) => `/api/admin/v1/blogs/${id}/publish`,

    // S3 Upload
    getS3UploadUrl: '/api/client/v1/s3upload/geturl',
} as const;
