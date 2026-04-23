"use client";

import React, { useState } from "react";
import type { Team, Player } from "@/types";
import { initialPlayers, TEAM_COLORS, TEAM_NAMES } from "@/data/players";
import EnhancedTeamCard from "@/components/EnhancedTeamCard";
import { useRouter } from "next/navigation";

interface TeamTemplate {
  id: string;
  name: string;
  teams: Team[];
  createdAt: string;
}

const TemplatesPage = () => {
  const router = useRouter();
  const [templateName, setTemplateName] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<TeamTemplate[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("teamTemplates");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const handleCreateNewTeam = () => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `Team ${String.fromCharCode(65 + teams.length)}`,
      players: [],
      score: 0,
      color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
    };
    setTeams([...teams, newTeam]);
  };

  const handleTeamUpdate = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
    );
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (teams.length === 0) {
      alert("Please create at least one team");
      return;
    }

    const newTemplate: TeamTemplate = {
      id: Date.now().toString(),
      name: templateName,
      teams: teams,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem("teamTemplates", JSON.stringify(updatedTemplates));

    // Reset form
    setTemplateName("");
    setTeams([]);
    alert("Template saved successfully!");
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.filter((t) => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem("teamTemplates", JSON.stringify(updatedTemplates));
  };

  const handleUseTemplate = (template: TeamTemplate) => {
    // Store template in sessionStorage for use in teams page
    sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
    router.push("/teams");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-heading">
            Team{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          <p className="text-muted-foreground">
            Create and manage team templates for quick game setup
          </p>
        </div>

        {/* Template Creation Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold font-heading mb-4">
              Create New Template
            </h2>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleCreateNewTeam}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Team
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Save Template
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          {teams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Teams in Template</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <EnhancedTeamCard
                    key={team.id}
                    team={team}
                    onTeamUpdate={handleTeamUpdate}
                    onScoreChange={() => {}}
                    availablePlayers={initialPlayers}
                    showScore={false}
                  />
                ))}
              </div>
            </div>
          )}

          {teams.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Click "Add Team" to start creating your template</p>
            </div>
          )}
        </div>

        {/* Saved Templates Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold font-heading mb-4">
            Saved Templates
          </h2>
          
          {savedTemplates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{template.teams.length} teams</p>
                    <p>
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No saved templates yet. Create your first template above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
