"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ListenButton() {
  return (
    <div className="fixed bottom-22 left-1/2 -translate-x-1/2 z-50">
      <Link href="/listen">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="relative flex items-center justify-center"
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 88,
              height: 88,
              background:
                "radial-gradient(circle, rgba(197,201,96,0.15) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Button */}
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
              boxShadow:
                "0 4px 24px rgba(197,201,96,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {/* Mic icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a1f0e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>

          <span
            className="absolute -bottom-6 text-xs font-body font-medium tracking-wider"
            style={{ color: "#c5c960" }}
          >
            LISTEN
          </span>
        </motion.div>
      </Link>
    </div>
  );
}
