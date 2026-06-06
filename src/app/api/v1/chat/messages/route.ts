import { NextRequest, NextResponse } from "next/server";
import { getMessages, createMessage } from "@/lib/data";

export async function GET(request: NextRequest) {
  const channel =
    request.nextUrl.searchParams.get("channel") || "general";
  const messages = await getMessages(channel);
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, username, userId, channel } = body;

    if (!text || !username) {
      return NextResponse.json(
        { error: "text and username are required" },
        { status: 400 }
      );
    }

    const message = await createMessage({
      userId: userId || "guest",
      username,
      text,
      channel: channel || "general",
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
