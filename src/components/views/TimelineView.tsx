
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDaysLapsed } from '@/utils/dateUtils';

interface TimelineViewProps {
  data: {
    byPeriod: Record<string, MembershipRecord[]>;
  };
  onRecordClick: (record: MembershipRecord) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ data, onRecordClick }) => {
  // Sort periods chronologically
  const sortedPeriods = Object.entries(data.byPeriod).sort(([periodA], [periodB]) => {
    // Check if period is in format MM/YYYY
    if (periodA.includes('/') && periodB.includes('/')) {
      const [monthA, yearA] = periodA.split('/').map(Number);
      const [monthB, yearB] = periodB.split('/').map(Number);
      
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthA - monthB;
    }
    
    // If format is different (like "January 2023" or "Q1 2023")
    // Try to extract year and compare
    const yearA = parseInt(periodA.match(/\d{4}/)?.[0] || '0');
    const yearB = parseInt(periodB.match(/\d{4}/)?.[0] || '0');
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    
    // For same year, try to determine order
    if (periodA.includes('Q') && periodB.includes('Q')) {
      // Compare quarters
      const quarterA = parseInt(periodA.match(/Q(\d)/)?.[1] || '0');
      const quarterB = parseInt(periodB.match(/Q(\d)/)?.[1] || '0');
      return quarterA - quarterB;
    } else if (periodA.includes('W') && periodB.includes('W')) {
      // Compare weeks
      const weekA = parseInt(periodA.match(/W(\d+)/)?.[1] || '0');
      const weekB = parseInt(periodB.match(/W(\d+)/)?.[1] || '0');
      return weekA - weekB;
    }
    
    // For months, use a map of month names to numbers
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (let i = 0; i < monthNames.length; i++) {
      if (periodA.includes(monthNames[i])) {
        for (let j = 0; j < monthNames.length; j++) {
          if (periodB.includes(monthNames[j])) {
            return i - j;
          }
        }
      }
    }
    
    // Fall back to string comparison
    return periodA.localeCompare(periodB);
  });
  
  return (
    <div className="space-y-8">
      {sortedPeriods.length > 0 ? (
        sortedPeriods.map(([period, records]) => (
          <div key={period} className="relative">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                {period.split(' ')[0].substring(0, 1)}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">{period}</h3>
                <p className="text-sm text-muted-foreground">{records.length} memberships expiring</p>
              </div>
            </div>
            
            <div className="mt-4 ml-5 border-l-2 border-primary/30 pl-8 space-y-4">
              {records.map((record, recordIndex) => (
                <Card 
                  key={`${record.customerEmail}-${recordIndex}`} 
                  className="relative animate-float-in cursor-pointer hover:shadow-md transition-shadow" 
                  style={{ animationDelay: `${recordIndex * 0.05}s` }}
                  onClick={() => onRecordClick(record)}
                >
                  <div className="absolute -left-10 top-1/2 w-2 h-2 rounded-full bg-primary transform -translate-y-1/2"></div>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{record.customerName}</p>
                        <p className="text-sm text-muted-foreground">{record.customerEmail}</p>
                      </div>
                      <Badge>{record.membershipName}</Badge>
                    </div>
                    <div className="flex flex-wrap justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Location: {record.homeLocation}
                      </p>
                      {record.expiresAt && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Expires: </span>
                          <span className={record.daysLapsed && record.daysLapsed > 0 ? 'text-destructive' : ''}>
                            {formatDate(record.expiresAt)}
                            {' '}
                            ({formatDaysLapsed(record.daysLapsed)})
                          </span>
                        </p>
                      )}
                    </div>
                    {record.tags && record.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {record.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {record.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{record.tags.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No timeline data available for the selected filters
        </div>
      )}
    </div>
  );
};

export default TimelineView;
