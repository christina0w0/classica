"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MusicPiece, ERA_CONFIG, MusicEra } from "@/types";

interface PieceCardProps {
  piece: MusicPiece;
  index: number;
}

export default function PieceCard({ piece, index }: PieceCardProps) {
  const eraColor = ERA_CONFIG[piece.era as MusicEra]?.color || "#c5c960";
  const date = new Date(piece.identifiedDate);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={`/piece/${piece.id}`}
        className="glass-card p-4 flex items-center gap-4 block"
      >
        {/* Music note icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${eraColor}15`,
            border: `1px solid ${eraColor}25`,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={eraColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-body font-medium text-text-primary truncate">
              {piece.title}
            </h3>
            {piece.isFavorite && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill={eraColor} stroke="none" className="shrink-0">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </div>
          <p className="text-xs font-body text-text-secondary mt-0.5">
            {dateStr}
          </p>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9a9e80"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </motion.div>
  );
}
