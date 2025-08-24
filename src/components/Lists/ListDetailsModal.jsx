import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  User,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  Calendar,
  Users,
  Eye,
  Download,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { apiCall } from "../../utils/api";

const ListDetailsModal = ({ distribution, onClose, onUpdate }) => {
  const [lists, setLists] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [agentItems, setAgentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });

  useEffect(() => {
    if (distribution) {
      fetchDistributionLists();
    }
  }, [distribution]);

  const fetchDistributionLists = async () => {
    setLoading(true);
    try {
      // Fixed API endpoint - use the correct route based on backend
      const response = await apiCall(`/lists/upload/${distribution._id}`);
      if (response.success) {
        setLists(response.data?.lists || response.data || []);
      } else {
        // Fallback: try to get all lists and filter by uploadId
        console.warn(
          "Direct upload endpoint failed, trying alternative approach"
        );
        setLists([]);
      }
    } catch (error) {
      console.error("Failed to fetch distribution lists:", error);
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentItems = async (listId) => {
    setItemsLoading(true);
    try {
      // Fixed API endpoint - use the correct route with pagination
      const response = await apiCall(`/lists/${listId}?page=1&limit=100`);
      if (response.success) {
        setAgentItems(response.data?.items || response.data?.list?.items || []);
      } else {
        throw new Error(response.message || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Failed to fetch agent items:", error);
      setAgentItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleViewAgentList = (agent, listId) => {
    setSelectedAgent(agent);
    setSelectedListId(listId);
    fetchAgentItems(listId);
  };

  const handleEditItem = (item) => {
    setEditingItem(item._id);
    setEditForm({
      status: item.status || "pending",
      notes: item.notes || "",
    });
  };

  const handleSaveItem = async (itemId) => {
    try {
      // Fixed API endpoint - use the correct route structure
      const response = await apiCall(
        `/lists/${selectedListId}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.success) {
        // Refresh agent items
        if (selectedListId) {
          fetchAgentItems(selectedListId);
        }

        // Refresh distribution data
        fetchDistributionLists();
        onUpdate?.();

        setEditingItem(null);
      } else {
        throw new Error(response.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      alert("Failed to update item: " + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (completed, total) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <FadeIn>
        <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Distribution Details
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {distribution.fileName || distribution.originalName} •{" "}
                {distribution.totalItems} items
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Left Panel - Agents List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Assigned Agents ({lists.length})
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="md" color="purple" />
                  </div>
                ) : lists.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No agent assignments found</p>
                    <p className="text-xs mt-1">
                      Lists may still be processing
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {lists.map((list) => (
                      <div
                        key={list._id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedAgent?._id === list.agent?._id
                            ? "border-purple-300 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleViewAgentList(list.agent, list._id)
                        }
                      >
                        <div className="flex items-center mb-2">
                          <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {list.agent?.name ||
                                list.agentName ||
                                "Unknown Agent"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {list.agent?.email || list.agentEmail || ""}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-medium">
                              {list.totalItems || list.items?.length || 0}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium text-green-600">
                              {list.completedItems || 0}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>
                                {calculateProgress(
                                  list.completedItems || 0,
                                  list.totalItems || list.items?.length || 0
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${calculateProgress(
                                    list.completedItems || 0,
                                    list.totalItems || list.items?.length || 0
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Agent Items */}
            <div className="flex-1 flex flex-col">
              {selectedAgent ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedAgent.name ||
                            selectedAgent.agentName ||
                            "Agent"}
                          's Job Sheet
                        </h4>
                        <p className="text-sm text-gray-500">
                          {agentItems.length} items assigned
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          alert("Export functionality coming soon!")
                        }
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {itemsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <LoadingSpinner size="md" color="purple" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {agentItems.map((item, index) => (
                          <div
                            key={item._id || index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                  {item.firstName ||
                                    item.name ||
                                    item.FirstName ||
                                    "N/A"}
                                </h5>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span>
                                    {item.phone ||
                                      item.mobile ||
                                      item.Phone ||
                                      "N/A"}
                                  </span>
                                </div>
                                {(item.notes || item.Notes) && (
                                  <div className="mt-1 text-sm text-gray-500">
                                    <span className="font-medium">Notes:</span>{" "}
                                    {item.notes || item.Notes}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  <span className="flex items-center">
                                    {getStatusIcon(item.status)}
                                    <span className="ml-1 capitalize">
                                      {item.status || "Pending"}
                                    </span>
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {editingItem === item._id ? (
                              <div className="space-y-3 pt-3 border-t border-gray-200">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={editForm.status}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        status: e.target.value,
                                      })
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">
                                      In Progress
                                    </option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Notes
                                  </label>
                                  <textarea
                                    value={editForm.notes}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        notes: e.target.value,
                                      })
                                    }
                                    placeholder="Add notes..."
                                    rows="2"
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveItem(item._id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              (item.additionalNotes || item.workNotes) && (
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">
                                      Work Notes:
                                    </span>{" "}
                                    {item.additionalNotes || item.workNotes}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        ))}

                        {agentItems.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No items found for this agent</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Select an Agent
                    </h4>
                    <p className="text-gray-500">
                      Click on an agent from the left panel to view their
                      assigned items
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default ListDetailsModal;
