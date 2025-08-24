import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Upload,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { apiCall } from "../../utils/api";
import AgentsContent from "../Agents/AgentsContent";
import UploadContent from "../Upload/UploadContent";
import AgentListsView from "../Lists/AgentListsView";
import DistributionsView from "./DistributionsView";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [agents, setAgents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentDistributions, setRecentDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch agents
      const agentsResponse = await apiCall("/agents?limit=100");
      if (agentsResponse.success) {
        setAgents(agentsResponse.data?.agents || agentsResponse.data || []);
      }

      // Fetch dashboard stats
      try {
        const statsResponse = await apiCall("/lists/dashboard-stats");
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
      } catch (error) {
        console.warn("Dashboard stats not available:", error);
      }

      // Fetch recent distributions (if endpoint exists)
      try {
        const distributionsResponse = await apiCall(
          "/lists/distributions?limit=5"
        );
        if (distributionsResponse.success) {
          setRecentDistributions(
            distributionsResponse.data?.distributions || []
          );
        }
      } catch (error) {
        console.warn("Recent distributions not available:", error);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDashboardData();
    // Switch to distributions tab to show the uploaded content
    setActiveTab("distributions");
  };

  const handleAgentUpdate = () => {
    fetchDashboardData();
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      id: "agents",
      label: "Agents",
      icon: Users,
    },
    {
      id: "upload",
      label: "Upload Lists",
      icon: Upload,
    },
    {
      id: "distributions",
      label: "Distributions",
      icon: FileText,
    },
    {
      id: "agent-performance",
      label: "Agent Performance",
      icon: Activity,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            stats={dashboardStats}
            agents={agents}
            recentDistributions={recentDistributions}
          />
        );
      case "agents":
        return <AgentsContent agents={agents} onUpdate={handleAgentUpdate} />;
      case "upload":
        return <UploadContent onUploadSuccess={handleUploadSuccess} />;
      case "distributions":
        return <DistributionsView />;
      case "agent-performance":
        return (
          <AgentListsView
            agents={agents}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        );
      default:
        return (
          <DashboardOverview
            stats={dashboardStats}
            agents={agents}
            recentDistributions={recentDistributions}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="purple" />
          <p className="text-lg font-medium text-gray-900 mt-4">
            Loading Dashboard...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats, agents, recentDistributions }) => {
  const activeAgents = agents.filter((agent) => agent.isActive).length;
  const totalAgents = agents.length;
  console.log(recentDistributions);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to your List Distribution Management System
          </p>
        </div>
      </FadeIn>

      {/* Key Metrics */}
      <FadeIn delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Agents
                </p>
                <p className="text-3xl font-bold">{totalAgents}</p>
                <p className="text-blue-200 text-xs mt-1">
                  {activeAgents} active
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Total Items
                </p>
                <p className="text-3xl font-bold">{stats?.totalItems || 0}</p>
                <p className="text-green-200 text-xs mt-1">All time</p>
              </div>
              <FileText className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">
                  {stats?.completedItems || 0}
                </p>
                <p className="text-yellow-200 text-xs mt-1">
                  {stats?.totalItems > 0
                    ? Math.round(
                        (stats.completedItems / stats.totalItems) * 100
                      )
                    : 0}
                  % completion
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  In Progress
                </p>
                <p className="text-3xl font-bold">
                  {stats?.inProgressItems || 0}
                </p>
                <p className="text-purple-200 text-xs mt-1">Active tasks</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={200}>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <Users className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-purple-600">
                Add New Agent
              </p>
              <p className="text-sm text-gray-500">
                Create a new agent account
              </p>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-purple-600">
                Upload Lists
              </p>
              <p className="text-sm text-gray-500">
                Upload and distribute new lists
              </p>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group">
              <BarChart3 className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900 group-hover:text-purple-600">
                View Reports
              </p>
              <p className="text-sm text-gray-500">Check agent performance</p>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={300}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Agents
            </h3>
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent._id} className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No agents found</p>
                  <p className="text-xs">
                    Create your first agent to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  System Health
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Active Distributions
                </span>
                <span className="text-sm text-gray-900">
                  {stats?.activeDistributions || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Pending Items
                </span>
                <span className="text-sm text-gray-900">
                  {stats?.pendingItems || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Last Upload
                </span>
                <span className="text-sm text-gray-900">
                  {stats?.lastUpload
                    ? new Date(stats.lastUpload).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Dashboard;
