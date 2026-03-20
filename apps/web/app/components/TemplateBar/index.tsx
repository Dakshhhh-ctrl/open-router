"use client";

import { useMemo } from "react";
import { PROMPT_TEMPLATES } from "../../lib/templates";

type TemplateBarProps = {
  value: string;
  onSelect: (prompt: string) => void;
};

export function TemplateBar({ value, onSelect }: TemplateBarProps) {
  const selectedTemplateId = useMemo(() => {
    const match = PROMPT_TEMPLATES.find((t) => t.prompt === value);
    return match?.id ?? "custom";
  }, [value]);

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            selectedTemplateId === "custom"
              ? "border-indigo-500 bg-indigo-600/20 text-indigo-200"
              : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
          }`}
        >
          Custom
        </button>

        {PROMPT_TEMPLATES.map((t) => {
          const selected = selectedTemplateId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.prompt)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                selected
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
              title={t.label}
            >
              <span className="mr-2">{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

