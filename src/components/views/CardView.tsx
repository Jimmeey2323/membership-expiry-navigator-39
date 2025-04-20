
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDaysLapsed } from '@/utils/dateUtils';
import { User } from 'lucide-react';

interface CardViewProps {
  data: {
    allRecords: MembershipRecord[];
  };
  onRecordClick: (record: MembershipRecord) => void;
}

const CardView: React.FC<CardViewProps> = ({ data, onRecordClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.allRecords.map((record, index) => (
        <Card 
          key={`${record.customerEmail}-${index}`} 
          className="animate-float-in hover:shadow-md transition-shadow cursor-pointer border-border/60" 
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => onRecordClick(record)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-1">{record.customerName}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">{record.customerEmail}</p>
          </CardHeader>
          <CardContent className="pb-2">
            <Badge className="mb-2 bg-primary/80">{record.membershipName}</Badge>
            {record.expiresAt && (
              <div className="mt-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Expires:</span>{' '}
                  {formatDate(record.expiresAt)}
                </p>
                {record.daysLapsed !== undefined && (
                  <p className={`text-sm ${record.daysLapsed > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatDaysLapsed(record.daysLapsed)}
                  </p>
                )}
              </div>
            )}
            {record.tags && record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {record.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {record.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{record.tags.length - 3}</Badge>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {record.homeLocation}
            </p>
            {record.assignedTo && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{record.assignedTo}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
      {data.allRecords.length === 0 && (
        <div className="col-span-full py-16 text-center text-muted-foreground">
          No records match your current filter criteria
        </div>
      )}
    </div>
  );
};

export default CardView;
