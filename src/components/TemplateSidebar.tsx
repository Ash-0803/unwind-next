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

  // Default template with actual players
  const defaultTemplate: TeamTemplate = {
    id: "default-template",
    name: "Balanced Teams",
    teams: [
      {
        id: "team-0",
        name: "Team Alpha",
        players: [
          { id: 1, name: "Vineet Verma", image: "/vineet sir.jpeg" },
          { id: 14, name: "Ashish Chaudhary", image: "/ac.jpg" },
          { id: 18, name: "Himadri Sharma", image: "/hima.jpg" },
          { id: 7, name: "Arun Kumar", image: "/03.jpeg" },
          { id: 19, name: "Antil Panwar", image: "/ap.jpg" },
          { id: 23, name: "Pawan", image: "/pawan.jpeg" },
          { id: 2, name: "Akhil Ramachandran", image: "/Akhil Sir.jpeg" },
          { id: 5, name: "Gaurav Mishra", image: "/gaurav.jpeg" },
        ],
        score: 0,
        color: "#0070FF",
      },
      {
        id: "team-1",
        name: "Team Beta",
        players: [
          { id: 4, name: "Ashish Bhaskar", image: "/ab.jpeg" },
          { id: 9, name: "Neeraj Singh", image: "/01.jpeg" },
          { id: 21, name: "Tarun", image: "/01.jpeg" },
          { id: 3, name: "Jalaj Mishra", image: "/jalaj sir1.jpeg" },
          { id: 6, name: "Ekansh Mittal", image: "/ekansh sir.jpeg" },
          { id: 13, name: "Kiran Das", image: "/k2.jpeg" },
          { id: 16, name: "Shubham Shrivastava", image: "/ss.jpg" },
          { id: 11, name: "Abhishek Sharma", image: "/abhishek.jpeg" },
          { id: 15, name: "Prashant Singh", image: "/ps.jpeg" },
          { id: 17, name: "Dev Verma", image: "/dv.jpg" },
          { id: 22, name: "Umesh", image: "/umesh.jpeg" },
          { id: 24, name: "Srishti", image: "/Srishti.jpeg" },
        ],
        score: 0,
        color: "#FF4D00",
      },
    ],
    createdAt: new Date().toISOString(),
  };

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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sidebar */}
      <div className="relative w-80 bg-card border-r border-border h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold font-heading">
              Select Template
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Default Template */}
            <div
              className="bg-primary/5 border border-primary/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectTemplate(defaultTemplate)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-primary">
                  {defaultTemplate.name}
                </h3>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  Default
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Pre-configured balanced teams setup</p>
                <p>{defaultTemplate.teams.length} teams • Ready to use</p>
              </div>
            </div>

            {/* Saved Templates */}
            {templates.length > 0 && (
              <>
                <div className="border-t border-border pt-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Saved Templates
                  </h4>
                </div>
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
                      <p>
                        Created:{" "}
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        Total players:{" "}
                        {template.teams.reduce(
                          (acc, team) => acc + team.players.length,
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {templates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-t border-border pt-4">
                <p className="text-sm">No saved templates yet</p>
                <p className="text-xs mt-1">
                  Create and save templates in the Templates page
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSidebar;
