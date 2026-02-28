"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { PixelButton } from "@/components/ui/PixelButton";
import { motion } from "framer-motion";

interface ChatPanelProps {
  memberId?: string;
}

export function ChatPanel({ memberId }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const members = useGameStore((s) => s.members);
  const chatMessages = useGameStore((s) => s.chatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const overlayData = useGameStore((s) => s.overlayData);

  const member = members.find((m) => m.id === memberId);
  if (!member) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    // Add player message
    addChatMessage({
      id: `player-${Date.now()}`,
      from: "player",
      text: input.trim(),
    });
    setInput("");

    // Generate member response (cycle through generic responses)
    setTimeout(() => {
      const state = useGameStore.getState();
      const idx = state.chatGenericIndex % member.chat.genericResponses.length;
      addChatMessage({
        id: `member-${Date.now()}`,
        from: "member",
        text: member.chat.genericResponses[idx],
      });
      useGameStore.setState({ chatGenericIndex: state.chatGenericIndex + 1 });
    }, 500);
  };

  const handleHint = () => {
    const state = useGameStore.getState();
    const idx = state.chatHintIndex % member.chat.hintResponses.length;

    addChatMessage({
      id: `player-hint-${Date.now()}`,
      from: "player",
      text: "Can you give me a hint?",
    });

    setTimeout(() => {
      addChatMessage({
        id: `hint-${Date.now()}`,
        from: "member",
        text: member.chat.hintResponses[idx],
      });
      useGameStore.setState({ chatHintIndex: state.chatHintIndex + 1 });
    }, 500);
  };

  const handleQuiz = () => {
    openOverlay("quiz", { memberId: member.id });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages.length]);

  return (
    <motion.div
      className="overlay-backdrop fixed inset-0 z-50 flex items-end justify-center p-0 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-surface border-t md:border border-surface-light md:rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-light">
          <div className="flex items-center gap-2">
            <span className="text-xl">{member.emoji}</span>
            <span className="font-pixel text-[10px] text-white">
              {member.name}
            </span>
            <span className="text-warning text-xs">&#128274;</span>
          </div>
          <button
            onClick={closeOverlay}
            className="text-gray-400 hover:text-white text-lg"
          >
            &#10005;
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 min-h-[200px]">
          {chatMessages.map((msg) => (
            <ChatMessageComponent
              key={msg.id}
              message={msg}
              memberName={member.name}
            />
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-surface-light px-4 py-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-background border border-surface-light rounded-lg px-3 py-2
                         text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <PixelButton size="sm" onClick={handleSend}>
              Send
            </PixelButton>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleHint}
              className="text-xs text-warning hover:text-yellow-300 bg-warning/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              &#128161; Ask for hint
            </button>
            <button
              onClick={handleQuiz}
              className="text-xs text-success hover:text-teal-300 bg-success/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              &#129513; Take quiz
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
