
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
}

export interface ProcessedData {
  byMembershipName: Record<string, MembershipRecord[]>;
  byPeriod: Record<string, MembershipRecord[]>; // month-year
  byMonth: Record<string, MembershipRecord[]>; // month only
  byHomeLocation: Record<string, MembershipRecord[]>;
  allRecords: MembershipRecord[];
}

export type ViewType = 'kanban' | 'card' | 'table' | 'timeline' | 'custom';
