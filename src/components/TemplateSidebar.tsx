"use client";

import React, { useState, useEffect } from "react";
import type { Team } from "../types";

interface TeamTemplate {
  id: string;
  name: string;
  teams: Team[];
  createdAt: string;
}

interface TemplateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TeamTemplate) => void;
}

const TemplateSidebar: React.FC<TemplateSidebarProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<TeamTemplate[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("teamTemplates");
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-80 bg-card border-r border-border h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold font-heading">Select Template</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {template.teams.length} teams
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                    <p>Total players: {template.teams.reduce((acc, team) => acc + team.players.length, 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No templates found</p>
              <p className="text-sm mt-2">Create templates in the Templates page first</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSidebar;
