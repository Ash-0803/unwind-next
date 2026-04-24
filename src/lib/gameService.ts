import { GameHistory, GameDetails } from "@/types";

const API_BASE_URL = "/api/games";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

export interface GameCreateRequest {
  teams: any[];
  gameDetails: GameDetails;
  finalScores: Record<string, number>;
  winner?: string;
  userId?: string; // Add user ownership
}

export interface GameUpdateRequest {
  finalScores?: Record<string, number>;
  winner?: string;
  completedAt?: string;
  gameDetails?: Partial<GameDetails>;
}

class GameService {
  // Fetch all games
  async getGames(
    limit?: number,
    offset?: number,
  ): Promise<ApiResponse<GameHistory[]>> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await fetch(`${API_BASE_URL}?${params}`);
      const data: ApiResponse<GameHistory[]> = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching games:", error);
      return { success: false, error: "Failed to fetch games" };
    }
  }

  // Fetch a specific game by ID
  async getGameById(id: string): Promise<ApiResponse<GameHistory>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const data: ApiResponse<GameHistory> = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching game:", error);
      return { success: false, error: "Failed to fetch game" };
    }
  }

  // Create a new game
  async createGame(
    gameData: GameCreateRequest,
  ): Promise<ApiResponse<GameHistory>> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      });

      const data: ApiResponse<GameHistory> = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating game:", error);
      return { success: false, error: "Failed to create game" };
    }
  }

  // Update an existing game
  async updateGame(
    id: string,
    updateData: GameUpdateRequest,
  ): Promise<ApiResponse<GameHistory>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data: ApiResponse<GameHistory> = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating game:", error);
      return { success: false, error: "Failed to update game" };
    }
  }

  // Delete a game
  async deleteGame(id: string): Promise<ApiResponse<GameHistory>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      const data: ApiResponse<GameHistory> = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting game:", error);
      return { success: false, error: "Failed to delete game" };
    }
  }

  // Get game statistics
  async getStatistics(): Promise<
    ApiResponse<{
      totalGames: number;
      totalPlayers: number;
      mostActivePlayer: {
        id: number;
        name: string;
        gamesPlayed: number;
      } | null;
      mostWinningTeam: { id: string; name: string; wins: number } | null;
    }>
  > {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return { success: false, error: "Failed to fetch statistics" };
    }
  }

  // Save game from scoreboard (convenience method)
  async saveGameFromScoreboard(
    teams: any[],
    gameDetails: GameDetails,
    finalScores: Record<string, number>,
    userId?: string,
  ): Promise<ApiResponse<GameHistory>> {
    // Determine winner based on highest score
    let winner: string | undefined;
    let highestScore = -1;

    Object.entries(finalScores).forEach(([teamId, score]) => {
      if (score > highestScore) {
        highestScore = score;
        winner = teamId;
      }
    });

    return this.createGame({
      teams,
      gameDetails,
      finalScores,
      winner,
      userId,
    });
  }

  // Complete a game (mark as finished)
  async completeGame(
    id: string,
    finalScores: Record<string, number>,
  ): Promise<ApiResponse<GameHistory>> {
    // Determine winner based on highest score
    let winner: string | undefined;
    let highestScore = -1;

    Object.entries(finalScores).forEach(([teamId, score]) => {
      if (score > highestScore) {
        highestScore = score;
        winner = teamId;
      }
    });

    return this.updateGame(id, {
      finalScores,
      winner,
      completedAt: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const gameService = new GameService();
