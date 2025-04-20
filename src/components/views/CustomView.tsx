
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export interface CustomViewProps {
  data: {
    byMembershipName: Record<string, MembershipRecord[]>;
    byPeriod: Record<string, MembershipRecord[]>;
    byMonth: Record<string, MembershipRecord[]>;
    byHomeLocation: Record<string, MembershipRecord[]>;
    allRecords: MembershipRecord[];
  };
  onRecordClick: (record: MembershipRecord) => void;
}

const CustomView: React.FC<CustomViewProps> = ({ data, onRecordClick }) => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Custom View</h3>
          <p className="text-muted-foreground">
            This is a placeholder for your custom view. Currently showing {data.allRecords.length} records.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data.allRecords.slice(0, 6).map((record, index) => (
              <div 
                key={index} 
                className="border p-4 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => onRecordClick(record)}
              >
                <h4 className="font-medium">{record.customerName}</h4>
                <p className="text-sm text-muted-foreground">{record.membershipName}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomView;
