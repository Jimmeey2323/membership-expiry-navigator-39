
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/dateUtils';
import { User } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  records: MembershipRecord[];
  count: number;
  onRecordClick: (record: MembershipRecord) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, records, count, onRecordClick }) => {
  return (
    <div className="min-w-[300px] max-w-[350px] bg-muted/30 rounded-md p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-3">
        {records.map((record, index) => (
          <Card 
            key={`${record.customerEmail}-${index}`} 
            className="shadow-sm transition-all hover:shadow-md cursor-pointer"
            onClick={() => onRecordClick(record)}
          >
            <CardContent className="p-4">
              <h4 className="font-medium">{record.customerName}</h4>
              <p className="text-sm text-muted-foreground truncate">{record.customerEmail}</p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">{record.membershipName}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {record.expiresAt && (
                  <p>Expires: {formatDate(record.expiresAt)}</p>
                )}
                <p className="truncate">Location: {record.homeLocation}</p>
              </div>
              {record.assignedTo && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <User className="h-3 w-3" />
                  <span>{record.assignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {records.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm italic">
            No records in this group
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanViewProps {
  data: {
    byMembershipName: Record<string, MembershipRecord[]>;
    byPeriod: Record<string, MembershipRecord[]>;
    byHomeLocation: Record<string, MembershipRecord[]>;
  };
  groupBy: 'membershipName' | 'period' | 'month' | 'homeLocation';
  onRecordClick: (record: MembershipRecord) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ data, groupBy, onRecordClick }) => {
  // Extract data by grouping
  let groupedData: Record<string, MembershipRecord[]>;
  
  switch (groupBy) {
    case 'membershipName':
      groupedData = data.byMembershipName;
      break;
    case 'period':
      groupedData = data.byPeriod;
      break;
    case 'homeLocation':
      groupedData = data.byHomeLocation;
      break;
    default:
      groupedData = data.byMembershipName;
  }

  // Sort columns by number of records (descending)
  const sortedColumns = Object.entries(groupedData)
    .sort(([, recordsA], [, recordsB]) => recordsB.length - recordsA.length);

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4">
        {sortedColumns.length > 0 ? (
          sortedColumns.map(([title, records]) => (
            <KanbanColumn 
              key={title} 
              title={title} 
              records={records} 
              count={records.length} 
              onRecordClick={onRecordClick}
            />
          ))
        ) : (
          <div className="w-full text-center py-12 text-muted-foreground">
            No data available for the selected grouping
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanView;
