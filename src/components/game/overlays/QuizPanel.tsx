"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { PixelButton } from "@/components/ui/PixelButton";
import { motion } from "framer-motion";

interface QuizPanelProps {
  memberId?: string;
}

export function QuizPanel({ memberId }: QuizPanelProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const rescueTriggered = useRef(false);

  const members = useGameStore((s) => s.members);
  const quizAnswered = useGameStore((s) => s.quizAnswered);
  const quizCorrect = useGameStore((s) => s.quizCorrect);
  const answerQuiz = useGameStore((s) => s.answerQuiz);
  const resetQuiz = useGameStore((s) => s.resetQuiz);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const addChatMessage = useGameStore((s) => s.addChatMessage);

  const member = members.find((m) => m.id === memberId);

  // Handle rescue transition in useEffect (not during render)
  useEffect(() => {
    if (quizAnswered && quizCorrect && member && !rescueTriggered.current) {
      rescueTriggered.current = true;
      addChatMessage({
        id: `rescue-${Date.now()}`,
        from: "member",
        text: member.chat.rescueReaction,
      });
      // Small delay so user sees "correct" feedback before rescue animation
      setTimeout(() => {
        openOverlay("rescue", { memberId: member.id });
      }, 600);
    }
  }, [quizAnswered, quizCorrect, member, addChatMessage, openOverlay]);

  // Reset the ref when quiz resets
  useEffect(() => {
    if (!quizAnswered) {
      rescueTriggered.current = false;
    }
  }, [quizAnswered]);

  if (!member) return null;

  const { quiz } = member;
  const letters = ["A", "B", "C", "D"];

  const handleSubmit = () => {
    if (selected === null) return;
    answerQuiz(selected);
  };

  const handleBackToChat = () => {
    resetQuiz();
    setSelected(null);
    openOverlay("chat", { memberId: member.id });
  };

  return (
    <div className="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-surface border border-surface-light rounded-xl p-6 max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        <h3 className="font-pixel text-[10px] text-primary text-center mb-4">
          &#129513; {member.name}&apos;s Quiz
        </h3>

        <p className="text-white text-sm text-center mb-6 leading-relaxed">
          &quot;{quiz.question}&quot;
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {quiz.options.map((option, i) => (
            <button
              key={i}
              onClick={() => !quizAnswered && setSelected(i)}
              disabled={quizAnswered}
              className={`text-left px-4 py-3 rounded-lg border text-sm transition-all
                ${
                  selected === i
                    ? quizAnswered
                      ? quizCorrect
                        ? "border-success bg-success/20 text-success"
                        : "border-danger bg-danger/20 text-danger"
                      : "border-primary bg-primary/20 text-white"
                    : "border-surface-light bg-background/50 text-gray-300 hover:border-gray-500"
                }`}
            >
              <span className="font-pixel text-[10px] mr-2">
                {letters[i]}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {quizAnswered && quizCorrect && (
          <motion.p
            className="text-success text-xs text-center mb-4 font-pixel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Correct! Rescuing {member.name}...
          </motion.p>
        )}

        {quizAnswered && !quizCorrect && (
          <motion.p
            className="text-danger text-xs text-center mb-4 font-pixel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Wrong answer! Try again or get a hint.
          </motion.p>
        )}

        <div className="flex gap-3 justify-center">
          {!quizAnswered ? (
            <>
              <PixelButton
                size="sm"
                onClick={handleSubmit}
                disabled={selected === null}
              >
                Submit
              </PixelButton>
              <PixelButton size="sm" variant="danger" onClick={handleBackToChat}>
                Back
              </PixelButton>
            </>
          ) : !quizCorrect ? (
            <>
              <PixelButton
                size="sm"
                onClick={() => {
                  resetQuiz();
                  setSelected(null);
                }}
              >
                Try Again
              </PixelButton>
              <PixelButton size="sm" variant="success" onClick={handleBackToChat}>
                Get Hint
              </PixelButton>
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
