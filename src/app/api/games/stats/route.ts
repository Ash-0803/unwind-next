import { NextRequest, NextResponse } from "next/server";
import { gameDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const stats = await gameDB.getStatistics();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
