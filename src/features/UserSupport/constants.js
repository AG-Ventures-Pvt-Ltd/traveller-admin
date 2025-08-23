export const TICKET_STATUS = {
  OPEN: 'open',
  INPROGRESS: 'inProgress',
  COMPLETED: 'resolved',
  CLOSED: 'closed'
};

export const STATUS_CONFIG = {
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
};

export const PRIORITY_LEVELS = {
  LOW: { value: 1, text: 'Low', color: 'green' },
  MEDIUM: { value: 2, text: 'Medium', color: 'orange' },
  HIGH: { value: 3, text: 'High', color: 'red' },
  URGENT: { value: 4, text: 'Urgent', color: 'purple' }
};

export  const subjects = [
    'Login Issues',
    'Payment Problem',
    'Feature Request',
    'Bug Report',
    'Account Recovery',
    'Data Export Issue',
    'UI/UX Feedback',
    'API Integration Help'
  ];


export const PRIORITY_RULES = {
  'Payment Problem': 'HIGH',      // Money-related = urgent
  'Login Issues': 'HIGH',         // Access-related = urgent  
  'Bug Report': 'MEDIUM',         // Depends on severity
  'Feature Request': 'LOW',       // Enhancement, not critical
  'Account Recovery': 'HIGH',     // Security-related
  'UI/UX Feedback': 'LOW'         // Nice to have
};