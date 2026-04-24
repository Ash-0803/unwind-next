import { GameHistory, GameDetails, Team } from "@/types";
import { supabase } from "./supabase";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

export interface CreateGameData {
  teams: Team[];
  gameDetails: GameDetails;
  finalScores?: Record<string, number>;
  winner?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api"
        : "/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // Get auth token from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Games API
  async getGames(
    limit?: number,
    offset?: number,
  ): Promise<ApiResponse<GameHistory[]>> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    const endpoint = `/games${params.toString() ? `?${params.toString()}` : ""}`;
    return this.request<GameHistory[]>(endpoint);
  }

  async createGame(
    gameData: CreateGameData,
  ): Promise<ApiResponse<GameHistory>> {
    return this.request<GameHistory>("/games", {
      method: "POST",
      body: JSON.stringify(gameData),
    });
  }

  async getGameById(id: string): Promise<ApiResponse<GameHistory>> {
    return this.request<GameHistory>(`/games/${id}`);
  }

  async updateGame(
    id: string,
    updates: Partial<CreateGameData>,
  ): Promise<ApiResponse<GameHistory>> {
    return this.request<GameHistory>(`/games/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteGame(id: string): Promise<ApiResponse<GameHistory>> {
    return this.request<GameHistory>(`/games/${id}`, {
      method: "DELETE",
    });
  }

  async getGamesByTeam(teamId: string): Promise<ApiResponse<GameHistory[]>> {
    return this.request<GameHistory[]>(`/games?teamId=${teamId}`);
  }

  async getGamesByPlayer(
    playerId: number,
  ): Promise<ApiResponse<GameHistory[]>> {
    return this.request<GameHistory[]>(`/games?playerId=${playerId}`);
  }

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
    return this.request("/games/stats");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
