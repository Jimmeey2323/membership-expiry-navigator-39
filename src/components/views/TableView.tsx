
import React, { useState } from 'react';
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
import { User, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableViewProps {
  data: {
    allRecords: MembershipRecord[];
  };
  onRecordClick: (record: MembershipRecord) => void;
}

type SortConfig = {
  key: keyof MembershipRecord | '';
  direction: 'asc' | 'desc';
};

const TableView: React.FC<TableViewProps> = ({ data, onRecordClick }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const getSortedRecords = () => {
    if (!sortConfig.key) return data.allRecords;

    return [...data.allRecords].sort((a, b) => {
      if (a[sortConfig.key] === b[sortConfig.key]) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  };

  const sortedRecords = getSortedRecords();

  const handleSort = (key: keyof MembershipRecord) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey: keyof MembershipRecord) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const renderSortableHeader = (key: keyof MembershipRecord, label: string) => (
    <TableHead>
      <button 
        onClick={() => handleSort(key)}
        className="flex items-center text-left font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        {label}
        {getSortIcon(key)}
      </button>
    </TableHead>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {renderSortableHeader('customerName', 'Customer Name')}
            {renderSortableHeader('customerEmail', 'Email')}
            {renderSortableHeader('membershipName', 'Membership')}
            {renderSortableHeader('expiresAt', 'Expiration Date')}
            <TableHead>Days Lapsed</TableHead>
            {renderSortableHeader('homeLocation', 'Location')}
            <TableHead>Tags</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.map((record, index) => (
            <TableRow 
              key={`${record.customerEmail}-${index}`}
              className="cursor-pointer transition-colors hover:bg-primary/5"
              onClick={() => onRecordClick(record)}
            >
              <TableCell className="font-medium">{record.customerName}</TableCell>
              <TableCell>{record.customerEmail}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  {record.membershipName}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                {record.expiresAt && formatDate(record.expiresAt)}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "font-mono",
                  record.daysLapsed && record.daysLapsed > 0 
                    ? 'text-destructive' 
                    : 'text-green-600'
                )}>
                  {formatDaysLapsed(record.daysLapsed)}
                </span>
              </TableCell>
              <TableCell>{record.homeLocation}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {record.tags?.slice(0, 2).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {record.tags && record.tags.length > 2 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      +{record.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {record.assignedTo ? (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-primary" />
                    <span>{record.assignedTo}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Unassigned</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {sortedRecords.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={8} 
                className="text-center py-8 text-muted-foreground animate-fade-in"
              >
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
