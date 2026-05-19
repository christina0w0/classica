"use client";

import { motion } from "framer-motion";

interface WaveformAnimationProps {
  isListening: boolean;
}

export default function WaveformAnimation({
  isListening,
}: WaveformAnimationProps) {
  const bars = 24;

  return (
    <div className="flex items-center justify-center gap-[3px] h-32">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.05;
        const maxHeight = 40 + Math.sin((i / bars) * Math.PI) * 60;

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              backgroundColor: isListening ? "#c5c960" : "#9a9e8040",
            }}
            animate={
              isListening
                ? {
                    height: [8, maxHeight, 12, maxHeight * 0.7, 8],
                    opacity: [0.4, 1, 0.6, 0.9, 0.4],
                  }
                : { height: 8, opacity: 0.3 }
            }
            transition={
              isListening
                ? {
                    duration: 1.2,
                    repeat: Infinity,
                    delay,
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
}
