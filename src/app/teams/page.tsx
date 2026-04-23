"use client";

import React, { useState, useEffect } from "react";
import type { Team, TeamGenerationMode, Player } from "@/types";
import { initialPlayers, TEAM_COLORS, TEAM_NAMES } from "@/data/players";
import EnhancedTeamCard from "@/components/EnhancedTeamCard";
import PlayerPool from "@/components/PlayerPool";
import Counter from "@/components/Counter";
import TemplateSidebar from "@/components/TemplateSidebar";
import PlayerSelection from "@/components/PlayerSelection";
import { useRouter } from "next/navigation";

interface TeamTemplate {
  id: string;
  name: string;
  teams: Team[];
  createdAt: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateTeams(
  players: Player[],
  numTeams: number,
  colors: string[],
  names: string[],
): Team[] {
  const shuffled = shuffleArray(players);
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i}`,
    name: names[i] ?? `Team ${String.fromCharCode(65 + i)}`,
    players: [],
    score: 0,
    color: colors[i % colors.length],
  }));

  shuffled.forEach((player, idx) => {
    teams[idx % numTeams].players.push(player);
  });

  return teams;
}

const TeamsPage = () => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [generationMode, setGenerationMode] =
    useState<TeamGenerationMode>("numTeams");
  const [numTeams, setNumTeams] = useState(2);
  const [teamSize, setTeamSize] = useState(3);
  const [customTeams, setCustomTeams] = useState<Team[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TeamTemplate | null>(
    null,
  );
  const [isTemplateSidebarOpen, setIsTemplateSidebarOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);

  useEffect(() => {
    // Check for selected template from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("selectedTemplate");
      if (stored) {
        const template = JSON.parse(stored);
        setSelectedTemplate(template);
        setTeams(template.teams);
        sessionStorage.removeItem("selectedTemplate");
      }
    }
  }, []);

  const handleGenerateRandomTeams = () => {
    if (selectedPlayers.length === 0) {
      alert("Please select players first");
      return;
    }
    const generatedTeams = generateTeams(
      selectedPlayers,
      numTeams,
      TEAM_COLORS,
      TEAM_NAMES,
    );
    setTeams(generatedTeams);
    setSelectedTemplate(null);
  };

  const handleCreateCustomTeams = () => {
    if (selectedPlayers.length === 0) {
      alert("Please select players first");
      return;
    }
    const customTeamSetup = Array.from({ length: numTeams }, (_, i) => ({
      id: `team-${i}`,
      name: `Team ${String.fromCharCode(65 + i)}`,
      players: [],
      score: 0,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
    }));
    setTeams(customTeamSetup);
    setSelectedTemplate(null);
  };

  const handleTeamUpdate = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
    );
  };

  const handleStartGame = () => {
    // Store teams in localStorage for scoreboard
    localStorage.setItem("gameTeams", JSON.stringify(teams));
    router.push("/scoreboard");
  };

  const handleTemplateSelect = (template: TeamTemplate) => {
    setSelectedTemplate(template);
    setTeams(template.teams);
    setIsTemplateSidebarOpen(false);
  };

  const handleReset = () => {
    setTeams([]);
    setSelectedTemplate(null);
  };

  const handlePlayersSelected = (players: Player[]) => {
    setSelectedPlayers(players);
    setShowPlayerSelection(false);
  };

  const handleBackToPlayerSelection = () => {
    setShowPlayerSelection(true);
    setTeams([]);
    setSelectedTemplate(null);
  };

  const allAssignedPlayers = teams.flatMap((team) => team.players);
  const availablePlayers = selectedPlayers.filter(
    (player) =>
      !allAssignedPlayers.find((assigned) => assigned.id === player.id),
  );

  return (
    <>
      {showPlayerSelection ? (
        <PlayerSelection
          onPlayersSelected={handlePlayersSelected}
          initialSelectedPlayers={selectedPlayers}
        />
      ) : (
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Back to Player Selection Button */}
            <div className="mb-6">
              <button
                onClick={handleBackToPlayerSelection}
                className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Player Selection
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold font-heading">
                  Team{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Generator
                  </span>
                </h1>
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                  <span className="text-sm text-primary font-medium">
                    {selectedPlayers.length} Players Selected
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Create teams for your next activity
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side - Controls */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-8">
                  <h2 className="text-xl font-semibold font-heading mb-6">
                    Setup
                  </h2>

                  {/* Number of Teams */}
                  <div className="mb-6">
                    <Counter
                      value={numTeams}
                      onChange={setNumTeams}
                      min={2}
                      max={12}
                      label="Number of Teams"
                    />
                  </div>

                  {/* Generation Mode */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Generation Method
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={handleGenerateRandomTeams}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          generationMode === "numTeams" && !selectedTemplate
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium">
                            Generate Random Teams
                          </div>
                          <div className="text-xs opacity-70">
                            Automatically distribute players
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleCreateCustomTeams}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          generationMode === "custom" && !selectedTemplate
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium">Custom Teams</div>
                          <div className="text-xs opacity-70">
                            Create teams manually
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setIsTemplateSidebarOpen(true)}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          selectedTemplate
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium">
                            Select from Template
                          </div>
                          <div className="text-xs opacity-70">
                            {selectedTemplate
                              ? `Selected: ${selectedTemplate.name}`
                              : "Choose saved template"}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <button
                      onClick={handleReset}
                      className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                    >
                      Reset
                    </button>

                    <button
                      onClick={handleStartGame}
                      disabled={teams.length === 0}
                      className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side - Teams Display */}
              <div className="lg:col-span-2">
                {teams.length > 0 && (
                  <div className="space-y-6">
                    {/* Template Info */}
                    {selectedTemplate && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              Template: {selectedTemplate.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created:{" "}
                              {new Date(
                                selectedTemplate.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTemplate(null);
                              setTeams([]);
                            }}
                            className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Teams Grid - 2 columns for better space utilization */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {teams.map((team) => (
                        <EnhancedTeamCard
                          key={team.id}
                          team={team}
                          onTeamUpdate={handleTeamUpdate}
                          onScoreChange={() => {}}
                          availablePlayers={selectedPlayers}
                          selectedPlayers={selectedPlayers}
                          showScore={false}
                        />
                      ))}
                    </div>

                    {/* Player Pool for Custom Teams */}
                    {generationMode === "custom" && (
                      <PlayerPool
                        players={selectedPlayers}
                        selectedPlayers={allAssignedPlayers}
                      />
                    )}
                  </div>
                )}

                {teams.length === 0 && (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold font-heading mb-2">
                      No Teams Created
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a generation method from the left panel to get
                      started
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleGenerateRandomTeams}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Generate Random Teams
                      </button>
                      <button
                        onClick={() => setIsTemplateSidebarOpen(true)}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                      >
                        Browse Templates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Template Sidebar */}
          <TemplateSidebar
            isOpen={isTemplateSidebarOpen}
            onClose={() => setIsTemplateSidebarOpen(false)}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>
      )}
    </>
  );
};

export default TeamsPage;
