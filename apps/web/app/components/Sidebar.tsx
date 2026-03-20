"use client";

import { useState } from "react";
import Link from "next/link";
import type { Conversation, UserSettings } from "../lib/types";
import { AVAILABLE_MODELS } from "../lib/models";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  settings: UserSettings;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  settings,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings,
}: SidebarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 2000);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-gray-950 border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">OR</span>
          </div>
          <span className="text-white font-semibold text-sm">OpenRouter Chat</span>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        <div className="mt-2 space-y-2">
          <Link
            href="/pricing"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
          >
            View Pricing
          </Link>
          
          <Link
            href="/compare"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium transition-all"
          >
            ⚡ Compare Models
          </Link>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8 px-4">
            No conversations yet. Start a new chat!
          </p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="flex-1 truncate text-xs">{conv.title}</span>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                  deleteConfirm === conv.id ? "text-red-400" : "text-gray-500 hover:text-red-400"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
            {settings.name ? settings.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-medium text-white">
              {settings.name || "Set your name"}
            </p>
            <p className="text-xs text-gray-500">
              {AVAILABLE_MODELS.find((m) => m.id === settings.defaultModel)?.name || "GPT-4o"}
            </p>
          </div>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
