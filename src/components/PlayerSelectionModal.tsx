"use client";

import React, { useState, useMemo } from "react";
import type { Player } from "@/types";

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlayers: Player[];
  currentTeamPlayers: Player[];
  onPlayersSelected: (players: Player[]) => void;
  teamName?: string;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  availablePlayers,
  currentTeamPlayers,
  onPlayersSelected,
  teamName = "Team",
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !currentTeamPlayers.some(
          (existingPlayer) => existingPlayer.id === player.id,
        ),
    );
  }, [availablePlayers, searchTerm, currentTeamPlayers]);

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.some((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player],
    );
  };

  const handleConfirm = () => {
    onPlayersSelected(selectedPlayers);
    setSelectedPlayers([]);
    setSearchTerm("");
    onClose();
  };

  const handleClose = () => {
    setSelectedPlayers([]);
    setSearchTerm("");
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedPlayers(filteredPlayers);
  };

  const handleClearAll = () => {
    setSelectedPlayers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-heading">
              Add Players to {teamName}
            </h2>
            <button
              onClick={handleClose}
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

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPlayers.length} selected
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {filteredPlayers.length} available
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Select All
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No players found matching your search"
                  : "No available players"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => togglePlayerSelection(player)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPlayers.some((p) => p.id === player.id)
                      ? "bg-primary/10 border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {!player.image || player.image === "" ? (
                        <div className="text-sm font-bold">
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      ) : (
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm font-bold">${player.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}</div>`;
                            }
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{player.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {player.role ?? "Player"}
                      </div>
                    </div>
                    <div className="ml-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPlayers.some((p) => p.id === player.id)
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}
                      >
                        {selectedPlayers.some((p) => p.id === player.id) && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedPlayers.length === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add {selectedPlayers.length} Player
            {selectedPlayers.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionModal;
