
import React, { useState } from 'react';
import { ProcessedData, ViewType } from '@/types';
import ViewToggle from './ViewToggle';
import KanbanView from './views/KanbanView';
import CardView from './views/CardView';
import TableView from './views/TableView';
import TimelineView from './views/TimelineView';
import CustomView from './views/CustomView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataVisualizationProps {
  data: ProcessedData;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const [activeView, setActiveView] = useState<ViewType>('card');
  const [groupBy, setGroupBy] = useState<'membershipName' | 'period' | 'month' | 'homeLocation'>('membershipName');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4">
            <ViewToggle activeView={activeView} onChange={setActiveView} />
          </CardContent>
        </Card>
        
        {activeView === 'kanban' && (
          <Card className="w-full md:w-auto">
            <CardContent className="p-4">
              <Tabs defaultValue={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
                <TabsList>
                  <TabsTrigger value="membershipName">By Membership</TabsTrigger>
                  <TabsTrigger value="period">By Period</TabsTrigger>
                  <TabsTrigger value="month">By Month</TabsTrigger>
                  <TabsTrigger value="homeLocation">By Location</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Membership Expiration Analysis</h2>
          <p className="text-sm text-muted-foreground">
            {data.allRecords.length} active memberships found
          </p>
        </div>
        
        {activeView === 'kanban' && (
          <KanbanView data={data} groupBy={groupBy} />
        )}
        
        {activeView === 'card' && (
          <CardView data={data} />
        )}
        
        {activeView === 'table' && (
          <TableView data={data} />
        )}
        
        {activeView === 'timeline' && (
          <TimelineView data={data} />
        )}
        
        {activeView === 'custom' && (
          <CustomView data={data} />
        )}
      </div>
    </div>
  );
};

export default DataVisualization;
