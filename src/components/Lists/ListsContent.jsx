import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  User,
  Upload,
  Download,
  Users,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { apiCall } from "../../utils/api";
import ListDetailsModal from "./ListDetailsModal";
import AgentListsView from "./AgentListsView";

const ListsContent = ({ agents }) => {
  // const [lists, setLists] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("distributions"); // distributions, agent-lists
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalItems: 0,
    completedItems: 0,
    pendingItems: 0,
  });

  useEffect(() => {
    fetchDistributions();
    fetchDashboardStats();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      // Get all distributions - we need to implement this endpoint
      const response = await apiCall("/lists/distributions");
      if (response.success) {
        setDistributions(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch distributions:", error);
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await apiCall("/lists/dashboard-stats");
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const handleViewDistribution = async (distributionId) => {
    try {
      const response = await apiCall(`/lists/upload/${distributionId}`);
      if (response.success) {
        setSelectedList(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Failed to fetch distribution details:", error);
      alert("Failed to load distribution details");
    }
  };

  const handleDeleteDistribution = async (distributionId) => {
    if (
      !confirm(
        "Are you sure you want to delete this distribution? This will remove all associated lists for all agents."
      )
    )
      return;

    try {
      await apiCall(`/lists/upload/${distributionId}`, { method: "DELETE" });
      fetchDistributions();
      fetchDashboardStats();
    } catch (error) {
      alert("Failed to delete distribution: " + error.message);
    }
  };

  const filteredDistributions = distributions.filter(
    (dist) =>
      dist.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.uploadedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "distributed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (completed, total) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading && activeTab === "distributions") {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" color="purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Lists & Job Sheets Management
          </h2>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <FadeIn delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Uploads
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUploads || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedItems || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingItems || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tab Navigation */}
      <FadeIn delay={200}>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("distributions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "distributions"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Distributions
            </button>
            <button
              onClick={() => setActiveTab("agent-lists")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "agent-lists"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Agent Job Sheets
            </button>
          </nav>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={300}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${
              activeTab === "distributions" ? "distributions" : "agent lists"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </FadeIn>

      {/* Content based on active tab */}
      {activeTab === "distributions" ? (
        <DistributionsView
          distributions={filteredDistributions}
          onViewDistribution={handleViewDistribution}
          onDeleteDistribution={handleDeleteDistribution}
          getStatusColor={getStatusColor}
          calculateProgress={calculateProgress}
        />
      ) : (
        <AgentListsView agents={agents} searchTerm={searchTerm} />
      )}

      {/* Distribution Details Modal */}
      {showDetails && selectedList && (
        <ListDetailsModal
          distribution={selectedList}
          onClose={() => {
            setShowDetails(false);
            setSelectedList(null);
          }}
          onUpdate={() => {
            fetchDistributions();
            fetchDashboardStats();
          }}
        />
      )}
    </div>
  );
};

// Distributions View Component
const DistributionsView = ({
  distributions,
  onViewDistribution,
  onDeleteDistribution,
  getStatusColor,
  calculateProgress,
}) => {
  if (distributions.length === 0) {
    return (
      <FadeIn delay={400}>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No distributions found
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your first CSV/Excel file to create and distribute lists
            among agents
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {distributions.map((distribution, index) => (
        <FadeIn key={distribution._id} delay={index * 100}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {distribution.fileName || "Untitled Upload"}
                </h3>
                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    distribution.status
                  )}`}
                >
                  {distribution.status || "Distributed"}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {distribution.totalItems || 0} total items
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {distribution.agentCount || 0} agents assigned
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {distribution.createdAt
                    ? new Date(distribution.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  By {distribution.uploadedBy || "Unknown"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>
                    {calculateProgress(
                      distribution.completedItems,
                      distribution.totalItems
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${calculateProgress(
                        distribution.completedItems,
                        distribution.totalItems
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onViewDistribution(distribution._id)}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
              <button
                onClick={() => onDeleteDistribution(distribution._id)}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
};

export default ListsContent;
