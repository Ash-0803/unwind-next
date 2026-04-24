import { NextRequest, NextResponse } from "next/server";
import { GameHistory } from "@/types";
import { gameDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = offset ? parseInt(offset) : 0;
      const result = await gameDB.getGamesPaginated(limitNum, offsetNum);

      return NextResponse.json({
        success: true,
        data: result.games,
        total: result.total,
      });
    }

    const allGames = await gameDB.getAllGames();
    const sortedGames = allGames.sort(
      (a: GameHistory, b: GameHistory) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      data: sortedGames,
      total: sortedGames.length,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch games" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gameData: Omit<GameHistory, "id" | "createdAt"> =
      await request.json();

    // Validate required fields
    if (!gameData.teams || !gameData.gameDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: teams and gameDetails",
        },
        { status: 400 },
      );
    }

    // Add to database
    const savedGame = await gameDB.addGame(gameData);

    return NextResponse.json({
      success: true,
      data: savedGame,
    });
  } catch (error) {
    console.error("Error saving game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save game" },
      { status: 500 },
    );
  }
}
