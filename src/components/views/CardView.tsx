
import React from 'react';
import { MembershipRecord } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CardViewProps {
  data: {
    allRecords: MembershipRecord[];
  };
}

const CardView: React.FC<CardViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.allRecords.map((record, index) => (
        <Card key={index} className="animate-float-in" style={{ animationDelay: `${index * 0.05}s` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{record.customerName}</CardTitle>
            <p className="text-sm text-muted-foreground">{record.customerEmail}</p>
          </CardHeader>
          <CardContent className="pb-2">
            <Badge className="mb-2">{record.membershipName}</Badge>
            {record.expiresAt && (
              <p className="text-sm mt-2">
                <span className="font-medium">Expires:</span>{' '}
                {new Date(record.expiresAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              {record.homeLocation}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CardView;
