"use client";

import { motion } from "framer-motion";
import { SheetMusic } from "@/types";

interface SheetMusicLinkProps {
  sheet: SheetMusic;
  index: number;
}

export default function SheetMusicLink({ sheet, index }: SheetMusicLinkProps) {
  return (
    <motion.a
      href={sheet.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-4 flex items-center gap-4 block"
    >
      {/* Sheet icon */}
      <div
        className="w-12 h-14 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "rgba(168,216,200,0.1)",
          border: "1px solid rgba(168,216,200,0.2)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a8d8c8"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-body text-text-primary truncate">
          {sheet.title}
        </h3>
        <p className="text-xs font-body text-text-secondary mt-0.5">
          IMSLP — Free Sheet Music
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9a9e80"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </motion.a>
  );
}
