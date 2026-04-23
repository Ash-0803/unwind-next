"use client";

import React, { useState } from "react";
import type { Player } from "../types";
import PlayerCard from "./PlayerCard";
import "./PlayerPool.css";

interface PlayerPoolProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
  selectedPlayers?: Player[];
}

const PlayerPool: React.FC<PlayerPoolProps> = ({
  players,
  onPlayerSelect,
  selectedPlayers = [],
}) => {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", player.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
  };

  const availablePlayers = players.filter(
    (player) => !selectedPlayers.find((selected) => selected.id === player.id),
  );

  return (
    <div className="player-pool">
      <div className="player-pool-header">
        <h3 className="font-heading text-lg">Available Players</h3>
        <span className="player-count">
          {availablePlayers.length} available
        </span>
      </div>

      <div className="player-pool-grid">
        {availablePlayers.map((player) => (
          <div
            key={player.id}
            className={`player-pool-item ${draggedPlayer?.id === player.id ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, player)}
            onDragEnd={handleDragEnd}
            onClick={() => onPlayerSelect?.(player)}
          >
            <PlayerCard
              player={player}
              compact
              accentColor="hsl(var(--muted-foreground))"
            />
          </div>
        ))}
      </div>

      {availablePlayers.length === 0 && (
        <div className="empty-pool-message">
          <p className="text-muted-foreground">
            All players have been assigned to teams
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerPool;
