
import React from 'react';
import { MembershipRecord, ProcessedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CustomViewProps {
  data: ProcessedData;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

const CustomView: React.FC<CustomViewProps> = ({ data }) => {
  // Prepare data for charts
  const membershipChartData = Object.entries(data.byMembershipName).map(([name, records], index) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value: records.length,
    color: COLORS[index % COLORS.length],
  }));

  const locationChartData = Object.entries(data.byHomeLocation).map(([name, records], index) => ({
    name: name === 'N/A' ? 'Not Specified' : name.length > 15 ? name.substring(0, 15) + '...' : name,
    value: records.length,
    color: COLORS[index % COLORS.length],
  }));

  // Stats calculation
  const totalMembers = data.allRecords.length;
  const uniqueLocations = Object.keys(data.byHomeLocation).length;
  const uniqueMemberships = Object.keys(data.byMembershipName).length;
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-xl font-bold">{totalMembers}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-xl font-bold">{uniqueMemberships}</p>
            <p className="text-sm text-muted-foreground">Membership Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-xl font-bold">{uniqueLocations}</p>
            <p className="text-sm text-muted-foreground">Locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="distribution">Membership Distribution</TabsTrigger>
          <TabsTrigger value="location">Location Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Membership Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={membershipChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Members">
                      {membershipChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <div className="h-[300px] w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {locationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Top Membership Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Membership Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.byMembershipName)
              .sort(([, recordsA], [, recordsB]) => recordsB.length - recordsA.length)
              .slice(0, 5)
              .map(([membershipName, records], index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium">{membershipName}</span>
                  </div>
                  <Badge variant="outline">{records.length} members</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomView;
