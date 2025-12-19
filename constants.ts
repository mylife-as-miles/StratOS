
import { Ticket, TicketStatus } from './types';

export const MOCK_TICKETS: Ticket[] = [
  { id: '1', key: 'ST-101', summary: 'Refactor Auth Provider', assignee: 'Max V.', status: TicketStatus.DONE, isBlocked: false, ageDays: 2, points: 5 },
  { id: '2', key: 'ST-102', summary: 'Database Migration', assignee: 'Lewis H.', status: TicketStatus.QA_REVIEW, isBlocked: true, ageDays: 12, points: 8 },
  { id: '3', key: 'ST-103', summary: 'Cyber UI Components', assignee: 'Lando N.', status: TicketStatus.IN_PROGRESS, isBlocked: false, ageDays: 4, points: 3 },
  { id: '4', key: 'ST-104', summary: 'Jira Integration Layer', assignee: 'Charles L.', status: TicketStatus.IN_PROGRESS, isBlocked: false, ageDays: 1, points: 5 },
  { id: '5', key: 'ST-105', summary: 'Analytics Dashboard', assignee: 'Oscar P.', status: TicketStatus.BACKLOG, isBlocked: false, ageDays: 0, points: 13 },
  { id: '6', key: 'ST-106', summary: 'Hotfix: Memory Leak', assignee: 'Fernando A.', status: TicketStatus.IN_PROGRESS, isBlocked: true, ageDays: 7, points: 2 },
  { id: '7', key: 'ST-107', summary: 'Security Audit', assignee: 'George R.', status: TicketStatus.DONE, isBlocked: false, ageDays: 5, points: 8 },
];

export const TRACK_PATH = "M 100 300 C 100 100 400 100 400 300 S 700 500 700 300 S 400 300 100 300";

export const STATUS_PROGRESS_MAP: Record<TicketStatus, number> = {
  [TicketStatus.BACKLOG]: 0.1,
  [TicketStatus.IN_PROGRESS]: 0.4,
  [TicketStatus.QA_REVIEW]: 0.75,
  [TicketStatus.DONE]: 0.95
};
