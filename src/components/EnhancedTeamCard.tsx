"use client";

import React, { useState } from "react";
import type { Team, Player } from "../types";
import PlayerCard from "./PlayerCard";
import ScoreController from "./ScoreController";
import "./EnhancedTeamCardStyles.css";

interface EnhancedTeamCardProps {
  team: Team;
  onTeamUpdate: (team: Team) => void;
  onScoreChange: (teamId: string, score: number) => void;
  showScore?: boolean;
  animationDelay?: number;
  availablePlayers?: Player[];
  selectedPlayers?: Player[]; // Add selectedPlayers prop for custom teams
}

const EnhancedTeamCard: React.FC<EnhancedTeamCardProps> = ({
  team,
  onTeamUpdate,
  onScoreChange,
  showScore = true,
  animationDelay = 0,
  availablePlayers = [],
  selectedPlayers = [], // Default to empty array
}) => {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", player.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const playerId = parseInt(e.dataTransfer.getData("text/plain"));
    // Use selectedPlayers for custom teams, availablePlayers for others
    const playerPool =
      selectedPlayers.length > 0 ? selectedPlayers : availablePlayers;
    const player = playerPool.find((p) => p.id === playerId);

    if (player && !team.players.find((p) => p.id === playerId)) {
      const updatedTeam = {
        ...team,
        players: [...team.players, player],
      };
      onTeamUpdate(updatedTeam);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const updatedTeam = {
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    };
    onTeamUpdate(updatedTeam);
  };

  const handleAddPlayer = (player: Player) => {
    if (!team.players.find((p) => p.id === player.id)) {
      const updatedTeam = {
        ...team,
        players: [...team.players, player],
      };
      onTeamUpdate(updatedTeam);
    }
  };

  return (
    <div
      className={`enhanced-team-card ${dragOver ? "drag-over" : ""}`}
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
          <div
            className="empty-team-slot"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="empty-slot-text">Drag players here</span>
          </div>
        ) : (
          <div className="team-players-grid">
            {team.players.map((player, index) => (
              <div
                key={player.id}
                className="player-with-remove"
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
              >
                <PlayerCard player={player} compact accentColor={team.color} />
                <button
                  className="remove-player-btn"
                  onClick={() => handleRemovePlayer(player.id)}
                  title="Remove from team"
                >
                  <svg
                    width="12"
                    height="12"
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                // Add first available player when clicked
                const firstAvailable = availablePlayers.find(
                  (p) => !team.players.find((tp) => tp.id === p.id),
                );
                if (firstAvailable) {
                  handleAddPlayer(firstAvailable);
                }
              }}
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
  );
};

export default EnhancedTeamCard;
