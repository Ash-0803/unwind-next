"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, TimerState, Team } from "@/types";
import ScoreController from "@/components/ScoreController";
import Timer from "@/components/Timer";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useRouter } from "next/navigation";

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
  
  // Mock game state - in a real app, this would come from state management
  const [gameState, setGameState] = useState<GameState>({
    teams: [
      {
        id: "team-0",
        name: "Alpha",
        players: [],
        score: 0,
        color: "#0070FF"
      },
      {
        id: "team-1", 
        name: "Beta",
        players: [],
        score: 0,
        color: "#FF4D00"
      }
    ],
    totalRounds: 3,
    currentRound: 1,
    roundResults: [],
    isStarted: true
  });

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

  const handleUpdateScore = (roundNumber: number, teamId: string, score: number) => {
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
          0
        );
        return { ...team, score: totalScore };
      });

      return { ...prev, roundResults: results, teams: updatedTeams };
    });
  };

  const handleUpdateTime = (roundNumber: number, teamId: string, time: number) => {
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
        "Are you sure you want to reset the current game? Teams and scores will be cleared."
      )
    ) {
      router.push("/teams");
    }
  };

  const currentRoundResults = roundResults.find(
    (r) => r.roundNumber === currentRound
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex justify-start">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleReset}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Reset Match
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-xs text-primary font-medium mb-1">Round</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{currentRound}</span>
                    <span className="text-sm text-muted-foreground">/ {totalRounds}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold">
                Live <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Match</span>
              </h1>
            </div>

            <div className="flex-shrink-0">
              <Timer
                timer={timer}
                onStart={handleTimerStart}
                onPause={handleTimerPause}
                onReset={handleTimerReset}
                onDurationChange={handleDurationChange}
              />
            </div>
          </div>
        </div>

        <div className={`grid ${teams.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3 xl:grid-cols-4"} gap-6 mb-8`}>
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              style={{ borderColor: team.color + "40" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <div
                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor: team.color + "20",
                    color: team.color
                  }}
                >
                  {team.score}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Round Score</div>
                  <ScoreController
                    score={currentRoundResults?.scores[team.id] || 0}
                    onScoreChange={(score) =>
                      handleUpdateScore(currentRound, team.id, score)
                    }
                    accentColor={team.color}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-3">Round Time</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg">
                      {currentRoundResults?.times[team.id] !== undefined
                        ? formatLoggedTime(currentRoundResults.times[team.id])
                        : "--"}
                    </span>
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                      onClick={() =>
                        handleUpdateTime(
                          currentRound,
                          team.id,
                          timer.duration - timer.remaining
                        )
                      }
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Log Time
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Match History & Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Round</th>
                  {teams.map((t) => (
                    <th key={t.id} className="text-left py-3 px-4 font-medium" style={{ color: t.color }}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map(
                  (rNum) => {
                    const rRes = roundResults.find((r) => r.roundNumber === rNum);
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
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors border border-border"
              onClick={() => router.push("/end")}
            >
              View Results
            </button>
          )}
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
