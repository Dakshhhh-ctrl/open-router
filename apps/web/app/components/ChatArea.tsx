"use client";

import { useEffect, useRef, useState } from "react";
import type { Conversation } from "../lib/types";
import type { CostEstimate } from "../lib/costs";
import { MessageBubble } from "./MessageBubble";
import { VoiceChatInput } from "./Voicechatinput";
import { ModelSelector } from "./ModelSelector";
import { TemplateBar } from "./TemplateBar";
import { ExportMenu } from "./Exportmenu";
import { CostMeter } from "./CostMeter";

interface ChatAreaProps {
  conversation: Conversation | null;
  selectedModel: string;
  userName: string;
  isStreaming: boolean;
  error: string | null;
  costEstimate: CostEstimate;
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
  costEstimate,
  onSend,
  onStop,
  onModelChange,
  onNewChat,
  systemPrompt,
  onChangeSystemPrompt,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copyLinkState, setCopyLinkState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-export-menu]")) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExportMenu]);

  const handleCopyLink = async () => {
    if (!conversation) return;
    try {
      const { generateShareLink, copyToClipboard } = await import("../lib/export");
      const link = generateShareLink(conversation.messages);
      await copyToClipboard(link);
      setCopyLinkState("copied");
      setTimeout(() => setCopyLinkState("idle"), 2000);
    } catch {
      /* silent */
    }
  };

  const handleExportPDF = async () => {
    if (!conversation) return;
    const { exportChatAsPDF } = await import("../lib/export");
    exportChatAsPDF(conversation.messages, conversation.title);
    setShowExportMenu(false);
  };

  const isEmpty = !conversation || conversation.messages.length === 0;
  const hasMessages = !isEmpty;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* ── Unified top bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm flex-shrink-0 min-w-0">

        {/* Chat title — fixed width, shrinks away on small screens */}
        <span className="hidden sm:block text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
          {conversation?.title ?? "New Chat"}
        </span>

        {conversation?.title && (
          <span className="hidden sm:block text-gray-800 flex-shrink-0">·</span>
        )}

        {/* Template pills — takes all available space, scrollable */}
        <div className="flex-1 min-w-0">
          <TemplateBar
            systemPrompt={systemPrompt}
            onChangeSystemPrompt={onChangeSystemPrompt}
            containerClassName=""
          />
        </div>

        {/* Right actions — always visible, never pushed off */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Export button — only when there are messages */}
          {hasMessages && (
            <div className="relative" data-export-menu>
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                title="Export conversation"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Dropdown */}
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50 overflow-hidden animate-fade-in">
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Download as PDF
                  </button>
                  <div className="border-t border-white/5" />
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {copyLinkState === "copied" ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-emerald-400">Link copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Copy share link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Model selector */}
          <ModelSelector selectedModel={selectedModel} onSelect={onModelChange} />
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen userName={userName} onSend={onSend} onNewChat={onNewChat} />
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
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Cost meter — always visible, updates live ────────────────── */}
      <CostMeter estimate={costEstimate} isStreaming={isStreaming} />

      {/* ── Input ───────────────────────────────────────────────────── */}
      <VoiceChatInput
        onSubmit={onSend}
        isLoading={isStreaming}
        lastAssistantMessage={
          conversation?.messages[conversation.messages.length - 1]?.content
        }
      />

      {/* Legacy ExportMenu — kept for backward compat, hidden */}
      {false && showExportMenu && conversation && (
        <ExportMenu
          messages={conversation.messages
            .filter((msg) => msg.role !== "system")
            .map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: msg.timestamp.getTime(),
            }))}
          options={{ title: conversation.title, model: conversation.model }}
        />
      )}
    </div>
  );
}

// ── Welcome screen ───────────────────────────────────────────────────────────

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
    { label: "Explain quantum computing simply", emoji: "⚛️" },
    { label: "Write a Python web scraper", emoji: "🐍" },
    { label: "Best practices for React in 2026", emoji: "⚛️" },
    { label: "Help me draft a cover letter", emoji: "📝" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 animate-fade-in">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-white mb-2">
        {userName ? `Hello, ${userName}! 👋` : "Hello there! 👋"}
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm leading-relaxed">
        Chat with 400+ AI models in one place.
        Switch models, compare responses, export conversations.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSend(s.label)}
            className="group flex items-start gap-3 p-3.5 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.15] text-sm text-gray-400 hover:text-gray-100 transition-all"
          >
            <span className="text-base leading-none mt-0.5 opacity-70 group-hover:opacity-100">
              {s.emoji}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="mt-8 text-[11px] text-gray-700">
        Tip: Use ⚡ Compare Models in the sidebar to run the same prompt across 3 models simultaneously
      </p>
    </div>
  );
}
