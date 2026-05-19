"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import PiecesTimeline from "@/components/PiecesTimeline";
import AddPieceModal from "@/components/AddPieceModal";
import { getFavoritePieces } from "@/lib/store";

type ViewMode = "composers" | "pieces";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasFavorites, setHasFavorites] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("composers");

  useEffect(() => {
    setHasFavorites(getFavoritePieces().length > 0);

    const onUpdate = () => setHasFavorites(getFavoritePieces().length > 0);
    window.addEventListener("collection-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("collection-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <div className="relative min-h-dvh pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 px-5 pt-12 bg-bg-primary">
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-bg-primary to-transparent translate-y-full pointer-events-none" />
        <h1 className="font-display text-3xl italic font-light text-text-primary tracking-tight">
          Classica
        </h1>

        {/* View toggle + action buttons */}
        <div className="mt-3 pb-3 flex items-center gap-4">
          {(["composers", "pieces"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="relative pb-1.5 text-[12px] font-body font-medium tracking-wide transition-colors"
              style={{
                color: viewMode === mode ? "#e8e4d4" : "#9a9e8060",
              }}
            >
              {mode === "composers" ? "Composers" : "Pieces"}
              {viewMode === mode && (
                <motion.div
                  layoutId="view-underline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                  style={{ background: "#c5c960" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {hasFavorites && (
              <div className="relative group">
                <button
                  onClick={() => setShowFavoritesOnly((v) => !v)}
                  className="w-8 h-8 rounded-full flex items-center justify-center glass-card shrink-0 transition-colors"
                  style={showFavoritesOnly ? {
                    background: "rgba(197,201,96,0.15)",
                    borderColor: "rgba(197,201,96,0.3)",
                  } : undefined}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={showFavoritesOnly ? "#c5c960" : "none"}
                    stroke={showFavoritesOnly ? "#c5c960" : "#9a9e80"}
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur-sm text-[10px] font-body text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Show favourites
                </span>
              </div>
            )}
            <div className="relative group">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center glass-card shrink-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c5c960"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur-sm text-[10px] font-body text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Add piece
              </span>
            </div>
            <div className="relative group">
              <Link
                href="/settings"
                className="w-8 h-8 rounded-full flex items-center justify-center glass-card shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9a9e80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur-sm text-[10px] font-body text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Settings
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-2 overflow-x-hidden">
        {viewMode === "composers" ? (
          <Timeline favoritesOnly={showFavoritesOnly} />
        ) : (
          <PiecesTimeline favoritesOnly={showFavoritesOnly} />
        )}
      </div>

      <AddPieceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
