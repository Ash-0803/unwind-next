import { NextRequest, NextResponse } from "next/server";
import { GameHistory } from "@/types";
import { gameDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const game = await gameDB.getGameById(id);

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    const updatedGame = await gameDB.updateGame(id, updateData);

    if (!updatedGame) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGame,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deletedGame = await gameDB.deleteGame(id);

    if (!deletedGame) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedGame,
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete game" },
      { status: 500 },
    );
  }
}
