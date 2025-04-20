
import React from 'react';
import { ExportFormat, MembershipRecord } from '@/types';
import { Button } from './ui/button';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { exportData } from '@/utils/exportData';
import { toast } from './ui/use-toast';

interface ExportOptionsProps {
  data: MembershipRecord[];
  onExport?: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ data, onExport }) => {
  const handleExport = (format: ExportFormat) => {
    if (data.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Please load some data first.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const fileName = `membership-expirations-${new Date().toISOString().split('T')[0]}`;
      exportData(data, format, fileName);
      
      toast({
        title: 'Export successful',
        description: `Data exported as ${format.toUpperCase()}.`,
      });
      
      if (onExport) onExport();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the data.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOptions;
