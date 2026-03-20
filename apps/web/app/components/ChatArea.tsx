"use client";

import { useEffect, useRef } from "react";
import type { Conversation } from "../lib/types";
import { MessageBubble } from "./MessageBubble";
import { VoiceChatInput } from "./Voicechatinput";
import { ModelSelector } from "./ModelSelector";
import { TemplateBar } from "./TemplateBar";

interface ChatAreaProps {
  conversation: Conversation | null;
  selectedModel: string;
  userName: string;
  isStreaming: boolean;
  error: string | null;
  onSend: (msg: string) => void;
  onStop: () => void;
  onModelChange: (id: string) => void;
  onNewChat: () => void;
  systemPrompt: string;
  onChangeSystemPrompt: (prompt: string) => void;
}

export function ChatArea({
  conversation,
  selectedModel,
  userName,
  isStreaming,
  error,
  onSend,
  onStop,
  onModelChange,
  onNewChat,
  systemPrompt,
  onChangeSystemPrompt,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const isEmpty = !conversation || conversation.messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-white truncate max-w-xs">
              {conversation?.title ?? "New Chat"}
            </h1>
            {conversation && (
              <span className="text-xs text-gray-500">
                {conversation.messages.length} messages
              </span>
            )}
          </div>

          <TemplateBar
            systemPrompt={systemPrompt}
            onChangeSystemPrompt={onChangeSystemPrompt}
            containerClassName="mt-0"
          />
        </div>
        <ModelSelector selectedModel={selectedModel} onSelect={onModelChange} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen
            userName={userName}
            onSend={onSend}
            onNewChat={onNewChat}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {conversation.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                userName={userName}
                isStreaming={
                  isStreaming &&
                  i === conversation.messages.length - 1 &&
                  msg.role === "assistant"
                }
              />
            ))}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <VoiceChatInput
        onSubmit={onSend}
        isLoading={isStreaming}
        lastAssistantMessage={
          conversation?.messages[conversation.messages.length - 1]?.content
        }
      />
    </div>
  );
}

function WelcomeScreen({
  userName,
  onSend,
  onNewChat,
}: {
  userName: string;
  onSend: (msg: string) => void;
  onNewChat: () => void;
}) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "What are the best practices for React?",
    "Help me plan a trip to Japan",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-white mb-2">
        {userName ? `Hello, ${userName}! 👋` : "Hello there! 👋"}
      </h2>
      <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
        Start a conversation with any AI model. Switch models anytime using the
        selector above.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            className="p-3 text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm text-gray-300 hover:text-white transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
