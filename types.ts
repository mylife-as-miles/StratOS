
export enum TicketStatus {
  BACKLOG = 'BACKLOG',
  IN_PROGRESS = 'IN_PROGRESS',
  QA_REVIEW = 'QA_REVIEW',
  DONE = 'DONE'
}

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  assignee: string;
  status: TicketStatus;
  isBlocked: boolean;
  ageDays: number; // For "Tyre Degradation"
  points: number;
}

export interface RaceTelemetry {
  fuelLevel: number; // Sprint burndown %
  avgLapTime: number; // Velocity
  drsEnabled: boolean; // Streak status
  tyreWear: number; // Tech debt/age avg
  yellowFlags: number; // Blocked counts
}

export interface AIStrategy {
  analysis: string;
  recommendations: string[];
  priorityLevel: 'CRITICAL' | 'STABLE' | 'OPTIMAL';
}
