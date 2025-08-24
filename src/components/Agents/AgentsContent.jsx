import React, { useState } from "react";
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import AgentModal from "./AgentModal";
import { apiCall } from "../../utils/api";

const AgentsContent = ({ agents, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setShowModal(true);
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    setLoading(true);
    try {
      // Fixed API endpoint to match backend route
      const response = await apiCall(`/agents/${agentId}`, {
        method: "DELETE",
      });

      if (response.success) {
        onUpdate();
      } else {
        throw new Error(response.message || "Failed to delete agent");
      }
    } catch (error) {
      alert("Failed to delete agent: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Agents Management
          </h2>
          <button
            onClick={handleCreateAgent}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Agent
          </button>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={100}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </FadeIn>

      {/* Agents Grid */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" color="purple" />
        </div>
      )}

      {!loading && filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No agents found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Create your first agent to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <FadeIn key={agent._id} delay={index * 100}>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {agent.name}
                    </h3>
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        agent.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{agent.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{agent.mobile || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Joined {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAgent(agent)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent._id)}
                    disabled={loading}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Agent Modal */}
      {showModal && (
        <AgentModal
          agent={selectedAgent}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default AgentsContent;
