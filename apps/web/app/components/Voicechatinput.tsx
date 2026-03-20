"use client";

/**
 * VoiceChatInput — drop-in replacement for your existing chat input.
 *
 * USAGE in your page.tsx / ChatInterface component:
 *
 *   import { VoiceChatInput } from "@/components/VoiceChatInput";
 *
 *   // Replace your <form> / <input> section with:
 *   <VoiceChatInput
 *     onSubmit={(text) => sendMessage(text)}
 *     isLoading={isLoading}
 *     lastAssistantMessage={messages.at(-1)?.content}
 *     autoSpeak={autoSpeak}
 *   />
 *
 * To add TTS to your existing message bubbles, see the TTSButton usage
 * at the bottom of this file.
 */

import { useState, useEffect, useRef } from "react";
import { useVoice } from "../hooks/useVoice";
import { useFileUpload } from "../hooks/useFileUpload";
import { VoiceButton, TTSButton } from "./Voicebutton";
import {
  UploadButton,
  AttachmentStrip,
  HiddenFileInput,
} from "./FileUploadArea";

// ─── VoiceChatInput ───────────────────────────────────────────────────────────

interface VoiceChatInputProps {
  /** Called when user submits a message (text or voice) */
  onSubmit: (
    text: string,
    attachments?: import("../lib/attachment").AttachmentPayload[],
  ) => void;
  /** Disable input while model is streaming */
  isLoading?: boolean;
  /**
   * Pass the latest assistant message here.
   * If autoSpeak is true it will be read aloud automatically.
   */
  lastAssistantMessage?: string;
  /** Auto-read AI responses aloud (user can toggle) */
  autoSpeak?: boolean;
}

export function VoiceChatInput({
  onSubmit,
  isLoading = false,
  lastAssistantMessage,
  autoSpeak: initialAutoSpeak = false,
}: VoiceChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(initialAutoSpeak);
  const prevMessageRef = useRef<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // File upload hook
  const {
    attachments,
    isDragging,
    fileInputRef,
    addFiles,
    removeAttachment,
    clearAttachments,
    openFilePicker,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    errors: fileErrors,
    clearErrors: clearFileErrors,
  } = useFileUpload();

  // ── Wire up voice hook ─────────────────────────────────────────────────────

  const {
    status,
    transcript,
    isSupported,
    isTTSSupported,
    toggleListening,
    stopListening,
    speak,
    stopSpeaking,
    error: voiceError,
  } = useVoice({
    lang: "en-US",
    // When mic stops and we have a transcript, fill the input
    onTranscript: (text) => {
      setInputValue(text);
      // Auto-submit on voice input (optional — remove if you prefer manual)
      if (text.trim()) {
        handleSubmit(text);
      }
    },
  });

  // ── Auto-speak new AI responses ────────────────────────────────────────────

  useEffect(() => {
    if (
      autoSpeak &&
      isTTSSupported &&
      lastAssistantMessage &&
      lastAssistantMessage !== prevMessageRef.current &&
      !isLoading
    ) {
      prevMessageRef.current = lastAssistantMessage;
      speak(lastAssistantMessage);
    }
  }, [lastAssistantMessage, autoSpeak, isTTSSupported, isLoading, speak]);

  // ── Fill textarea when transcript updates mid-speech ──────────────────────

  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = (text?: string) => {
    const value = (text ?? inputValue).trim();
    if (!value || isLoading) return;

    // Create message with attachments if any
    const messageData = {
      text: value,
      attachments:
        attachments.length > 0
          ? attachments.map((a) => ({
              type: a.type,
              mime: a.mime,
              base64: a.base64,
              name: a.name,
            }))
          : undefined,
    };

    stopListening();
    onSubmit(value, messageData.attachments);
    setInputValue("");
    clearAttachments();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Auto-resize textarea ───────────────────────────────────────────────────

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  const isListening = status === "listening";

  return (
    <div className="voice-input-wrapper">
      {/* File errors */}
      {fileErrors.length > 0 && (
        <div className="voice-error" role="alert">
          {fileErrors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
          <button
            type="button"
            onClick={clearFileErrors}
            className="text-xs underline ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Voice error banner */}
      {voiceError && (
        <p className="voice-error" role="alert">
          {voiceError}
        </p>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="voice-listening-banner" aria-live="polite">
          <span className="voice-dot" />
          Listening… speak now, then pause to send
        </div>
      )}

      {/* Attachments strip */}
      <AttachmentStrip attachments={attachments} onRemove={removeAttachment} />

      {/* Input row */}
      <div
        className={`voice-input-row ${isListening ? "voice-input-row--active" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening…"
              : "Message (Enter to send, Shift+Enter for newline)"
          }
          disabled={isLoading}
          rows={1}
          aria-label="Chat message"
          className="voice-textarea"
        />

        <div className="voice-input-actions">
          {/* Upload button */}
          <UploadButton
            onClick={openFilePicker}
            disabled={isLoading}
            hasAttachments={attachments.length > 0}
          />

          {/* Mic button */}
          {isSupported && (
            <VoiceButton
              status={status}
              isSupported={isSupported}
              onClick={status === "speaking" ? stopSpeaking : toggleListening}
            />
          )}

          {/* Auto-speak toggle */}
          {isTTSSupported && (
            <button
              type="button"
              onClick={() => {
                setAutoSpeak((v) => !v);
                if (autoSpeak) stopSpeaking();
              }}
              aria-label={
                autoSpeak ? "Disable auto-speak" : "Enable auto-speak"
              }
              title={
                autoSpeak
                  ? "Auto-speak on — click to disable"
                  : "Auto-speak off — click to enable"
              }
              className={`autospeak-btn ${autoSpeak ? "autospeak-btn--on" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {autoSpeak ? (
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                ) : (
                  <line x1="23" y1="9" x2="17" y2="15" />
                )}
              </svg>
            </button>
          )}

          {/* Send button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={
              (!inputValue.trim() && attachments.length === 0) || isLoading
            }
            aria-label="Send message"
            className="send-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Hidden file input */}
        <HiddenFileInput inputRef={fileInputRef} onChange={addFiles} />
      </div>

      <style>{`
        .voice-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .voice-error {
          font-size: 12px;
          color: #ef4444;
          margin: 0;
          padding: 4px 8px;
          background: #fef2f2;
          border-radius: 6px;
          border: 1px solid #fecaca;
        }
        .dark .voice-error {
          background: #450a0a;
          border-color: #991b1b;
        }
        .voice-listening-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #ef4444;
          padding: 6px 10px;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }
        .dark .voice-listening-banner {
          background: #450a0a;
          border-color: #991b1b;
          color: #f87171;
        }
        .voice-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: voiceDotPulse 1s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes voiceDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        .voice-input-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          padding: 8px 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .dark .voice-input-row {
          border-color: #374151;
          background: #1f2937;
        }
        .voice-input-row:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .voice-input-row--active {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
        }
        .voice-textarea {
          flex: 1;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          line-height: 1.5;
          color: inherit;
          padding: 2px 0;
          min-height: 24px;
          max-height: 200px;
          overflow-y: auto;
          font-family: inherit;
        }
        .voice-textarea::placeholder {
          color: #9ca3af;
        }
        .voice-input-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .autospeak-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          padding: 0;
        }
        .autospeak-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        .dark .autospeak-btn:hover {
          background: #374151;
          color: #d1d5db;
        }
        .autospeak-btn--on {
          color: #3b82f6 !important;
          border-color: #bfdbfe;
          background: #eff6ff;
        }
        .dark .autospeak-btn--on {
          background: #1e3a5f;
          border-color: #1d4ed8;
        }
        .send-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #111827;
          color: #ffffff;
          cursor: pointer;
          transition: opacity 0.15s, background 0.15s;
          padding: 0;
          flex-shrink: 0;
        }
        .dark .send-btn {
          background: #f9fafb;
          color: #111827;
        }
        .send-btn:hover:not(:disabled) {
          background: #374151;
        }
        .dark .send-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }
        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// ─── Example: TTSButton wired into a message bubble ──────────────────────────
//
// In your existing message component, add this to each AI message:
//
//   import { TTSButton } from "@/components/VoiceButton";
//   import { useVoice } from "@/hooks/useVoice";
//
//   // In your ChatMessage component:
//   const { status, speak, stopSpeaking } = useVoice();
//
//   // Inside the AI message bubble JSX:
//   <TTSButton
//     text={message.content}
//     isSpeaking={status === "speaking"}
//     onSpeak={speak}
//     onStop={stopSpeaking}
//   />
//
// ─────────────────────────────────────────────────────────────────────────────
