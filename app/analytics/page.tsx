'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  Target,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for charts
const projectData = [
  { name: 'Jan', completed: 12, inProgress: 8, planned: 15 },
  { name: 'Feb', completed: 19, inProgress: 12, planned: 18 },
  { name: 'Mar', completed: 15, inProgress: 10, planned: 22 },
  { name: 'Apr', completed: 25, inProgress: 15, planned: 20 },
  { name: 'May', completed: 22, inProgress: 18, planned: 25 },
  { name: 'Jun', completed: 30, inProgress: 20, planned: 28 },
];

const teamPerformance = [
  { name: 'Sarah Johnson', tasksCompleted: 45, efficiency: 92, projects: 8 },
  { name: 'Mike Wilson', tasksCompleted: 38, efficiency: 88, projects: 6 },
  { name: 'Emily Davis', tasksCompleted: 42, efficiency: 90, projects: 7 },
  { name: 'John Smith', tasksCompleted: 35, efficiency: 85, projects: 5 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    const data = {
      timeRange,
      exportDate: new Date().toISOString(),
      metrics: {
        totalProjects: 45,
        completedTasks: 234,
        teamMembers: 8,
        efficiency: 89,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Insights and metrics for your workspace performance
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-gray-900">45</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +12% from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Tasks
                  </p>
                  <p className="text-3xl font-bold text-gray-900">234</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +8% from last month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Team Members
                  </p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +1 this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Completion Time
                  </p>
                  <p className="text-3xl font-bold text-gray-900">3.2d</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">-15% faster</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>
                    Current status of all projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">18 projects</span>
                        <Badge className="bg-green-100 text-green-800">
                          40%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">20 projects</span>
                        <Badge className="bg-blue-100 text-blue-800">44%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Planning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">7 projects</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          16%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest workspace activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: 'Project completed',
                        project: 'Website Redesign',
                        time: '2 hours ago',
                        type: 'success',
                      },
                      {
                        action: 'New task created',
                        project: 'Mobile App',
                        time: '4 hours ago',
                        type: 'info',
                      },
                      {
                        action: 'Team member added',
                        project: 'Marketing Campaign',
                        time: '1 day ago',
                        type: 'info',
                      },
                      {
                        action: 'Milestone reached',
                        project: 'Product Launch',
                        time: '2 days ago',
                        type: 'success',
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === 'success'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600">
                            {activity.project}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of project metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Website Redesign',
                      progress: 100,
                      tasks: 24,
                      completed: 24,
                      team: 5,
                      status: 'Completed',
                    },
                    {
                      name: 'Mobile App Development',
                      progress: 75,
                      tasks: 32,
                      completed: 24,
                      team: 6,
                      status: 'In Progress',
                    },
                    {
                      name: 'Marketing Campaign',
                      progress: 60,
                      tasks: 18,
                      completed: 11,
                      team: 4,
                      status: 'In Progress',
                    },
                    {
                      name: 'Product Launch',
                      progress: 30,
                      tasks: 25,
                      completed: 8,
                      team: 7,
                      status: 'Planning',
                    },
                  ].map((project, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge
                          variant={
                            project.status === 'Completed'
                              ? 'default'
                              : project.status === 'In Progress'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Progress</p>
                          <p className="font-medium">{project.progress}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tasks</p>
                          <p className="font-medium">
                            {project.completed}/{project.tasks}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Team Size</p>
                          <p className="font-medium">{project.team} members</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <p className="font-medium">
                            {Math.round(
                              (project.completed / project.tasks) * 100
                            )}
                            %
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
                <CardDescription>
                  Individual team member statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                          {member.efficiency}% Efficiency
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Tasks Completed</p>
                          <p className="font-medium text-lg">
                            {member.tasksCompleted}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Active Projects</p>
                          <p className="font-medium text-lg">
                            {member.projects}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg. Tasks/Project</p>
                          <p className="font-medium text-lg">
                            {Math.round(
                              member.tasksCompleted / member.projects
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Productivity Trends</CardTitle>
                  <CardDescription>Task completion over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>This Week</span>
                      <span className="font-medium">42 tasks completed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Week</span>
                      <span className="font-medium">38 tasks completed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>2 Weeks Ago</span>
                      <span className="font-medium">35 tasks completed</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>3 Weeks Ago</span>
                      <span className="font-medium">31 tasks completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Project Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">+15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Team Productivity</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">+8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Task Time</span>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">-12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Client Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">+5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
