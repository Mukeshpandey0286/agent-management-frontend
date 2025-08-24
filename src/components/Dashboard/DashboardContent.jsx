import React from "react";
import { Users, FileText, BarChart3, CheckCircle, User } from "lucide-react";
import { FadeIn, SlideIn, LoadingSpinner } from "../common/Animations";

const DashboardContent = ({ stats, agents, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" color="purple" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Agents",
      value: stats.totalAgents || agents.length || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      change: "+5%",
    },
    {
      title: "Total Lists",
      value: stats.totalLists || 0,
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      change: "+12%",
    },
    {
      title: "Total Items",
      value: stats.totalItems || 0,
      icon: BarChart3,
      color: "from-purple-500 to-violet-500",
      change: "+8%",
    },
    {
      title: "Completed Items",
      value: stats.completedItems || 0,
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
      change: "+15%",
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard Overview
        </h2>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={stat.title} delay={index * 100}>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Recent Agents */}
      <FadeIn delay={400}>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Agents
          </h3>
          <div className="space-y-4">
            {agents.slice(0, 5).map((agent, index) => (
              <SlideIn key={agent._id} direction="left" delay={index * 100}>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="bg-gradient-to-r from-purple-400 to-blue-400 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      agent.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </SlideIn>
            ))}
            {agents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No agents found. Create your first agent to get started.</p>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default DashboardContent;
