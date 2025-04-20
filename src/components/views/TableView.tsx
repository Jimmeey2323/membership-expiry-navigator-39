
import React from 'react';
import { MembershipRecord } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDaysLapsed } from '@/utils/dateUtils';
import { User } from 'lucide-react';

interface TableViewProps {
  data: {
    allRecords: MembershipRecord[];
  };
  onRecordClick: (record: MembershipRecord) => void;
}

const TableView: React.FC<TableViewProps> = ({ data, onRecordClick }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Days Lapsed</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.allRecords.map((record, index) => (
            <TableRow 
              key={`${record.customerEmail}-${index}`}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => onRecordClick(record)}
            >
              <TableCell className="font-medium">{record.customerName}</TableCell>
              <TableCell>{record.customerEmail}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.membershipName}</Badge>
              </TableCell>
              <TableCell>
                {record.expiresAt && formatDate(record.expiresAt)}
              </TableCell>
              <TableCell>
                <span className={record.daysLapsed && record.daysLapsed > 0 ? 'text-destructive' : 'text-green-600'}>
                  {formatDaysLapsed(record.daysLapsed)}
                </span>
              </TableCell>
              <TableCell>{record.homeLocation}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {record.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {record.tags && record.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{record.tags.length - 2}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {record.assignedTo ? (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{record.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {data.allRecords.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No records match your current filter criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
