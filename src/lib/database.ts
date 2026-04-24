import { GameHistory } from "@/types";
import { supabase } from "./supabase";

// Supabase-based storage for games
class GameDatabase {
  // Get all games
  async getAllGames(): Promise<GameHistory[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return this.transformSupabaseData(data || []);
    } catch (error) {
      console.error("Error fetching all games:", error);
      return [];
    }
  }

  // Get game by ID
  async getGameById(id: string): Promise<GameHistory | undefined> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // Not found
        throw error;
      }

      return data ? this.transformSupabaseData([data])[0] : undefined;
    } catch (error) {
      console.error("Error fetching game by ID:", error);
      return undefined;
    }
  }

  // Add new game
  async addGame(
    game: Omit<GameHistory, "id" | "createdAt">,
    userId?: string,
    accessToken?: string,
  ): Promise<GameHistory> {
    try {
      const gameData = this.transformToSupabaseData(game);

      // Create a client with user context if access token is provided
      let client = supabase;
      if (accessToken && userId) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        client = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      }

      const { data, error } = await client
        .from("games")
        .insert({
          ...gameData,
          created_by: userId || null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformSupabaseData([data])[0];
    } catch (error) {
      console.error("Error adding game:", error);
      throw error;
    }
  }

  // Update game
  async updateGame(
    id: string,
    updates: Partial<Omit<GameHistory, "id" | "createdAt">>,
  ): Promise<GameHistory | null> {
    try {
      const updateData = this.transformToSupabaseData(updates);

      const { data, error } = await supabase
        .from("games")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data ? this.transformSupabaseData([data])[0] : null;
    } catch (error) {
      console.error("Error updating game:", error);
      return null;
    }
  }

  // Delete game
  async deleteGame(id: string): Promise<GameHistory | null> {
    try {
      const { data, error } = await supabase
        .from("games")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data ? this.transformSupabaseData([data])[0] : null;
    } catch (error) {
      console.error("Error deleting game:", error);
      return null;
    }
  }

  // Get games with pagination
  async getGamesPaginated(
    limit: number,
    offset: number = 0,
  ): Promise<{ games: GameHistory[]; total: number }> {
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from("games")
        .select("*", { count: "exact", head: true });

      // Get paginated data
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const games = this.transformSupabaseData(data || []);

      return {
        games,
        total: totalCount || 0,
      };
    } catch (error) {
      console.error("Error fetching paginated games:", error);
      return { games: [], total: 0 };
    }
  }

  // Get games by team
  async getGamesByTeam(teamId: string): Promise<GameHistory[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .contains("teams", JSON.stringify([{ id: teamId }]))
        .order("created_at", { ascending: false });

      if (error) throw error;

      return this.transformSupabaseData(data || []);
    } catch (error) {
      console.error("Error fetching games by team:", error);
      return [];
    }
  }

  // Get games by player
  async getGamesByPlayer(playerId: number): Promise<GameHistory[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .contains("teams", JSON.stringify([{ players: [{ id: playerId }] }]))
        .order("created_at", { ascending: false });

      if (error) throw error;

      return this.transformSupabaseData(data || []);
    } catch (error) {
      console.error("Error fetching games by player:", error);
      return [];
    }
  }

  // Clear all games (for testing/reset)
  async clearAllGames(): Promise<void> {
    try {
      const { error } = await supabase
        .from("games")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing all games:", error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics(): Promise<{
    totalGames: number;
    totalPlayers: number;
    mostActivePlayer: { id: number; name: string; gamesPlayed: number } | null;
    mostWinningTeam: { id: string; name: string; wins: number } | null;
  }> {
    try {
      // Get total games count
      const { count: totalGames } = await supabase
        .from("games")
        .select("*", { count: "exact", head: true });

      // Get all games for statistics
      const { data: games, error } = await supabase
        .from("games")
        .select("teams, winner_team_id");

      if (error) throw error;

      const allGames = this.transformSupabaseData(games || []);

      // Get all unique players
      const allPlayers = new Map<
        number,
        { name: string; gamesPlayed: number }
      >();
      allGames.forEach((game) => {
        game.teams.forEach((team) => {
          team.players.forEach((player) => {
            const current = allPlayers.get(player.id) || {
              name: player.name,
              gamesPlayed: 0,
            };
            current.gamesPlayed++;
            allPlayers.set(player.id, current);
          });
        });
      });

      // Find most active player
      let mostActivePlayer = null;
      let maxGamesPlayed = 0;
      allPlayers.forEach((data, id) => {
        if (data.gamesPlayed > maxGamesPlayed) {
          maxGamesPlayed = data.gamesPlayed;
          mostActivePlayer = {
            id,
            name: data.name,
            gamesPlayed: data.gamesPlayed,
          };
        }
      });

      // Get all teams and their wins
      const teamWins = new Map<string, { name: string; wins: number }>();
      allGames.forEach((game) => {
        if (game.winner) {
          const winnerTeam = game.teams.find((team) => team.id === game.winner);
          if (winnerTeam) {
            const current = teamWins.get(winnerTeam.id) || {
              name: winnerTeam.name,
              wins: 0,
            };
            current.wins++;
            teamWins.set(winnerTeam.id, current);
          }
        }
      });

      // Find most winning team
      let mostWinningTeam = null;
      let maxWins = 0;
      teamWins.forEach((data, id) => {
        if (data.wins > maxWins) {
          maxWins = data.wins;
          mostWinningTeam = { id, name: data.name, wins: data.wins };
        }
      });

      return {
        totalGames: totalGames || 0,
        totalPlayers: allPlayers.size,
        mostActivePlayer,
        mostWinningTeam,
      };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return {
        totalGames: 0,
        totalPlayers: 0,
        mostActivePlayer: null,
        mostWinningTeam: null,
      };
    }
  }

  // Transform Supabase data to our format
  private transformSupabaseData(data: any[]): GameHistory[] {
    return data.map((item) => ({
      id: item.id,
      teams: item.teams || [],
      gameDetails: {
        gameType: item.game_type,
        duration: item.duration_seconds,
        totalRounds: item.total_rounds,
        location: item.location,
        notes: item.notes,
      },
      finalScores: item.final_scores || {},
      winner: item.winner_team_id,
      createdAt: item.created_at,
      completedAt: item.completed_at,
    }));
  }

  // Transform our data to Supabase format
  private transformToSupabaseData(data: any): any {
    const result: any = {};

    // Handle gameDetails
    if (data.gameDetails) {
      result.game_type = data.gameDetails.gameType;
      result.duration_seconds = data.gameDetails.duration;
      result.total_rounds = data.gameDetails.totalRounds;
      result.location = data.gameDetails.location;
      result.notes = data.gameDetails.notes;
    } else if (data.game_type) {
      // Handle direct Supabase format
      result.game_type = data.game_type;
      result.duration_seconds = data.duration_seconds;
      result.total_rounds = data.total_rounds;
      result.location = data.location;
      result.notes = data.notes;
    }

    // Handle other fields
    if (data.teams !== undefined) result.teams = data.teams;
    if (data.finalScores !== undefined) result.final_scores = data.finalScores;
    if (data.winner !== undefined) result.winner_team_id = data.winner;
    if (data.completedAt !== undefined) result.completed_at = data.completedAt;

    return result;
  }
}

// Export singleton instance
export const gameDB = new GameDatabase();
