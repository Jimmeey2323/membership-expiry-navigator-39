
import React, { useState, useMemo } from 'react';
import { 
  FilterOptions, 
  MembershipRecord, 
  PeriodGrouping, 
  ProcessedData, 
  SortDirection, 
  SortField, 
  ViewType 
} from '@/types';
import ViewToggle from './ViewToggle';
import KanbanView from './views/KanbanView';
import CardView from './views/CardView';
import TableView from './views/TableView';
import TimelineView from './views/TimelineView';
import CustomView from './views/CustomView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterBar from './FilterBar';
import MembershipModal from './MembershipModal';
import ExportOptions from './ExportOptions';
import { groupByPeriod } from '@/utils/dateUtils';

interface DataVisualizationProps {
  data: ProcessedData;
  onDataUpdate: (updatedRecords: MembershipRecord[]) => void;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, onDataUpdate }) => {
  const [activeView, setActiveView] = useState<ViewType>('card');
  const [groupBy, setGroupBy] = useState<'membershipName' | 'period' | 'month' | 'homeLocation'>('membershipName');
  const [periodGrouping, setPeriodGrouping] = useState<PeriodGrouping>('month');
  const [sortField, setSortField] = useState<SortField>('expiresAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [selectedRecord, setSelectedRecord] = useState<MembershipRecord | null>(null);
  
  // Extract unique values for filtering
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    data.allRecords.forEach(record => {
      record.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [data.allRecords]);
  
  const availableMemberships = useMemo(() => {
    return Array.from(new Set(data.allRecords.map(record => record.membershipName)));
  }, [data.allRecords]);
  
  const availableLocations = useMemo(() => {
    return Array.from(new Set(data.allRecords.map(record => record.homeLocation)));
  }, [data.allRecords]);
  
  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return data.allRecords.filter(record => {
      // Filter by search term
      if (filterOptions.search && !record.customerName.toLowerCase().includes(filterOptions.search.toLowerCase()) && 
          !record.customerEmail.toLowerCase().includes(filterOptions.search.toLowerCase())) {
        return false;
      }
      
      // Filter by membership name
      if (filterOptions.membershipName && filterOptions.membershipName.length > 0 && 
          !filterOptions.membershipName.includes(record.membershipName)) {
        return false;
      }
      
      // Filter by home location
      if (filterOptions.homeLocation && filterOptions.homeLocation.length > 0 && 
          !filterOptions.homeLocation.includes(record.homeLocation)) {
        return false;
      }
      
      // Filter by tags
      if (filterOptions.tags && filterOptions.tags.length > 0 && 
          !filterOptions.tags.some(tag => record.tags?.includes(tag))) {
        return false;
      }
      
      // Filter by date range
      if (filterOptions.expiresAfter && record.expiresAt && 
          new Date(record.expiresAt) < new Date(filterOptions.expiresAfter)) {
        return false;
      }
      
      if (filterOptions.expiresBefore && record.expiresAt && 
          new Date(record.expiresAt) > new Date(filterOptions.expiresBefore)) {
        return false;
      }
      
      // Filter by assignee
      if (filterOptions.assignedTo && record.assignedTo !== filterOptions.assignedTo) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by chosen field
      switch (sortField) {
        case 'customerName':
          return sortDirection === 'asc' 
            ? a.customerName.localeCompare(b.customerName)
            : b.customerName.localeCompare(a.customerName);
        
        case 'expiresAt':
          if (!a.expiresAt) return sortDirection === 'asc' ? -1 : 1;
          if (!b.expiresAt) return sortDirection === 'asc' ? 1 : -1;
          return sortDirection === 'asc'
            ? new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
            : new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        
        case 'membershipName':
          return sortDirection === 'asc'
            ? a.membershipName.localeCompare(b.membershipName)
            : b.membershipName.localeCompare(a.membershipName);
        
        case 'homeLocation':
          return sortDirection === 'asc'
            ? a.homeLocation.localeCompare(b.homeLocation)
            : b.homeLocation.localeCompare(a.homeLocation);
        
        case 'daysLapsed':
          const aDays = a.daysLapsed || 0;
          const bDays = b.daysLapsed || 0;
          return sortDirection === 'asc' ? aDays - bDays : bDays - aDays;
        
        default:
          return 0;
      }
    });
  }, [data.allRecords, filterOptions, sortField, sortDirection]);
  
  // Group filtered records by various criteria for views
  const groupedData = useMemo(() => {
    const byMembershipName: Record<string, MembershipRecord[]> = {};
    const byHomeLocation: Record<string, MembershipRecord[]> = {};
    let byPeriod: Record<string, MembershipRecord[]> = {};
    
    // Group by membership name
    filteredRecords.forEach(record => {
      // By membership name
      if (!byMembershipName[record.membershipName]) {
        byMembershipName[record.membershipName] = [];
      }
      byMembershipName[record.membershipName].push(record);
      
      // By home location
      if (!byHomeLocation[record.homeLocation]) {
        byHomeLocation[record.homeLocation] = [];
      }
      byHomeLocation[record.homeLocation].push(record);
    });
    
    // Group by period according to selected grouping
    byPeriod = groupByPeriod(filteredRecords, periodGrouping);
    
    return {
      byMembershipName,
      byPeriod,
      byHomeLocation,
      allRecords: filteredRecords
    };
  }, [filteredRecords, periodGrouping]);
  
  const handleRecordClick = (record: MembershipRecord) => {
    setSelectedRecord(record);
  };
  
  const handleRecordUpdate = (updatedRecord: MembershipRecord) => {
    const updatedRecords = data.allRecords.map(record => 
      record.customerEmail === updatedRecord.customerEmail ? updatedRecord : record
    );
    onDataUpdate(updatedRecords);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Card className="w-full lg:w-auto">
          <CardContent className="p-4 flex items-center gap-4">
            <ViewToggle activeView={activeView} onChange={setActiveView} />
            
            {activeView === 'kanban' && (
              <Tabs 
                defaultValue={groupBy} 
                onValueChange={(value) => setGroupBy(value as any)}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="membershipName">By Membership</TabsTrigger>
                  <TabsTrigger value="period">By Period</TabsTrigger>
                  <TabsTrigger value="homeLocation">By Location</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </CardContent>
        </Card>
        
        <ExportOptions data={filteredRecords} />
      </div>
      
      <FilterBar
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        periodGrouping={activeView === 'kanban' && groupBy === 'period' ? periodGrouping : undefined}
        setPeriodGrouping={activeView === 'kanban' && groupBy === 'period' ? setPeriodGrouping : undefined}
        availableTags={availableTags}
        availableMemberships={availableMemberships}
        availableLocations={availableLocations}
        showPeriodSelector={activeView === 'kanban' && groupBy === 'period'}
      />
      
      <div className="bg-white rounded-lg shadow-sm p-4 border animate-float-in">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Membership Expiration Analysis</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRecords.length} active memberships found
              {filterOptions.search || filterOptions.tags?.length || filterOptions.membershipName?.length || filterOptions.homeLocation?.length
                ? ' (filtered)'
                : ''}
            </p>
          </div>
        </div>
        
        {activeView === 'kanban' && (
          <KanbanView 
            data={groupedData} 
            groupBy={groupBy} 
            onRecordClick={handleRecordClick}
          />
        )}
        
        {activeView === 'card' && (
          <CardView 
            data={groupedData} 
            onRecordClick={handleRecordClick}
          />
        )}
        
        {activeView === 'table' && (
          <TableView 
            data={groupedData}
            onRecordClick={handleRecordClick}
          />
        )}
        
        {activeView === 'timeline' && (
          <TimelineView 
            data={groupedData} 
            onRecordClick={handleRecordClick}
          />
        )}
        
        {activeView === 'custom' && (
          <CustomView 
            data={groupedData} 
            onRecordClick={handleRecordClick}
          />
        )}
      </div>

      {/* Modal for viewing and editing records */}
      <MembershipModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onUpdate={handleRecordUpdate}
      />
    </div>
  );
};

export default DataVisualization;
