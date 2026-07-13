"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "### ✨ Welcome, Fellow Dreamer!\n\nI am the **InkVerse Muse**, your creative writing companion. Whether you need a spark of inspiration, a rhyming pair, or a quick critique, I am here.\n\nTry clicking one of the quick suggestions below, or write your own message!",
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
    { label: "🌸 Haiku", text: "Write a haiku about a starry night" },
    { label: "🖊️ Poetry Prompt", text: "Give me a prompt for a poetry piece" },
    { label: "🎵 Rhyme Help", text: "What are some words that rhyme with 'silence'?" },
    { label: "🧐 Writing Critique", text: "Can you give me feedback on my writing? Here is a stanza: \n\n'The shadow falls across the floor,\nAnd whispers knock upon the door.'" },
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
        <div className="mb-4 w-[340px] sm:w-[380px] h-[480px] bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-850 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold font-serif text-white tracking-wide">
                  InkVerse Muse
                </h3>
                <p className="text-[10px] text-gray-500">Creative Companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-900 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isUser
                        ? "bg-white text-gray-950 rounded-br-none"
                        : "bg-gray-900/90 border border-gray-850 text-gray-300 rounded-bl-none"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      formatMessageContent(msg.content)
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-900/95 border border-gray-850 rounded-2xl rounded-bl-none px-3.5 py-3 text-xs text-gray-400 flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="italic text-[10px] text-gray-500">The Muse is writing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-gray-900/60 bg-gray-950/40">
              <p className="text-[10px] text-gray-500 mb-1.5">Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-900 border border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850 hover:border-gray-700 transition-all cursor-pointer"
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
            className="p-3 bg-gray-950 border-t border-gray-900 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Muse for prompts or feedback..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-850 rounded-xl text-xs text-gray-200 placeholder-gray-550 focus:outline-none focus:border-gray-700 disabled:opacity-50 font-light"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-gray-950 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white hover:bg-gray-200 hover:scale-105 active:scale-95 text-gray-950 rounded-full flex items-center justify-center shadow-xl border border-gray-200/10 transition-all cursor-pointer group"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <span className="text-lg group-hover:animate-bounce">✨</span>
        )}
      </button>
    </div>
  );
}
