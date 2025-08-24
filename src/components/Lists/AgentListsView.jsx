import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  User,
  FileText,
  Eye,
  Download,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { apiCall } from "../../utils/api";
import AgentJobSheetModal from "./AgentJobSheetModal";

const AgentListsView = ({ agents, searchTerm, onSearchChange }) => {
  const [agentLists, setAgentLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showJobSheet, setShowJobSheet] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  console.log(dashboardStats);

  useEffect(() => {
    if (agents && agents.length > 0) {
      fetchDashboardData();
    }
  }, [agents]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats - fixed endpoint
      try {
        const statsResponse = await apiCall("/lists/dashboard-stats");
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
      } catch (statsError) {
        console.warn("Dashboard stats not available:", statsError);
        // Continue without stats if endpoint is not implemented
      }

      // Fetch agent lists data
      await fetchAllAgentLists();
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load agent data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAgentLists = async () => {
    try {
      const agentListsPromises = agents.map(async (agent) => {
        try {
          // Fixed API endpoint to match backend route
          const response = await apiCall(
            `/lists/agent/${agent._id}?page=1&limit=1000`
          );

          if (response.success && response.data) {
            const lists = response.data.lists || [];
            const pagination = response.data.pagination || {};
            const stats = response.data.stats || calculateAgentStats(lists);

            return {
              agent,
              lists,
              stats,
              pagination,
              lastFetch: new Date(),
              hasError: false,
            };
          } else {
            throw new Error(response.message || "Failed to fetch agent data");
          }
        } catch (error) {
          console.error(
            `Failed to fetch lists for agent ${agent.name}:`,
            error
          );
          return {
            agent,
            lists: [],
            stats: getEmptyStats(),
            pagination: {},
            lastFetch: new Date(),
            hasError: true,
            error: error.message,
          };
        }
      });

      const results = await Promise.allSettled(agentListsPromises);
      const agentListsData = results
        .map((result) =>
          result.status === "fulfilled" ? result.value : result.reason
        )
        .filter(Boolean);

      setAgentLists(agentListsData);
    } catch (error) {
      console.error("Failed to fetch agent lists:", error);
      setError("Failed to load agent lists");
    }
  };

  const calculateAgentStats = (lists) => {
    let totalItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    let pendingItems = 0;
    let totalLists = lists.length;

    lists.forEach((list) => {
      totalItems += list.totalItems || 0;
      completedItems += list.completedItems || 0;
      inProgressItems += list.inProgressItems || 0;
      pendingItems += list.pendingItems || 0;
    });

    const completionRate =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const avgItemsPerList =
      totalLists > 0 ? Math.round(totalItems / totalLists) : 0;
    const productivityScore = calculateProductivityScore(
      completionRate,
      totalItems,
      totalLists
    );

    return {
      totalItems,
      completedItems,
      inProgressItems,
      pendingItems,
      totalLists,
      completionRate,
      avgItemsPerList,
      productivityScore,
    };
  };

  const calculateProductivityScore = (
    completionRate,
    totalItems,
    totalLists
  ) => {
    const completionWeight = completionRate * 0.6;
    const volumeWeight = Math.min((totalItems / 100) * 30, 30);
    const consistencyWeight = Math.min((totalLists / 10) * 10, 10);
    return Math.round(completionWeight + volumeWeight + consistencyWeight);
  };

  const getEmptyStats = () => ({
    totalItems: 0,
    completedItems: 0,
    inProgressItems: 0,
    pendingItems: 0,
    totalLists: 0,
    completionRate: 0,
    avgItemsPerList: 0,
    productivityScore: 0,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleViewJobSheet = useCallback(async (agentData) => {
    try {
      // Fetch fresh data for the selected agent
      const response = await apiCall(
        `/lists/agent/${agentData.agent._id}?page=1&limit=1000`
      );
      if (response.success) {
        const updatedAgentData = {
          ...agentData,
          lists: response.data.lists || [],
          stats: calculateAgentStats(response.data.lists || []),
        };
        setSelectedAgent(updatedAgentData);
      } else {
        setSelectedAgent(agentData);
      }
    } catch (error) {
      console.error("Failed to fetch fresh agent data:", error);
      setSelectedAgent(agentData);
    }
    setShowJobSheet(true);
  }, []);

  const handleExportAgent = async (agentData) => {
    try {
      alert("Export functionality will be implemented soon!");
      console.log(agentData);

      // TODO: Implement export functionality when backend endpoint is ready
    } catch (error) {
      console.error("Failed to export agent data:", error);
      alert("Failed to export agent data: " + error.message);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agentLists.filter((agentData) => {
      // Search filter
      const matchesSearch =
        agentData.agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agentData.agent.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (agentData.agent.mobile && agentData.agent.mobile.includes(searchTerm));

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && agentData.stats.totalItems > 0) ||
        (statusFilter === "completed" &&
          agentData.stats.completionRate === 100) ||
        (statusFilter === "in_progress" &&
          agentData.stats.completionRate > 0 &&
          agentData.stats.completionRate < 100) ||
        (statusFilter === "inactive" && agentData.stats.totalItems === 0);

      // Performance filter
      const matchesPerformance =
        performanceFilter === "all" ||
        (performanceFilter === "high" &&
          agentData.stats.productivityScore >= 80) ||
        (performanceFilter === "medium" &&
          agentData.stats.productivityScore >= 50 &&
          agentData.stats.productivityScore < 80) ||
        (performanceFilter === "low" && agentData.stats.productivityScore < 50);

      return matchesSearch && matchesStatus && matchesPerformance;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.agent.name.toLowerCase();
          bValue = b.agent.name.toLowerCase();
          break;
        case "completionRate":
          aValue = a.stats.completionRate;
          bValue = b.stats.completionRate;
          break;
        case "totalItems":
          aValue = a.stats.totalItems;
          bValue = b.stats.totalItems;
          break;
        case "totalLists":
          aValue = a.stats.totalLists;
          bValue = b.stats.totalLists;
          break;
        case "productivityScore":
          aValue = a.stats.productivityScore;
          bValue = b.stats.productivityScore;
          break;
        default:
          aValue = a.agent.name.toLowerCase();
          bValue = b.agent.name.toLowerCase();
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [
    agentLists,
    searchTerm,
    statusFilter,
    performanceFilter,
    sortBy,
    sortOrder,
  ]);

  const getAgentStatus = (stats) => {
    if (stats.totalItems === 0)
      return {
        status: "Inactive",
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      };
    if (stats.completionRate === 100)
      return {
        status: "Completed",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    if (stats.completionRate > 0)
      return {
        status: "In Progress",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
      };
    return {
      status: "Assigned",
      color: "bg-blue-100 text-blue-800",
      icon: FileText,
    };
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" color="purple" />
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-900">
            Loading agent data...
          </p>
          <p className="text-sm text-gray-500">Fetching performance metrics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to Load Data
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Summary */}
      <FadeIn delay={50}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Agents</p>
                <p className="text-2xl font-bold">{agentLists.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Agents</p>
                <p className="text-2xl font-bold">
                  {agentLists.filter((a) => a.stats.totalItems > 0).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Avg Completion</p>
                <p className="text-2xl font-bold">
                  {agentLists.length > 0
                    ? Math.round(
                        agentLists.reduce(
                          (sum, a) => sum + a.stats.completionRate,
                          0
                        ) / agentLists.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">High Performers</p>
                <p className="text-2xl font-bold">
                  {
                    agentLists.filter((a) => a.stats.productivityScore >= 80)
                      .length
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Filter Controls */}
      <FadeIn delay={100}>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents by name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Performance</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (50-79)</option>
              <option value="low">Low (&lt;50)</option>
            </select>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              {[
                { key: "name", label: "Name" },
                { key: "completionRate", label: "Completion" },
                { key: "productivityScore", label: "Score" },
                { key: "totalItems", label: "Items" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`px-3 py-1 rounded-md text-sm flex items-center space-x-1 ${
                    sortBy === key
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{label}</span>
                  {sortBy === key &&
                    (sortOrder === "asc" ? (
                      <SortAsc className="w-3 h-3" />
                    ) : (
                      <SortDesc className="w-3 h-3" />
                    ))}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Results Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedAgents.length} of {agentLists.length}{" "}
              agents
            </div>
            <div className="flex space-x-4 text-xs text-gray-500">
              <span>
                High Performers:{" "}
                {
                  agentLists.filter((a) => a.stats.productivityScore >= 80)
                    .length
                }
              </span>
              <span>
                Active:{" "}
                {agentLists.filter((a) => a.stats.totalItems > 0).length}
              </span>
              <span>
                100% Complete:{" "}
                {
                  agentLists.filter((a) => a.stats.completionRate === 100)
                    .length
                }
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Agent Cards */}
      {filteredAndSortedAgents.length === 0 ? (
        <FadeIn delay={200}>
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-500">
              {searchTerm ||
              statusFilter !== "all" ||
              performanceFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Upload some lists to see agent assignments"}
            </p>
          </div>
        </FadeIn>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAgents.map((agentData, index) => {
            const agentStatus = getAgentStatus(agentData.stats);
            const StatusIcon = agentStatus.icon;

            return (
              <FadeIn key={agentData.agent._id} delay={index * 100}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  {/* Error indicator */}
                  {agentData.hasError && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600">
                        Failed to load complete data
                      </p>
                    </div>
                  )}

                  {/* Agent Header */}
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {agentData.agent.name}
                      </h3>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${agentStatus.color}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {agentStatus.status}
                      </div>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{agentData.agent.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{agentData.agent.mobile || "N/A"}</span>
                    </div>
                  </div>

                  {/* Enhanced Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Lists:</span>
                      <span className="font-medium">
                        {agentData.stats.totalLists}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">
                        {agentData.stats.totalItems}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium text-green-600">
                        {agentData.stats.completedItems}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">In Progress:</span>
                      <span className="font-medium text-yellow-600">
                        {agentData.stats.inProgressItems}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-gray-600">
                        {agentData.stats.pendingItems}
                      </span>
                    </div>

                    {/* Productivity Score */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Productivity Score:</span>
                      <span
                        className={`font-medium ${
                          agentData.stats.productivityScore >= 80
                            ? "text-green-600"
                            : agentData.stats.productivityScore >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {agentData.stats.productivityScore}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion Rate</span>
                        <span>{agentData.stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${agentData.stats.completionRate}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewJobSheet(agentData)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportAgent(agentData)}
                      disabled={agentData.stats.totalItems === 0}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                  </div>

                  {/* Last Activity */}
                  {agentData.lists.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>
                          Last updated:{" "}
                          {agentData.lastFetch?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      {/* Agent Job Sheet Modal */}
      {showJobSheet && selectedAgent && (
        <AgentJobSheetModal
          agentData={selectedAgent}
          onClose={() => {
            setShowJobSheet(false);
            setSelectedAgent(null);
          }}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  );
};

export default AgentListsView;
