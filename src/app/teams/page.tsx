"use client";

import React, { useState, useEffect } from "react";
import type { Team, TeamGenerationMode, Player, GameDetails } from "@/types";
import { initialPlayers, TEAM_COLORS, TEAM_NAMES } from "@/data/players";
import EnhancedTeamCard from "@/components/EnhancedTeamCard";
import Counter from "@/components/Counter";
import TemplateSidebar from "@/components/TemplateSidebar";
import PlayerSelection from "@/components/PlayerSelection";
import SuperAdminGuard from "@/components/SuperAdminGuard";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

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
  const [totalRounds, setTotalRounds] = useState(3);
  const [customTeams, setCustomTeams] = useState<Team[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TeamTemplate | null>(
    null,
  );
  const [isTemplateSidebarOpen, setIsTemplateSidebarOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showMainSelection, setShowMainSelection] = useState(true);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);

  useEffect(() => {
    // Check for selected template from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("selectedTemplate");
      if (stored) {
        const template = JSON.parse(stored);
        setSelectedTemplate(template);
        setTeams(template.teams);
        setShowMainSelection(false);
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
    setShowMainSelection(false);
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
    setShowMainSelection(false);
  };

  const handleTeamUpdate = (updatedTeam: Team) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
    );
  };

  const handleStartGame = async () => {
    try {
      // Create game details
      const gameDetails: GameDetails = {
        gameType: "Team Activity",
        totalRounds: totalRounds,
        location: "Default Location", // Can be made configurable
        notes: `Game created with ${teams.length} teams, ${totalRounds} rounds, and ${teams.reduce((sum, team) => sum + team.players.length, 0)} players`,
      };

      // Create game in backend
      const response = await apiClient.createGame({
        teams: teams.map((team) => ({
          ...team,
          score: 0, // Reset scores for new game
        })),
        gameDetails,
      });

      if (response.success && response.data) {
        // Store game ID and teams in sessionStorage for scoreboard
        if (typeof window !== "undefined") {
          sessionStorage.setItem("currentGameId", response.data.id);
          sessionStorage.setItem(
            "gameTeams",
            JSON.stringify(response.data.teams),
          );
        }
        router.push("/scoreboard");
      } else {
        console.error("Failed to create game:", response.error);
        alert("Failed to create game. Please try again.");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
    }
  };

  const handleTemplateSelect = (template: TeamTemplate) => {
    setSelectedTemplate(template);
    setTeams(template.teams);
    setIsTemplateSidebarOpen(false);
    setShowMainSelection(false);
  };

  const handleReset = () => {
    setTeams([]);
    setSelectedTemplate(null);
    setShowMainSelection(true);
  };

  const handlePlayersSelected = (players: Player[]) => {
    setSelectedPlayers(players);
    setShowPlayerSelection(false);
  };

  const handleBackToPlayerSelection = () => {
    setShowPlayerSelection(false);
    setShowMainSelection(true);
    setTeams([]);
    setSelectedTemplate(null);
  };

  const handleBackToMain = () => {
    setShowMainSelection(true);
    setShowPlayerSelection(false);
    setTeams([]);
    setSelectedTemplate(null);
  };

  // Main selection screen
  if (showMainSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold font-heading mb-4">
              Team{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose how you want to create your teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Select from Template */}
            <div
              className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setIsTemplateSidebarOpen(true)}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012 2v11a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold font-heading mb-3">
                  Select from Template
                </h3>
                <p className="text-muted-foreground mb-4">
                  Choose from pre-configured team setups and themes
                </p>
                <div className="flex items-center justify-center text-sm text-primary">
                  <span>Browse templates</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Generate New Team */}
            <div
              className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setShowPlayerSelection(true)}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold font-heading mb-3">
                  Generate New Team
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select players and create random or custom teams
                </p>
                <div className="flex items-center justify-center text-sm text-accent">
                  <span>Start from scratch</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
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
    );
  }

  // Player selection screen
  if (showPlayerSelection) {
    return (
      <PlayerSelection
        onPlayersSelected={handlePlayersSelected}
        initialSelectedPlayers={selectedPlayers}
      />
    );
  }

  // Team generation screen (existing flow)
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back to Selection Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToMain}
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
            Back to Selection
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
              <h2 className="text-xl font-semibold font-heading mb-6">Setup</h2>

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

              {/* Number of Rounds */}
              <div className="mb-6">
                <Counter
                  value={totalRounds}
                  onChange={setTotalRounds}
                  min={1}
                  max={99}
                  label="Number of Rounds"
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
                      <div className="font-medium">Generate Random Teams</div>
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
                      <div className="font-medium">Select from Template</div>
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
                      allTeams={teams}
                      showScore={false}
                    />
                  ))}
                </div>
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
                  Choose a generation method from the left panel to get started
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
  );
};

const TeamsPageWithAuth = () => (
  <SuperAdminGuard>
    <TeamsPage />
  </SuperAdminGuard>
);

export default TeamsPageWithAuth;
