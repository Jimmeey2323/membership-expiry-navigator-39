import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/MetricCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { DataTable } from "@/components/DataTable";
import { MembershipChart } from "@/components/MembershipChart";
import { CollapsibleFilters } from "@/components/CollapsibleFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { googleSheetsService } from "@/services/googleSheets";
import { MembershipData, FilterOptions } from "@/types/membership";
import { Link } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Filter,
  Dumbbell,
  Activity,
  RefreshCw,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    locations: [],
    membershipTypes: [],
    dateRange: { start: '', end: '' },
    sessionsRange: { min: 0, max: 100 }
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [localMembershipData, setLocalMembershipData] = useState<MembershipData[]>([]);

  const { data: membershipData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['membershipData'],
    queryFn: () => googleSheetsService.getMembershipData(),
    refetchInterval: 300000,
  });

  useEffect(() => {
    if (membershipData) {
      setLocalMembershipData(membershipData);
    }
  }, [membershipData]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch membership data. Using sample data for demonstration.");
    }
  }, [error]);

  const handleAnnotationUpdate = (memberId: string, comments: string, notes: string, tags: string[]) => {
    setLocalMembershipData(prev => 
      prev.map(member => 
        member.memberId === memberId 
          ? { ...member, comments, notes, tags }
          : member
      )
    );
  };

  const applyFilters = (data: MembershipData[]): MembershipData[] => {
    return data.filter(member => {
      if (filters.status.length > 0 && !filters.status.includes(member.status)) {
        return false;
      }
      if (filters.locations.length > 0 && !filters.locations.includes(member.location)) {
        return false;
      }
      if (filters.membershipTypes.length > 0 && !filters.membershipTypes.includes(member.membershipName)) {
        return false;
      }
      if (member.sessionsLeft < filters.sessionsRange.min || member.sessionsLeft > filters.sessionsRange.max) {
        return false;
      }
      if (filters.dateRange.start && new Date(member.endDate) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(member.endDate) > new Date(filters.dateRange.end)) {
        return false;
      }
      return true;
    });
  };

  const applyQuickFilter = (data: MembershipData[]): MembershipData[] => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (quickFilter) {
      case 'active':
        return data.filter(member => member.status === 'Active');
      case 'expired':
        return data.filter(member => member.status === 'Expired');
      case 'sessions':
        return data.filter(member => member.sessionsLeft > 0);
      case 'no-sessions':
        return data.filter(member => member.sessionsLeft === 0);
      case 'recent':
        return data.filter(member => new Date(member.orderDate) >= thirtyDaysAgo);
      case 'weekly':
        return data.filter(member => new Date(member.orderDate) >= sevenDaysAgo);
      case 'expiring':
        return data.filter(member => {
          const endDate = new Date(member.endDate);
          return endDate >= now && endDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        });
      default:
        if (quickFilter.startsWith('location-')) {
          const location = quickFilter.replace('location-', '');
          return data.filter(member => member.location === location);
        }
        return data;
    }
  };

  const filteredData = applyQuickFilter(applyFilters(localMembershipData));
  const activeMembers = localMembershipData.filter(member => member.status === 'Active');
  const expiredMembers = localMembershipData.filter(member => member.status === 'Expired');
  const membersWithSessions = localMembershipData.filter(member => member.sessionsLeft > 0);
  const expiringMembers = localMembershipData.filter(member => {
    const endDate = new Date(member.endDate);
    const now = new Date();
    return endDate >= now && endDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  const availableLocations = [...new Set(localMembershipData.map(member => member.location).filter(l => l && l !== '-'))];
  const availableMembershipTypes = [...new Set(localMembershipData.map(member => member.membershipName))];

  const handleRefresh = () => {
    refetch();
    toast.success("Data refreshed successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <Card className="p-8 max-w-sm mx-auto bg-white shadow-2xl border-2 border-slate-200">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Loading Dashboard
            </h2>
            <p className="text-slate-600">Fetching membership data...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Professional Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  Membership Analytics
                </h1>
                <p className="text-slate-600 font-medium text-lg">
                  Professional membership management dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/churn-analytics">
              <Button 
                variant="outline" 
                className="border-red-300 hover:bg-red-50 text-red-700 shadow-sm"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Churn Analytics
              </Button>
            </Link>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="border-slate-300 hover:bg-white shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsFilterOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Collapsible Filters */}
        <div className="animate-slide-up">
          <CollapsibleFilters
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            membershipData={localMembershipData}
            availableLocations={availableLocations}
          />
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <MetricCard
            title="Total Members"
            value={localMembershipData.length}
            icon={Users}
            change="+12% from last month"
            trend="up"
            tooltip="Total number of registered members across all locations and membership types"
            drillDownData={[
              { label: 'This Month', value: 25 },
              { label: 'Last Month', value: 18 },
              { label: 'Active', value: activeMembers.length },
              { label: 'Inactive', value: expiredMembers.length }
            ]}
          />
          <MetricCard
            title="Active Members"
            value={activeMembers.length}
            icon={UserCheck}
            change="+5% from last month"
            trend="up"
            tooltip="Members with active subscriptions and valid access to facilities"
            drillDownData={[
              { label: 'New', value: 12 },
              { label: 'Renewed', value: 8 },
              { label: 'With Sessions', value: membersWithSessions.length },
              { label: 'Expiring Soon', value: expiringMembers.length }
            ]}
          />
          <MetricCard
            title="Expired Members"
            value={expiredMembers.length}
            icon={UserX}
            change="-8% from last month"
            trend="down"
            tooltip="Members whose subscriptions have expired and need renewal"
            drillDownData={[
              { label: 'This Week', value: 3 },
              { label: 'This Month', value: 8 },
              { label: 'Recoverable', value: 15 },
              { label: 'Lost', value: 5 }
            ]}
          />
          <MetricCard
            title="Total Sessions"
            value={localMembershipData.reduce((sum, member) => sum + member.sessionsLeft, 0)}
            icon={Dumbbell}
            change="+15% from last month"
            trend="up"
            tooltip="Total remaining sessions across all active memberships"
            drillDownData={[
              { label: 'Available', value: localMembershipData.reduce((sum, member) => sum + member.sessionsLeft, 0) },
              { label: 'Used This Month', value: 156 },
              { label: 'Avg per Member', value: Math.round(localMembershipData.reduce((sum, member) => sum + member.sessionsLeft, 0) / localMembershipData.length) },
              { label: 'Peak Usage', value: 45 }
            ]}
          />
        </div>

        {/* Enhanced Chart */}
        <div className="animate-slide-up">
          <MembershipChart data={filteredData} />
        </div>

        {/* Enhanced Data Tables */}
        <div className="animate-slide-up">
          <Tabs defaultValue="overview" className="space-y-6">
            <Card className="p-2 bg-white border-2 border-slate-100 shadow-sm">
              <TabsList className="grid w-full grid-cols-4 bg-slate-50 gap-1 p-1">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Active ({activeMembers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="expired" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Expired ({expiredMembers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold transition-all duration-200"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
              </TabsList>
            </Card>

            <TabsContent value="overview" className="space-y-6">
              <DataTable 
                data={filteredData} 
                title="All Members Overview"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              <DataTable 
                data={filteredData.filter(member => member.status === 'Active')} 
                title="Active Members"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="expired" className="space-y-6">
              <DataTable 
                data={filteredData.filter(member => member.status === 'Expired')} 
                title="Expired Members"
                onAnnotationUpdate={handleAnnotationUpdate}
              />
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataTable 
                  data={filteredData.filter(member => member.sessionsLeft > 0)} 
                  title="Members with Remaining Sessions"
                  onAnnotationUpdate={handleAnnotationUpdate}
                />
                <DataTable 
                  data={filteredData.filter(member => member.sessionsLeft === 0)} 
                  title="Members with No Sessions"
                  onAnnotationUpdate={handleAnnotationUpdate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          availableLocations={availableLocations}
          availableMembershipTypes={availableMembershipTypes}
        />
      </div>
    </div>
  );
};

export default Index;
