
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  title: string;
  records: MembershipRecord[];
  count: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, records, count }) => {
  return (
    <div className="min-w-[300px] max-w-[350px] bg-muted/30 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-3">
        {records.map((record, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4">
              <h4 className="font-medium">{record.customerName}</h4>
              <p className="text-sm text-muted-foreground truncate">{record.customerEmail}</p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">{record.membershipName}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {record.expiresAt && (
                  <p>Expires: {new Date(record.expiresAt).toLocaleDateString()}</p>
                )}
                <p className="truncate">Location: {record.homeLocation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface KanbanViewProps {
  data: {
    byMembershipName: Record<string, MembershipRecord[]>;
    byPeriod: Record<string, MembershipRecord[]>;
    byMonth: Record<string, MembershipRecord[]>;
    byHomeLocation: Record<string, MembershipRecord[]>;
  };
  groupBy: 'membershipName' | 'period' | 'month' | 'homeLocation';
}

const KanbanView: React.FC<KanbanViewProps> = ({ data, groupBy }) => {
  let groupedData: Record<string, MembershipRecord[]>;
  
  switch (groupBy) {
    case 'membershipName':
      groupedData = data.byMembershipName;
      break;
    case 'period':
      groupedData = data.byPeriod;
      break;
    case 'month':
      groupedData = data.byMonth;
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
        {sortedColumns.map(([title, records]) => (
          <KanbanColumn 
            key={title} 
            title={title} 
            records={records} 
            count={records.length} 
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanView;
