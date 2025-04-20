
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

interface TableViewProps {
  data: {
    allRecords: MembershipRecord[];
  };
}

const TableView: React.FC<TableViewProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.allRecords.map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{record.customerName}</TableCell>
              <TableCell>{record.customerEmail}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.membershipName}</Badge>
              </TableCell>
              <TableCell>
                {record.expiresAt && new Date(record.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{record.homeLocation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
