"use client";

import React, { useState, useCallback, useMemo } from "react";
import type { Team, TeamGenerationMode, Player } from "@/types";
import { initialPlayers, TEAM_COLORS, TEAM_NAMES } from "@/data/players";
import TeamCard from "@/components/TeamCard";
import TeamSelector from "@/components/TeamSelector";
import { useRouter } from "next/navigation";

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

type Step = "select" | "shuffle" | "lineup";

const TeamsPage = () => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [generationMode, setGenerationMode] =
    useState<TeamGenerationMode>("numTeams");
  const [numTeams, setNumTeams] = useState(2);
  const [teamSize, setTeamSize] = useState(3);
  const [customTeams, setCustomTeams] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleGenerateTeams = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      let newTeams: Team[] = [];

      if (generationMode === "custom") {
        newTeams = customTeams.map((name, i) => ({
          id: `team-${i}`,
          name,
          players: [],
          score: 0,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
        }));
        const shuffled = shuffleArray(initialPlayers);
        shuffled.forEach((player, idx) => {
          newTeams[idx % customTeams.length].players.push(player);
        });
      } else {
        const teamCount =
          generationMode === "numTeams"
            ? numTeams
            : Math.floor(initialPlayers.length / teamSize);
        newTeams = generateTeams(
          initialPlayers,
          teamCount,
          TEAM_COLORS,
          TEAM_NAMES,
        );
      }

      setTeams(newTeams);
      setCurrentStep("lineup");
      setIsShuffling(false);
    }, 1500);
  }, [generationMode, numTeams, teamSize, customTeams]);

  const handleStartGame = () => {
    // In a real app, you'd save this to state management
    router.push("/scoreboard");
  };

  const handleScoreChange = (teamId: string, score: number) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, score } : team)),
    );
  };

  const handleReset = () => {
    setTeams([]);
    setCurrentStep("select");
    setGenerationMode("numTeams");
    setNumTeams(2);
    setTeamSize(3);
    setCustomTeams([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Team{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-muted-foreground">
            Create balanced teams for your next activity
          </p>
        </div>

        {currentStep === "select" && (
          <div className="space-y-8">
            <TeamSelector
              mode={generationMode}
              onModeChange={setGenerationMode}
              numTeams={numTeams}
              onNumTeamsChange={setNumTeams}
              teamSize={teamSize}
              onTeamSizeChange={setTeamSize}
              customTeams={customTeams}
              onCustomTeamsChange={setCustomTeams}
            />

            <div className="flex justify-center">
              <button
                onClick={handleGenerateTeams}
                disabled={
                  isShuffling ||
                  (generationMode === "custom" && customTeams.length === 0)
                }
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isShuffling ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Generating Teams...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Generate Teams
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === "shuffle" && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-xl text-muted-foreground">
                Shuffling teams...
              </p>
            </div>
          </div>
        )}

        {currentStep === "lineup" && teams.length > 0 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Teams</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset
                </button>
                <button
                  onClick={handleStartGame}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Game
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onScoreChange={handleScoreChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
