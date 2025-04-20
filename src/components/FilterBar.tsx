
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { FilterOptions, PeriodGrouping, SortDirection, SortField } from '@/types';

interface FilterBarProps {
  membershipOptions: string[];
  locationOptions: string[];
  tagOptions: string[];
  assigneeOptions: string[];
  onFilterChange: (filters: FilterOptions) => void;
  sortField?: SortField;
  setSortField?: (field: SortField) => void;
  sortDirection?: SortDirection;
  setSortDirection?: (direction: SortDirection) => void;
  periodGrouping?: PeriodGrouping;
  setPeriodGrouping?: (period: PeriodGrouping) => void;
  availableTags?: string[];
  availableMemberships?: string[];
  availableLocations?: string[];
  showPeriodSelector?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  membershipOptions,
  locationOptions,
  tagOptions,
  assigneeOptions,
  onFilterChange,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  periodGrouping,
  setPeriodGrouping,
  availableTags,
  availableMemberships,
  availableLocations,
  showPeriodSelector,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (!value || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    onFilterChange({});
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    handleFilterChange('search', searchValue);
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'search'
  ).length;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-10"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="bg-background border rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-medium">Filter Memberships</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Membership Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Membership Type
              </label>
              <Select
                onValueChange={(value) => 
                  handleFilterChange('membershipName', value === "all" ? [] : [value])
                }
                value={filters.membershipName?.[0] || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any membership</SelectItem>
                  {(availableMemberships || membershipOptions).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Home Location Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Home Location
              </label>
              <Select
                onValueChange={(value) => 
                  handleFilterChange('homeLocation', value === "all" ? [] : [value])
                }
                value={filters.homeLocation?.[0] || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any location</SelectItem>
                  {(availableLocations || locationOptions).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <Select
                onValueChange={(value) => 
                  handleFilterChange('tags', value === "all" ? [] : [value])
                }
                value={filters.tags?.[0] || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any tag</SelectItem>
                  {(availableTags || tagOptions).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assigned To
              </label>
              <Select
                onValueChange={(value) => 
                  handleFilterChange('assignedTo', value === "all" ? undefined : value)
                }
                value={filters.assignedTo || "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any assignee</SelectItem>
                  {assigneeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expires Before Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Expires Before
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.expiresBefore
                      ? formatDate(filters.expiresBefore)
                      : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.expiresBefore ? new Date(filters.expiresBefore) : undefined}
                    onSelect={(date) =>
                      handleFilterChange(
                        'expiresBefore',
                        date ? date.toISOString() : undefined
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Expires After Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Expires After
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.expiresAfter
                      ? formatDate(filters.expiresAfter)
                      : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.expiresAfter ? new Date(filters.expiresAfter) : undefined}
                    onSelect={(date) =>
                      handleFilterChange(
                        'expiresAfter',
                        date ? date.toISOString() : undefined
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Period Grouping Selector (conditionally rendered) */}
            {showPeriodSelector && setPeriodGrouping && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group by Period
                </label>
                <Select
                  value={periodGrouping}
                  onValueChange={(value) => 
                    setPeriodGrouping(value as PeriodGrouping)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Sort Field Selector */}
            {setSortField && sortField && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <Select
                  value={sortField}
                  onValueChange={(value) => 
                    setSortField(value as SortField)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customerName">Customer Name</SelectItem>
                    <SelectItem value="expiresAt">Expiration Date</SelectItem>
                    <SelectItem value="membershipName">Membership Type</SelectItem>
                    <SelectItem value="homeLocation">Location</SelectItem>
                    <SelectItem value="daysLapsed">Days Lapsed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Sort Direction */}
            {setSortDirection && sortDirection && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort Direction
                </label>
                <Select
                  value={sortDirection}
                  onValueChange={(value) => 
                    setSortDirection(value as SortDirection)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" onClick={clearFilters}>
              Reset Filters
            </Button>
            <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
