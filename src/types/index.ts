
export type FileType = 'expirations' | 'frozen' | 'notactivated' | 'unknown';

export interface FileInfo {
  id: string;
  file: File;
  type: FileType;
  data?: any[];
}

export interface MembershipRecord {
  customerName: string;
  customerEmail: string;
  membershipName: string;
  expiresAt?: string;
  frozenAt?: string;
  unfrozenAt?: string;
  boughtAt?: string;
  homeLocation: string;
  tags?: string[];
  daysLapsed?: number;
  assignedTo?: string;
  followUps?: FollowUp[];
}

export interface FollowUp {
  id: string;
  date: string;
  comment: string;
  createdAt: string;
}

export interface ProcessedData {
  byMembershipName: Record<string, MembershipRecord[]>;
  byPeriod: Record<string, MembershipRecord[]>; // month-year
  byMonth: Record<string, MembershipRecord[]>; // month only
  byHomeLocation: Record<string, MembershipRecord[]>;
  allRecords: MembershipRecord[];
}

export type ViewType = 'kanban' | 'card' | 'table' | 'timeline' | 'custom';

export type PeriodGrouping = 'month' | 'quarter' | 'year' | 'week';

export type SortDirection = 'asc' | 'desc';

export type SortField = 'customerName' | 'expiresAt' | 'membershipName' | 'homeLocation' | 'daysLapsed' | 'tags';

export interface FilterOptions {
  membershipName?: string[];
  homeLocation?: string[];
  tags?: string[];
  expiresAfter?: string;
  expiresBefore?: string;
  assignedTo?: string;
  search?: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
