"use client";

import React, { useState } from "react";
import type { Team, Player } from "../types";
import PlayerCard from "./PlayerCard";
import ScoreController from "./ScoreController";
import PlayerSelectionModal from "./PlayerSelectionModal";
import "./EnhancedTeamCardStyles.css";

interface EnhancedTeamCardProps {
  team: Team;
  onTeamUpdate: (team: Team) => void;
  onScoreChange: (teamId: string, score: number) => void;
  showScore?: boolean;
  animationDelay?: number;
  availablePlayers?: Player[];
  selectedPlayers?: Player[];
  allTeams?: Team[]; // Add allTeams prop to check player availability across all teams
}

const EnhancedTeamCard: React.FC<EnhancedTeamCardProps> = ({
  team,
  onTeamUpdate,
  onScoreChange,
  showScore = true,
  animationDelay = 0,
  availablePlayers = [],
  selectedPlayers = [],
  allTeams = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemovePlayer = (playerId: number) => {
    const updatedTeam = {
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    };
    onTeamUpdate(updatedTeam);
  };

  const handleAddPlayers = (playersToAdd: Player[]) => {
    const updatedTeam = {
      ...team,
      players: [...team.players, ...playersToAdd],
    };
    onTeamUpdate(updatedTeam);
  };

  // Get available players for this team (not already assigned to any team)
  const getAvailablePlayersForTeam = () => {
    const playerPool =
      selectedPlayers.length > 0 ? selectedPlayers : availablePlayers;

    // Get all players assigned to any team
    const allAssignedPlayers = allTeams.flatMap((t) => t.players);

    return playerPool.filter(
      (player) =>
        !allAssignedPlayers.some(
          (assignedPlayer) => assignedPlayer.id === player.id,
        ),
    );
  };

  return (
    <>
      <div
        className="enhanced-team-card"
        style={
          {
            "--accent": team.color,
            "--delay": `${animationDelay}ms`,
          } as React.CSSProperties
        }
      >
        <div className="team-card-header">
          <div className="team-badge" style={{ background: team.color }}>
            {team.name.split(" ")[1]?.[0] ?? "T"}
          </div>
          <div className="team-header-info">
            <h3 className="team-name font-heading">{team.name}</h3>
            <span className="team-count">{team.players.length} members</span>
          </div>
          {showScore && (
            <ScoreController
              score={team.score}
              onScoreChange={(score) => onScoreChange(team.id, score)}
              accentColor={team.color}
            />
          )}
        </div>

        <div className="team-divider" style={{ background: team.color }} />

        <div className="team-players-container">
          {team.players.length === 0 ? (
            <div className="empty-team-slot">
              <span className="empty-slot-text">No players yet</span>
              <button
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                Add Players
              </button>
            </div>
          ) : (
            <div className="team-players-grid">
              {team.players.map((player, index) => (
                <div key={player.id} className="player-with-remove">
                  <PlayerCard
                    player={player}
                    compact
                    accentColor={team.color}
                  />
                  <button
                    className="remove-player-btn"
                    onClick={() => handleRemovePlayer(player.id)}
                    title="Remove from team"
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
              ))}
              <div
                className="add-player-slot"
                onClick={() => setIsModalOpen(true)}
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
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availablePlayers={getAvailablePlayersForTeam()}
        currentTeamPlayers={team.players}
        onPlayersSelected={handleAddPlayers}
        teamName={team.name}
      />
    </>
  );
};

export default EnhancedTeamCard;
