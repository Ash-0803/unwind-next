import { NextRequest, NextResponse } from "next/server";
import { GameHistory } from "@/types";
import { gameDB } from "@/lib/database";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create service role client for server-side operations if service role key is available
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

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

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    let userId: string | undefined = undefined;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Create a temporary client with the user's token to verify it
      const tempSupabase = createClient(
        supabaseUrl,
        supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

      const {
        data: { user },
        error: authError,
      } = await tempSupabase.auth.getUser(token);

      if (!authError && user) {
        userId = user.id;
      }
    }

    // Add to database with user ID and access token (undefined if not authenticated)
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : undefined;
    const savedGame = await gameDB.addGame(gameData, userId, accessToken);

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
