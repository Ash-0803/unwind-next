"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type {
  GameState,
  TimerState,
  Team,
  GameHistory,
  GameDetails,
} from "@/types";
import ScoreController from "@/components/ScoreController";
import EnhancedTimer from "@/components/EnhancedTimer";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

function makeTimer(duration = 60): TimerState {
  return { duration, remaining: duration, isRunning: false };
}

function formatLoggedTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const ScoreboardPage = () => {
  const router = useRouter();
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Game state - initialized from sessionStorage or API
  const [gameState, setGameState] = useState<GameState>({
    teams: [],
    totalRounds: 3,
    currentRound: 1,
    roundResults: [],
    isStarted: true,
  });

  // Load game data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const gameId = sessionStorage.getItem("currentGameId");
      const teamsData = sessionStorage.getItem("gameTeams");

      if (gameId && teamsData) {
        setCurrentGameId(gameId);
        try {
          const teams = JSON.parse(teamsData);
          setGameState((prev) => ({
            ...prev,
            teams: teams.map((team: Team) => ({ ...team, score: 0 })),
          }));

          // Load game details to get total rounds
          loadGameDetails(gameId);
        } catch (error) {
          console.error("Error parsing teams data:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  const loadGameDetails = async (gameId: string) => {
    try {
      const response = await apiClient.getGameById(gameId);
      if (response.success && response.data) {
        setGameDetails(response.data.gameDetails);
        setGameState((prev) => ({
          ...prev,
          totalRounds: response.data.gameDetails.totalRounds || 3,
        }));
      }
    } catch (error) {
      console.error("Error loading game details:", error);
    }
  };

  const { teams, currentRound, totalRounds, roundResults } = gameState;

  // Local timer state for current round
  const [timer, setTimer] = useState<TimerState>(makeTimer(60));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loading animation state
  const [showLoading, setShowLoading] = useState(false);

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTimerStart = useCallback(() => {
    if (timer.remaining === 0) return;
    setTimer((t) => ({ ...t, isRunning: true }));
  }, [timer.remaining]);

  const handleTimerPause = useCallback(() => {
    setTimer((t) => ({ ...t, isRunning: false }));
  }, []);

  const handleTimerReset = useCallback(() => {
    clearTick();
    setTimer((t) => ({ ...t, remaining: t.duration, isRunning: false }));
  }, []);

  const handleDurationChange = useCallback((duration: number) => {
    clearTick();
    setTimer({ duration, remaining: duration, isRunning: false });
  }, []);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t.remaining <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            return { ...t, remaining: 0, isRunning: false };
          }
          return { ...t, remaining: t.remaining - 1 };
        });
      }, 1000);
    }
  }, [timer.isRunning, timer.remaining]);

  useEffect(() => {
    setTimer(makeTimer(60));
  }, [currentRound]);

  const handleUpdateScore = (
    roundNumber: number,
    teamId: string,
    score: number,
  ) => {
    setGameState((prev) => {
      const results = [...prev.roundResults];
      const roundIdx = results.findIndex((r) => r.roundNumber === roundNumber);

      const updatedScores =
        roundIdx > -1
          ? { ...results[roundIdx].scores, [teamId]: score }
          : { [teamId]: score };

      const updatedTimes = roundIdx > -1 ? results[roundIdx].times : {};

      if (roundIdx > -1) {
        results[roundIdx] = {
          ...results[roundIdx],
          scores: updatedScores,
        };
      } else {
        results.push({
          roundNumber,
          scores: updatedScores,
          times: updatedTimes,
        });
      }

      // Sync total team scores
      const updatedTeams = prev.teams.map((team) => {
        const totalScore = results.reduce(
          (acc, r) => acc + (r.scores[team.id] || 0),
          0,
        );
        return { ...team, score: totalScore };
      });

      return { ...prev, roundResults: results, teams: updatedTeams };
    });
  };

  const handleUpdateTime = (
    roundNumber: number,
    teamId: string,
    time: number,
  ) => {
    setGameState((prev) => {
      const results = [...prev.roundResults];
      const roundIdx = results.findIndex((r) => r.roundNumber === roundNumber);

      const updatedTimes =
        roundIdx > -1
          ? { ...results[roundIdx].times, [teamId]: time }
          : { [teamId]: time };

      const updatedScores = roundIdx > -1 ? results[roundIdx].scores : {};

      if (roundIdx > -1) {
        results[roundIdx] = {
          ...results[roundIdx],
          times: updatedTimes,
        };
      } else {
        results.push({
          roundNumber,
          scores: updatedScores,
          times: updatedTimes,
        });
      }
      return { ...prev, roundResults: results };
    });
  };

  const handleNextRound = () => {
    setGameState((prev) => ({
      ...prev,
      currentRound: Math.min(prev.currentRound + 1, prev.totalRounds),
    }));
  };

  const handleNextRoundWithLoading = () => {
    if (currentRound < totalRounds) {
      setShowLoading(true);
      setTimeout(() => {
        handleNextRound();
        setShowLoading(false);
      }, 1500);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the current game? Teams and scores will be cleared.",
      )
    ) {
      // Clear session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("currentGameId");
        sessionStorage.removeItem("gameTeams");
      }
      router.push("/teams");
    }
  };

  const saveGameProgress = async () => {
    if (!currentGameId) return;

    try {
      // Calculate final scores
      const finalScores: Record<string, number> = {};
      teams.forEach((team) => {
        finalScores[team.id] = team.score;
      });

      // Determine winner
      const winnerTeam = teams.reduce((prev, current) =>
        prev.score > current.score ? prev : current,
      );

      // Update game in backend
      const response = await apiClient.updateGame(currentGameId, {
        teams: teams,
        finalScores: finalScores,
        winner: winnerTeam.id,
        gameDetails: {
          gameType: "Team Activity",
          totalRounds: totalRounds,
          location: "Default Location",
          notes: `Game completed with ${teams.length} teams`,
        },
      });

      if (!response.success) {
        console.error("Failed to save game progress:", response.error);
      }
    } catch (error) {
      console.error("Error saving game progress:", error);
    }
  };

  const handleGameComplete = async () => {
    await saveGameProgress();
    // Store final game data for results page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("finalGameState", JSON.stringify(gameState));
    }
  };

  const currentRoundResults = roundResults.find(
    (r) => r.roundNumber === currentRound,
  );

  // Show loading state while game data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    );
  }

  // Show error state if no game data is available
  if (teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold font-heading mb-2">
            No Game Found
          </h3>
          <p className="text-muted-foreground mb-4">
            No active game found. Please start a new game from the teams page.
          </p>
          <button
            onClick={() => router.push("/teams")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Live Match Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold font-heading mb-4">
            Live{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Match
            </span>
          </h1>
        </div>

        {/* Main Content Grid - Desktop: 7:3 split */}
        <div className="grid lg:grid-cols-10 gap-8">
          {/* Left Side - Features (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Round and Timer Row */}
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Round Info */}

              <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-xs text-primary font-medium mb-1">
                  Round
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {currentRound}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {totalRounds}
                  </span>
                </div>
              </div>

              {/* Enhanced Timer */}
              <div className="flex-1 w-full sm:w-auto">
                <EnhancedTimer
                  timer={timer}
                  onStart={handleTimerStart}
                  onPause={handleTimerPause}
                  onReset={handleTimerReset}
                  onDurationChange={handleDurationChange}
                />
              </div>
            </div>

            {/* Team Cards */}
            <div
              className={`grid ${teams.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-6`}
            >
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                  style={{ borderColor: team.color + "40" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold font-heading">
                      {team.name}
                    </h2>
                    <div
                      className="text-2xl font-bold px-3 py-1 rounded-lg"
                      style={{
                        backgroundColor: team.color + "20",
                        color: team.color,
                      }}
                    >
                      {team.score}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Round Score
                      </div>
                      <ScoreController
                        score={currentRoundResults?.scores[team.id] || 0}
                        onScoreChange={(score) =>
                          handleUpdateScore(currentRound, team.id, score)
                        }
                        accentColor={team.color}
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-3">
                        Round Time
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg">
                          {currentRoundResults?.times[team.id] !== undefined
                            ? formatLoggedTime(
                                currentRoundResults.times[team.id],
                              )
                            : "--"}
                        </span>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                          onClick={() =>
                            handleUpdateTime(
                              currentRound,
                              team.id,
                              timer.duration - timer.remaining,
                            )
                          }
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Log Time
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Match History & Logs */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 font-heading">
                Match History & Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Round
                      </th>
                      {teams.map((t) => (
                        <th
                          key={t.id}
                          className="text-left py-3 px-4 font-medium"
                          style={{ color: t.color }}
                        >
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: totalRounds }, (_, i) => i + 1).map(
                      (rNum) => {
                        const rRes = roundResults.find(
                          (r) => r.roundNumber === rNum,
                        );
                        return (
                          <tr
                            key={rNum}
                            className={`border-b border-border/50 ${rNum === currentRound ? "bg-primary/5" : ""}`}
                          >
                            <td className="py-3 px-4 font-mono">{rNum}</td>
                            {teams.map((t) => (
                              <td key={t.id} className="py-3 px-4 font-mono">
                                {rRes?.scores[t.id] !== undefined
                                  ? rRes.scores[t.id]
                                  : "-"}
                              </td>
                            ))}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side - Scoreboard (3 columns) */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 font-heading">
                Scoreboard
              </h3>
              <div className="space-y-4">
                {teams
                  .sort((a, b) => b.score - a.score)
                  .map((team, index) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                      style={{
                        backgroundColor:
                          index === 0 ? team.color + "10" : "transparent",
                        borderColor: team.color + "30",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: team.color,
                            color: "white",
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: team.color }}
                      >
                        {team.score}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Next Round Button */}
              <div className="mt-6 space-y-3">
                <button
                  className=" w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed  text-sm text-muted-foreground hover:text-background "
                  onClick={handleReset}
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
                  Reset Match
                </button>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextRoundWithLoading}
                  disabled={currentRound >= totalRounds}
                >
                  {currentRound >= totalRounds
                    ? "Match Complete"
                    : currentRound === totalRounds - 1
                      ? "Final Round"
                      : `Next Round ->`}
                </button>
                {currentRound >= totalRounds && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors border border-border"
                    onClick={async () => {
                      await handleGameComplete();
                      router.push("/end");
                    }}
                  >
                    View Results
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoading && (
        <LoadingAnimation
          message="Loading next round..."
          duration={2000}
          onComplete={() => setShowLoading(false)}
        />
      )}
    </div>
  );
};

export default ScoreboardPage;
