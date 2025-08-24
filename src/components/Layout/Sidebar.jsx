import React from "react";
import { BarChart3, Users, FileText, Upload } from "lucide-react";
import { SlideIn } from "../common/Animations";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "agents", label: "Agents", icon: Users },
    { id: "lists", label: "Lists", icon: FileText },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  return (
    <nav className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] border-r border-gray-200">
      <div className="p-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <SlideIn key={tab.id} delay={tabs.indexOf(tab) * 100}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg text-left transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:transform hover:scale-[1.02]"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            </SlideIn>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;
