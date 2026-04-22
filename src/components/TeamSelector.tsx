import React from "react";
import type { TeamGenerationMode } from "@/types";

interface TeamSelectorProps {
  mode: TeamGenerationMode;
  onModeChange: (mode: TeamGenerationMode) => void;
  numTeams: number;
  onNumTeamsChange: (num: number) => void;
  teamSize: number;
  onTeamSizeChange: (size: number) => void;
  customTeams: string[];
  onCustomTeamsChange: (teams: string[]) => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  mode,
  onModeChange,
  numTeams,
  onNumTeamsChange,
  teamSize,
  onTeamSizeChange,
  customTeams,
  onCustomTeamsChange,
}) => {
  const handleAddCustomTeam = () => {
    onCustomTeamsChange([...customTeams, `Team ${customTeams.length + 1}`]);
  };

  const handleRemoveCustomTeam = (index: number) => {
    onCustomTeamsChange(customTeams.filter((_, i) => i !== index));
  };

  const handleCustomTeamNameChange = (index: number, name: string) => {
    const newTeams = [...customTeams];
    newTeams[index] = name;
    onCustomTeamsChange(newTeams);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Team Configuration</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Generation Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onModeChange("numTeams")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === "numTeams"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Number of Teams
            </button>
            <button
              onClick={() => onModeChange("teamSize")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === "teamSize"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Team Size
            </button>
            <button
              onClick={() => onModeChange("custom")}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Custom Teams
            </button>
          </div>
        </div>

        {mode === "numTeams" && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Number of Teams: {numTeams}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={numTeams}
              onChange={(e) => onNumTeamsChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2</span>
              <span>8</span>
            </div>
          </div>
        )}

        {mode === "teamSize" && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Players per Team: {teamSize}
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={teamSize}
              onChange={(e) => onTeamSizeChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2</span>
              <span>6</span>
            </div>
          </div>
        )}

        {mode === "custom" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Custom Teams</label>
              <button
                onClick={handleAddCustomTeam}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Add Team
              </button>
            </div>
            
            <div className="space-y-2">
              {customTeams.map((team, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => handleCustomTeamNameChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Team ${index + 1} name`}
                  />
                  <button
                    onClick={() => handleRemoveCustomTeam(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
              
              {customTeams.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No teams added yet. Click "Add Team" to get started.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelector;
