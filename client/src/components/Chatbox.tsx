"use client";

import React, { useState, useEffect, useRef } from "react";
import { playKeyClick, playSpacebar, playToggleBeep } from "@/lib/retroAudio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "### 📟 RETRO-MUSE 9000 ONLINE\n\nI am the **RetroNotes OS Co-Processor**, your creative note assistant. Ask me to brainstorm ideas, format markdown structures, suggest tags, or draft summaries!\n\nTry clicking one of the quick suggestions below, or write your own message!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: "💡 Note Idea", text: "Brainstorm 3 note ideas for a clean code checklist" },
    { label: "📝 Outline Format", text: "Create a neat outline template for study notes" },
    { label: "🏷️ Tag Helper", text: "Suggest some tags for a note about database security" },
    { label: "🔬 Code Template", text: "Show me a nice markdown example for code blocks" },
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiBaseUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message to the Muse");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chatbox API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ *The connection to the Muse grew faint. Please ensure the backend is running and try again.*",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe basic markdown formatter to convert helper formatting into simple HTML
  const formatMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Headers (e.g. ### Title)
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1.5 font-serif">
            {trimmed.replace("### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2 font-serif">
            {trimmed.replace("## ", "")}
          </h3>
        );
      }

      // Blockquotes (e.g. > block)
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-2 border-gray-700 pl-3 italic text-gray-400 my-2 text-xs">
            {parseInlineStyles(trimmed.replace("> ", ""))}
          </blockquote>
        );
      }

      // Bullet points (e.g. - list or * list)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-gray-300 text-xs my-1">
            {parseInlineStyles(trimmed.substring(2))}
          </li>
        );
      }

      // Numbered lists (e.g. 1. list)
      const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numListMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-gray-300 text-xs my-1">
            {parseInlineStyles(numListMatch[2])}
          </li>
        );
      }

      // Empty line
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-gray-300 leading-relaxed mb-1">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to parse bold, italics and code inlines
  const parseInlineStyles = (text: string) => {
    // Basic regex for bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    // Basic regex for italics (*text*)
    const italicRegex = /\*(.*?)\*/g;
    // Basic regex for inline code (`text`)
    const codeRegex = /`(.*?)`/g;

    let parts: React.ReactNode[] = [text];

    // Simple replacement pipeline for React nodes
    // Process Bold
    let tempParts: React.ReactNode[] = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const split = part.split(boldRegex);
        split.forEach((sub, i) => {
          if (i % 2 === 1) {
            tempParts.push(<strong key={`b-${i}`} className="font-semibold text-white">{sub}</strong>);
          } else {
            tempParts.push(sub);
          }
        });
      } else {
        tempParts.push(part);
      }
    });
    parts = tempParts;

    // Process Italics
    tempParts = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const split = part.split(italicRegex);
        split.forEach((sub, i) => {
          if (i % 2 === 1) {
            tempParts.push(<em key={`i-${i}`} className="italic text-gray-200">{sub}</em>);
          } else {
            tempParts.push(sub);
          }
        });
      } else {
        tempParts.push(part);
      }
    });
    parts = tempParts;

    // Process Inline Code
    tempParts = [];
    parts.forEach((part) => {
      if (typeof part === "string") {
        const split = part.split(codeRegex);
        split.forEach((sub, i) => {
          if (i % 2 === 1) {
            tempParts.push(
              <code key={`c-${i}`} className="bg-gray-900 px-1 py-0.5 rounded text-red-400 font-mono text-[10px]">
                {sub}
              </code>
            );
          } else {
            tempParts.push(sub);
          }
        });
      } else {
        tempParts.push(part);
      }
    });
    parts = tempParts;

    return <React.Fragment>{parts}</React.Fragment>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] h-[480px] bg-[var(--panel-bg)]/95 border-2 border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 font-mono screen-glare">
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--bg-color)] border-b-2 border-[var(--border-color)] flex justify-between items-center text-glow">
            <div className="flex items-center gap-2 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                  CO-PROCESSOR 9000
                </h3>
                <p className="text-[9px] text-[var(--fg-color)]/60 uppercase">RETRO-MUSE SUB-SYSTEM</p>
              </div>
            </div>
            <button
              onClick={() => {
                playToggleBeep();
                setIsOpen(false);
              }}
              className="text-[var(--fg-color)]/70 hover:text-[var(--fg-color)] border border-[var(--border-color)] px-1.5 py-0.5 text-[9px] font-bold cursor-pointer"
            >
              [ESC] CLOSE
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] border px-3.5 py-2.5 text-xs shadow-sm rounded-none font-mono ${
                      isUser
                        ? "bg-[var(--panel-bg)]/80 border-[var(--border-color)] text-[var(--fg-color)]/90"
                        : "bg-[var(--bg-color)]/30 border-[var(--border-color)]/40 text-[var(--fg-color)] text-glow"
                    }`}
                  >
                    <p className="text-[9px] text-[var(--fg-color)]/40 uppercase mb-1 font-bold select-none">
                      {isUser ? "USER CMD" : "CO-PROC RESP"}
                    </p>
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="leading-relaxed">{formatMessageContent(msg.content)}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-color)]/40 border border-[var(--border-color)]/40 rounded-none px-3.5 py-3 text-xs text-[var(--fg-color)]/70 flex items-center gap-2 shadow-sm font-mono text-glow animate-pulse select-none">
                  <span>> PROCESSING CO-PROCESSOR REQUEST SECTOR...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-color)]/60 select-none">
              <p className="text-[9px] text-[var(--fg-color)]/40 uppercase mb-1.5 font-bold">Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playToggleBeep();
                      handleSend(prompt.text);
                    }}
                    className="text-[10px] px-2.5 py-1 bg-[var(--bg-color)] border border-[var(--border-color)]/60 text-[var(--fg-color)]/80 hover:text-[var(--fg-color)] hover:bg-[var(--panel-bg)] hover:border-[var(--accent-color)] transition-all cursor-pointer rounded-none font-mono text-glow"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-[var(--bg-color)] border-t border-[var(--border-color)] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const lastChar = e.target.value[e.target.value.length - 1];
                if (lastChar === " " || lastChar === "\n") {
                  playSpacebar();
                } else {
                  playKeyClick();
                }
              }}
              placeholder="Ask the Co-Processor for suggestions..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-[var(--bg-color)] border border-[var(--border-color)] text-xs text-[var(--fg-color)] placeholder-[var(--border-color)]/45 focus:outline-none focus:border-[var(--accent-color)] disabled:opacity-50 font-mono text-glow"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="retro-button px-3 uppercase text-xs font-bold text-glow"
            >
              SEND
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          playToggleBeep();
          setIsOpen(!isOpen);
        }}
        className="w-12 h-12 bg-[var(--bg-color)] hover:bg-[var(--panel-bg)] text-[var(--fg-color)] rounded-none flex items-center justify-center shadow-xl border-2 border-[var(--border-color)] transition-all cursor-pointer group text-glow"
        title="Toggle AI Co-Processor Console"
      >
        {isOpen ? (
          <span className="font-mono font-bold text-xs uppercase">[X]</span>
        ) : (
          <span className="text-lg group-hover:scale-110 transition-transform">📟</span>
        )}
      </button>
    </div>
  );
}
