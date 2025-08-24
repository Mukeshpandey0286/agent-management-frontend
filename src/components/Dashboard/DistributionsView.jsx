import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Calendar,
  Eye,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  RefreshCw,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { apiCall } from "../../utils/api";
import ListDetailsModal from "../Lists/ListDetailsModal";

const DistributionsView = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall("/lists/distributions");
      if (response.success) {
        // Handle both array and object responses
        const distributionsData = Array.isArray(response.data)
          ? response.data
          : response.data.distributions || response.data || [];

        console.log("Fetched distributions:", distributionsData);
        setDistributions(distributionsData);
      } else {
        console.error("Failed to fetch distributions:", response.message);
        setError(response.message || "Failed to fetch distributions");
        setDistributions([]);
      }
    } catch (error) {
      console.error("Failed to fetch distributions:", error);
      setError(error.message || "Failed to fetch distributions");
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDistributions();
    setRefreshing(false);
  };

  const handleViewDetails = (distribution) => {
    setSelectedDistribution(distribution);
    setShowDetailsModal(true);
  };

  const handleDeleteDistribution = async (distributionId) => {
    if (
      !confirm(
        "Are you sure you want to delete this distribution? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete all lists in this distribution/upload
      const response = await apiCall(`/lists/upload/${distributionId}`, {
        method: "DELETE",
      });

      if (response.success) {
        fetchDistributions(); // Refresh the list
        alert("Distribution deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete distribution");
      }
    } catch (error) {
      console.error("Failed to delete distribution:", error);
      alert("Failed to delete distribution: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateOverallProgress = (distribution) => {
    const totalItems = distribution.totalItems || 0;
    const completedItems = distribution.completedItems || 0;
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const filteredDistributions = distributions.filter((dist) => {
    const matchesSearch =
      (dist.fileName || dist.originalName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (dist.uploadedBy || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || dist.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" color="purple" />
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-900">
            Loading distributions...
          </p>
          <p className="text-sm text-gray-500">
            Fetching uploaded files and distributions
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to Load Distributions
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
      {/* Header */}
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Distributions</h2>
            <p className="text-gray-600 mt-1">
              View and manage uploaded lists and their distributions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </FadeIn>

      {/* Summary Stats */}
      {distributions.length > 0 && (
        <FadeIn delay={50}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Distributions</p>
                  <p className="text-2xl font-bold">{distributions.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Items</p>
                  <p className="text-2xl font-bold">
                    {distributions.reduce(
                      (sum, d) => sum + (d.totalItems || 0),
                      0
                    )}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {distributions.reduce(
                      (sum, d) => sum + (d.completedItems || 0),
                      0
                    )}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Progress</p>
                  <p className="text-2xl font-bold">
                    {distributions.length > 0
                      ? Math.round(
                          distributions.reduce(
                            (sum, d) => sum + calculateOverallProgress(d),
                            0
                          ) / distributions.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <Upload className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Filters */}
      <FadeIn delay={100}>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by file name or uploader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {filteredDistributions.length} distribution
              {filteredDistributions.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Distributions List */}
      {filteredDistributions.length === 0 ? (
        <FadeIn delay={200}>
          <div className="text-center py-12">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No distributions found"
                : distributions.length === 0
                ? "No distributions yet"
                : "No matching distributions"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : distributions.length === 0
                ? "Upload a CSV file to create your first distribution"
                : "No distributions match your current filters"}
            </p>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-4">
          {filteredDistributions.map((distribution, index) => (
            <FadeIn key={distribution._id || index} delay={index * 100}>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {distribution.fileName ||
                          distribution.originalName ||
                          "Unknown File"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uploaded on{" "}
                        {new Date(
                          distribution.createdAt || distribution.uploadDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        distribution.status
                      )}`}
                    >
                      {getStatusIcon(distribution.status)}
                      <span className="ml-1 capitalize">
                        {distribution.status || "Processing"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="w-4 h-4 text-gray-500 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {distribution.totalItems || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total Items</div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-blue-500 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {distribution.assignedAgents || 0}
                    </div>
                    <div className="text-xs text-gray-500">Agents</div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {distribution.completedItems || 0}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {(distribution.totalItems || 0) -
                        (distribution.completedItems || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{calculateOverallProgress(distribution)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${calculateOverallProgress(distribution)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewDetails(distribution)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>

                  <button
                    onClick={() => alert("Export functionality coming soon!")}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </button>

                  <button
                    onClick={() => handleDeleteDistribution(distribution._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Distribution ID:{" "}
                    {distribution._id ? distribution._id.slice(-8) : "N/A"}
                  </span>
                  <span>
                    Uploaded by: {distribution.uploadedBy || "System"}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <ListDetailsModal
          distribution={selectedDistribution}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDistribution(null);
          }}
          onUpdate={() => {
            fetchDistributions();
          }}
        />
      )}
    </div>
  );
};

export default DistributionsView;
