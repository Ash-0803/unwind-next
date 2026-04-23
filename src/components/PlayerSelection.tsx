"use client";

import React, { useState, useEffect } from "react";
import type { Player } from "@/types";
import { initialPlayers } from "@/data/players";
import PlayerCard from "./PlayerCard";
import "./PlayerSelection.css";

interface PlayerSelectionProps {
  onPlayersSelected: (selectedPlayers: Player[]) => void;
  initialSelectedPlayers?: Player[];
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  onPlayersSelected,
  initialSelectedPlayers = [],
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>(
    initialSelectedPlayers,
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Load saved selection from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedPlayers");
      if (saved && initialSelectedPlayers.length === 0) {
        const savedPlayers = JSON.parse(saved);
        setSelectedPlayers(savedPlayers);
      }
    }
  }, [initialSelectedPlayers]);

  const filteredPlayers = initialPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const togglePlayerSelection = (player: Player) => {
    const isSelected = selectedPlayers.some((p) => p.id === player.id);

    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const selectAll = () => {
    setSelectedPlayers(filteredPlayers);
  };

  const deselectAll = () => {
    setSelectedPlayers([]);
  };

  const handleContinue = () => {
    if (selectedPlayers.length === 0) {
      alert("Please select at least one player");
      return;
    }

    // Save selection to localStorage
    localStorage.setItem("selectedPlayers", JSON.stringify(selectedPlayers));
    onPlayersSelected(selectedPlayers);
  };

  const handleQuickSelect = (count: number) => {
    const shuffled = [...filteredPlayers].sort(() => Math.random() - 0.5);
    setSelectedPlayers(shuffled.slice(0, count));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 font-heading">
            Who's{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Playing Today?
            </span>
          </h1>
          <p className="text-muted-foreground">
            Select the players who will be participating in today's game
          </p>
        </div>

        {/* Selection Stats and Controls */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-primary">
                {selectedPlayers.length} / {filteredPlayers.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Players Selected
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={() => handleQuickSelect(4)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Quick 4
              </button>
              <button
                onClick={() => handleQuickSelect(6)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Quick 6
              </button>
              <button
                onClick={() => handleQuickSelect(8)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Quick 8
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Players Grid */}
        <div className="player-grid grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.some((p) => p.id === player.id);

            return (
              <div
                key={player.id}
                onClick={() => togglePlayerSelection(player)}
                className={`player-selection-card cursor-pointer transition-all duration-200 rounded-xl p-4 border border-border min-h-[160px] flex flex-col items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-col items-center text-center w-full">
                  {/* Fixed size avatar container */}
                  <div
                    className={`player-avatar-container w-12 h-12 rounded-full mb-3 flex items-center justify-center overflow-hidden shrink-0 ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    {!player.image || player.image === "" ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-sm font-bold"
                        style={{
                          color: isSelected
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))",
                        }}
                      >
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
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-sm font-bold" style="color: ${
                                isSelected
                                  ? "hsl(var(--primary))"
                                  : "hsl(var(--muted-foreground))"
                              }">
                                ${player.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            `;
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Player name with proper spacing */}
                  <div className="player-name font-medium text-sm text-center leading-tight mb-2 line-clamp-2">
                    {player.name}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="selected-indicator mt-auto px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                      Selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No players found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedPlayers.length === 0}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Continue to Team Generation{" "}
            {selectedPlayers.length > 0 &&
              `(${selectedPlayers.length} players)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;
