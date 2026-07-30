import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const [volunteers, lostItems, missingPersons, announcements] = await Promise.all([
      db.collection("volunteers").countDocuments({ status: "approved" }),
      db.collection("lost_items").countDocuments(),
      db.collection("missing_persons").countDocuments(),
      db.collection("announcements").countDocuments({ status: "published" }),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        volunteers,
        camps: 0,
        assisted: 0,
        support: "24/7",
        lostItems,
        missingPersons,
        announcements,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
