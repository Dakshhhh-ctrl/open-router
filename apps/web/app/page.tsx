"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { SettingsModal } from "./components/SettingsModal";
import { useChat } from "./hooks/useChat";
import {
  getConversations,
  getSettings,
  saveSettings,
  deleteConversation,
} from "./lib/storage";
import type { UserSettings } from "./lib/types";

export default function Home() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    theme: "dark",
    defaultModel: "openai/gpt-4o",
    systemPrompt:
      "You are a helpful, knowledgeable, and friendly AI assistant. Be concise but thorough in your responses.",
  });
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const {
    conversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    error,
    setActiveConversationId,
    loadConversations,
    newConversation,
    deleteConversation: removeConversation,
    sendMessage,
    stopStreaming,
  } = useChat(selectedModel, settings.systemPrompt, settings.name);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedSettings = getSettings();
    setSettings(savedSettings);
    setSelectedModel(savedSettings.defaultModel);
    loadConversations(getConversations());
    setHydrated(true);

    // Apply theme
    document.body.classList.toggle("light", savedSettings.theme === "light");
  }, [loadConversations]);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setSelectedModel(newSettings.defaultModel);
    saveSettings(newSettings);
    document.body.classList.toggle("light", newSettings.theme === "light");
  };

  const handleDeleteConversation = (id: string) => {
    removeConversation(id);
    deleteConversation(id);
  };

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-950">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="fixed top-3 left-3 z-30 md:hidden p-2 rounded-lg bg-gray-900 border border-white/10 text-gray-400"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform fixed md:relative z-20 h-full`}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          settings={settings}
          onSelect={(id) => {
            setActiveConversationId(id);
            setSidebarOpen(false);
          }}
          onNew={() => {
            newConversation();
            setSidebarOpen(false);
          }}
          onDelete={handleDeleteConversation}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat */}
      <ChatArea
        conversation={activeConversation}
        selectedModel={selectedModel}
        userName={settings.name}
        isStreaming={isStreaming}
        error={error}
        onSend={sendMessage}
        onStop={stopStreaming}
        onModelChange={setSelectedModel}
        onNewChat={newConversation}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
