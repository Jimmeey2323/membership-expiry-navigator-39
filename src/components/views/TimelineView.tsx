
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineViewProps {
  data: {
    byPeriod: Record<string, MembershipRecord[]>;
  };
}

const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  // Sort periods chronologically
  const sortedPeriods = Object.entries(data.byPeriod).sort(([periodA], [periodB]) => {
    // Parse period format MM/YYYY
    const [monthA, yearA] = periodA.split('/').map(Number);
    const [monthB, yearB] = periodB.split('/').map(Number);
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  });
  
  return (
    <div className="space-y-8">
      {sortedPeriods.map(([period, records]) => (
        <div key={period} className="relative">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              {period.split('/')[0]}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">{period}</h3>
              <p className="text-sm text-muted-foreground">{records.length} memberships expiring</p>
            </div>
          </div>
          
          <div className="mt-4 ml-5 border-l-2 border-primary/30 pl-8 space-y-4">
            {records.map((record, recordIndex) => (
              <Card key={recordIndex} className="relative animate-float-in" style={{ animationDelay: `${recordIndex * 0.05}s` }}>
                <div className="absolute -left-10 top-1/2 w-2 h-2 rounded-full bg-primary transform -translate-y-1/2"></div>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{record.customerName}</p>
                      <p className="text-sm text-muted-foreground">{record.customerEmail}</p>
                    </div>
                    <Badge>{record.membershipName}</Badge>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Location: {record.homeLocation}
                  </p>
                  {record.expiresAt && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Expires: {new Date(record.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
