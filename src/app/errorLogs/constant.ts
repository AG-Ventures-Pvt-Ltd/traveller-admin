export interface ErrorLog {
    id?: string;
    timestamp?: string;
    level: string; // Changed to string to accommodate 'info' | 'error' etc straightforwardly or keep enum if strict
    message: string;
    statusCode?: number;
    url?: string;
    method?: string;
    ip?: string;
    userAgent?: string;
    stack?: string;
    user?: {
        id: string;
        email: string;
    };
    metadata?: Record<string, unknown>;
    errors?: string[] | string | Record<string, unknown>;
}

export const DUMMY_ERROR_LOGS = {
    "statusCode": 200,
    "data": {
        "logs": [
            {
                "level": "info",
                "message": "error logs rotated and compressed to error-2026-01-31.log.gz"
            },
            {
                "level": "info",
                "message": "Deleted old error log: error-2026-01-16.log.gz"
            },
            {
                "level": "info",
                "message": "api logs rotated and compressed to api-2026-01-31.log.gz"
            },
            {
                "level": "info",
                "message": "Deleted old api log: api-2026-01-16.log.gz"
            },
            {
                "level": "info",
                "message": "Log rotation completed."
            },
            {
                "level": "info",
                "message": "Running cancelExpiredPendingBookings worker..."
            },
            {
                "level": "info",
                "message": "Processed 0 expired bookings"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            },
            {
                "level": "error",
                "message": "ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details",
                "stack": "ReplyError: ERR max requests limit exceeded. Limit: 500000, Usage: 500000. See https://upstash.com/docs/redis/troubleshooting/max_requests_limit for details\n    at parseError (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:179:12)\n    at parseType (/home/ubuntu/wondrr-backend/node_modules/redis-parser/lib/parser.js:302:14)"
            }
        ],
        "total": 159501,
        "limit": 20,
        "offset": 0,
        "page": 1,
        "totalPages": 7976,
        "hasMore": true
    },
    "message": "Error logs retrieved successfully",
    "success": true
}
