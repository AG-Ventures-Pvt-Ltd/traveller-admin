export const TICKET_STATUS = {
  OPEN: 'open',
  INPROGRESS: 'inProgress',
  COMPLETED: 'resolved',
  CLOSED: 'closed'
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

interface StatusConfigItem {
  color: string;
  text: string;
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  [TICKET_STATUS.OPEN]: {
    color: 'orange',
    text: 'Pending'
  },
  [TICKET_STATUS.INPROGRESS]: {
    color: 'blue',
    text: 'In Progress'
  },
  [TICKET_STATUS.COMPLETED]: {
    color: 'green',
    text: 'Completed'
  },
  [TICKET_STATUS.CLOSED]: {
    color: 'gray',
    text: 'Closed'
  }
};

export const SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  PRIORITY_ASC: 'priority_asc',
  PRIORITY_DESC: 'priority_desc'
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

interface PriorityLevel {
  value: number;
  text: string;
  color: string;
}

export const PRIORITY_LEVELS: Record<string, PriorityLevel> = {
  LOW: { value: 1, text: 'Low', color: 'green' },
  MEDIUM: { value: 2, text: 'Medium', color: 'orange' },
  HIGH: { value: 3, text: 'High', color: 'red' },
  URGENT: { value: 4, text: 'Urgent', color: 'purple' }
};

export const subjects = [
  'Login Issues',
  'Payment Problem',
  'Feature Request',
  'Bug Report',
  'Account Recovery',
  'Data Export Issue',
  'UI/UX Feedback',
  'API Integration Help'
];


export const PRIORITY_RULES: Record<string, string> = {
  'Payment Problem': 'HIGH',
  'Login Issues': 'HIGH',
  'Bug Report': 'MEDIUM',
  'Feature Request': 'LOW',
  'Account Recovery': 'HIGH',
  'UI/UX Feedback': 'LOW'
};

export interface Message {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  attachments: string[] | null;
}

export interface Ticket {
  _id: string;
  id?: string; // Handling potential inconsistency
  type: string;
  status: TicketStatus; // or string if it can vary
  priority: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  attachments?: string[];
  createdBy?: string;
}