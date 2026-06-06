"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Wifi, WifiOff, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  _id: string;
  userId: string;
  username: string;
  text: string;
  channel: string;
  createdAt: string;
}

// Generate a random guest name
function getGuestName(): string {
  const adjectives = [
    "Swift",
    "Clever",
    "Bold",
    "Calm",
    "Eager",
    "Brave",
    "Kind",
    "Wise",
  ];
  const nouns = [
    "Fox",
    "Hawk",
    "Bear",
    "Wolf",
    "Deer",
    "Lynx",
    "Owl",
    "Crow",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 99)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username] = useState(() => getGuestName());
  const [connected, setConnected] = useState(false);
  const [socketAvailable, setSocketAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Load initial messages via REST
    loadMessages();

    // Try connecting via Socket.IO
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    try {
      // Use a simple fetch to get messages from the in-memory store
      // In production this would be an authenticated API call
      const res = await fetch("/api/v1/chat/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Use default messages if API not available
      setMessages([
        {
          _id: "msg_001",
          userId: "user_001",
          username: "admin",
          text: "Welcome to the Task Board chat!",
          channel: "general",
          createdAt: new Date("2024-03-01").toISOString(),
        },
        {
          _id: "msg_002",
          userId: "user_002",
          username: "alice",
          text: "Hey team, the CI pipeline is looking good",
          channel: "general",
          createdAt: new Date("2024-03-02").toISOString(),
        },
        {
          _id: "msg_003",
          userId: "user_003",
          username: "bob",
          text: "Auth implementation is coming along nicely",
          channel: "general",
          createdAt: new Date("2024-03-03").toISOString(),
        },
      ]);
    }
  }

  async function connectSocket() {
    try {
      const { io } = await import("socket.io-client");
      const socket = io(window.location.origin, {
        path: "/api/v1/ws/socket.io",
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      socket.on("connect", () => {
        setConnected(true);
        setSocketAvailable(true);
        socket.emit("chat:join", { channel: "general", username });
      });

      socket.on("chat:history", (history: ChatMessage[]) => {
        if (history && history.length > 0) {
          setMessages(history);
        }
      });

      socket.on("chat:new-message", (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.on("connect_error", () => {
        setConnected(false);
        // Socket not available — fall back to REST-only mode
      });

      socketRef.current = socket;
    } catch {
      // socket.io-client not available, use REST-only
      setSocketAvailable(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      _id: `msg_${Date.now()}`,
      userId: `guest_${username}`,
      username,
      text: input.trim(),
      channel: "general",
      createdAt: new Date().toISOString(),
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit("chat:message", {
        text: input.trim(),
        channel: "general",
      });
    } else {
      // Fallback: just add to local state
      setMessages((prev) => [...prev, newMsg]);
    }

    setInput("");
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Chat</h1>
          <p className="text-gray-500 mt-1">
            Real-time communication with your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <Wifi className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <WifiOff className="w-4 h-4" />
              Offline mode
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        {/* Channel Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700"># general</span>
          <span className="text-xs text-gray-400 ml-auto">
            Chatting as{" "}
            <span className="font-medium text-gray-600">{username}</span>
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.username === username;
            return (
              <div
                key={msg._id}
                className={cn(
                  "flex gap-3",
                  isOwn ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    isOwn
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {msg.username.charAt(0).toUpperCase()}
                </div>
                <div
                  className={cn(
                    "max-w-[70%]",
                    isOwn ? "text-right" : "text-left"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOwn ? "text-primary-600" : "text-gray-600"
                      )}
                    >
                      {msg.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "inline-block px-4 py-2 rounded-2xl text-sm",
                      isOwn
                        ? "bg-primary-600 text-white rounded-tr-md"
                        : "bg-gray-100 text-gray-800 rounded-tl-md"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="px-6 py-4 border-t border-gray-200 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
