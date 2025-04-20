
import React, { useState } from 'react';
import { FilterOptions, SortDirection, SortField, PeriodGrouping } from '@/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CalendarIcon, Filter, SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from './ui/checkbox';

interface FilterBarProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  sortField: SortField;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  periodGrouping?: PeriodGrouping;
  setPeriodGrouping?: React.Dispatch<React.SetStateAction<PeriodGrouping>>;
  availableTags: string[];
  availableMemberships: string[];
  availableLocations: string[];
  showPeriodSelector?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  setFilterOptions,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  periodGrouping,
  setPeriodGrouping,
  availableTags,
  availableMemberships,
  availableLocations,
  showPeriodSelector = false
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ 
    from?: Date | undefined; 
    to?: Date | undefined; 
  }>({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions(prev => ({ ...prev, search: e.target.value }));
  };

  const handleTagFilter = (tag: string) => {
    setFilterOptions(prev => {
      const currentTags = prev.tags || [];
      // Toggle tag selection
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleDateRangeChange = () => {
    setFilterOptions(prev => ({
      ...prev,
      expiresBefore: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      expiresAfter: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleAssigneeChange = (value: string) => {
    setFilterOptions(prev => ({ ...prev, assignedTo: value === 'all' ? undefined : value }));
  };

  const handleResetFilters = () => {
    setFilterOptions({});
    setSortField('expiresAt');
    setSortDirection('asc');
    setDateRange({});
    if (setPeriodGrouping) setPeriodGrouping('month');
  };

  return (
    <div className="flex flex-col space-y-4 bg-white p-4 rounded-lg shadow-sm border border-border animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {/* Search input */}
        <div className="relative w-full md:w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filterOptions.search || ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Sort selector */}
        <Select
          value={sortField}
          onValueChange={(value) => setSortField(value as SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customerName">Name</SelectItem>
            <SelectItem value="expiresAt">Expiry Date</SelectItem>
            <SelectItem value="membershipName">Membership</SelectItem>
            <SelectItem value="homeLocation">Location</SelectItem>
            <SelectItem value="daysLapsed">Days Lapsed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort direction */}
        <Select
          value={sortDirection}
          onValueChange={(value) => setSortDirection(value as SortDirection)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        {/* Period grouping selector (only shown when needed) */}
        {showPeriodSelector && setPeriodGrouping && (
          <Select
            value={periodGrouping}
            onValueChange={(value) => setPeriodGrouping(value as PeriodGrouping)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <CalendarIcon className="h-4 w-4" />
              {filterOptions.expiresAfter || filterOptions.expiresBefore 
                ? `${filterOptions.expiresAfter || 'Any'} - ${filterOptions.expiresBefore || 'Any'}` 
                : "Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range || {});
              }}
              initialFocus
              footer={
                <div className="flex justify-end p-2">
                  <Button variant="outline" size="sm" onClick={handleDateRangeChange}>Apply</Button>
                </div>
              }
            />
          </PopoverContent>
        </Popover>

        {/* Assignee dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              {filterOptions.assignedTo || "Assignee"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
            <div className="space-y-2">
              <div className="font-medium">Select Assignee</div>
              <Select onValueChange={handleAssigneeChange} value={filterOptions.assignedTo || 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Associates</SelectItem>
                  <SelectItem value="Admin Admin">Admin Admin</SelectItem>
                  <SelectItem value="Akshay Rane">Akshay Rane</SelectItem>
                  <SelectItem value="Api Serou">Api Serou</SelectItem>
                  <SelectItem value="Imran Shaikh">Imran Shaikh</SelectItem>
                  <SelectItem value="Jayanta Banerjee">Jayanta Banerjee</SelectItem>
                  <SelectItem value="Manisha Rathod">Manisha Rathod</SelectItem>
                  <SelectItem value="Prathap Kp">Prathap Kp</SelectItem>
                  <SelectItem value="Priyanka Abnave">Priyanka Abnave</SelectItem>
                  <SelectItem value="Santhosh Kumar">Santhosh Kumar</SelectItem>
                  <SelectItem value="Sheetal Kataria">Sheetal Kataria</SelectItem>
                  <SelectItem value="Shipra Bhika">Shipra Bhika</SelectItem>
                  <SelectItem value="Tahira Sayyed">Tahira Sayyed</SelectItem>
                  <SelectItem value="Zahur Shaikh">Zahur Shaikh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        {/* More filters - Memberships and Locations */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Memberships</div>
                <div className="space-y-1">
                  {availableMemberships.map(membership => (
                    <div className="flex items-center space-x-2" key={membership}>
                      <Checkbox 
                        id={`membership-${membership}`}
                        checked={(filterOptions.membershipName || []).includes(membership)}
                        onCheckedChange={() => {
                          setFilterOptions(prev => {
                            const currentMemberships = prev.membershipName || [];
                            if (currentMemberships.includes(membership)) {
                              return { 
                                ...prev, 
                                membershipName: currentMemberships.filter(m => m !== membership) 
                              };
                            } else {
                              return { 
                                ...prev, 
                                membershipName: [...currentMemberships, membership] 
                              };
                            }
                          });
                        }}
                      />
                      <label 
                        htmlFor={`membership-${membership}`}
                        className="text-sm cursor-pointer"
                      >
                        {membership}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Locations</div>
                <div className="space-y-1">
                  {availableLocations.map(location => (
                    <div className="flex items-center space-x-2" key={location}>
                      <Checkbox 
                        id={`location-${location}`}
                        checked={(filterOptions.homeLocation || []).includes(location)}
                        onCheckedChange={() => {
                          setFilterOptions(prev => {
                            const currentLocations = prev.homeLocation || [];
                            if (currentLocations.includes(location)) {
                              return { 
                                ...prev, 
                                homeLocation: currentLocations.filter(l => l !== location) 
                              };
                            } else {
                              return { 
                                ...prev, 
                                homeLocation: [...currentLocations, location] 
                              };
                            }
                          });
                        }}
                      />
                      <label 
                        htmlFor={`location-${location}`}
                        className="text-sm cursor-pointer"
                      >
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleResetFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tags section */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Badge 
            key={tag}
            variant={(filterOptions.tags || []).includes(tag) ? "default" : "outline"}
            className={`cursor-pointer hover:bg-primary/90 transition-colors ${
              (filterOptions.tags || []).includes(tag) ? '' : 'hover:text-primary-foreground'
            }`}
            onClick={() => handleTagFilter(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
