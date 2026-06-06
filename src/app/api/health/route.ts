import { NextResponse } from "next/server";
import { isDBConnected } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: isDBConnected() ? "connected" : "in-memory",
    uptime: process.uptime(),
  });
}
