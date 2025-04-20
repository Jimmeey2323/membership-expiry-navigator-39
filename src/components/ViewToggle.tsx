
import React from 'react';
import { ViewType } from '@/types';
import { Button } from '@/components/ui/button';
import { TableIcon, CalendarIcon, LayoutIcon } from 'lucide-react';

interface ViewToggleProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onChange }) => {
  const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] = [
    { value: 'kanban', label: 'Kanban', icon: <LayoutIcon className="h-4 w-4" /> },
    { value: 'card', label: 'Cards', icon: <LayoutIcon className="h-4 w-4" /> },
    { value: 'table', label: 'Table', icon: <TableIcon className="h-4 w-4" /> },
    { value: 'timeline', label: 'Timeline', icon: <CalendarIcon className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom', icon: <LayoutIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {viewOptions.map((option) => (
        <Button
          key={option.value}
          variant={activeView === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="flex items-center space-x-1"
        >
          {option.icon}
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ViewToggle;
