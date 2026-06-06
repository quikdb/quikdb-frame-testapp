import { NextResponse } from "next/server";

// WebSocket upgrade is handled by the custom server (server.js).
// This route exists as a fallback / documentation endpoint.
export async function GET() {
  return NextResponse.json({
    message: "WebSocket endpoint. Connect via ws:// or wss:// protocol.",
    usage: "Use socket.io-client to connect to the root namespace.",
    events: {
      "chat:join": "Join a chat channel — payload: { channel: string }",
      "chat:message": "Send a message — payload: { text: string, channel?: string }",
      "chat:history": "Server sends chat history on join",
      "chat:new-message": "Server broadcasts new messages",
    },
  });
}
