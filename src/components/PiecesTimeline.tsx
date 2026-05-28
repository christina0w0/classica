"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MusicPiece, MusicEra, ERA_CONFIG } from "@/types";
import { getAllPieces, getFavoritePieces, removePiece } from "@/lib/store";
import { composers as seedComposers } from "@/lib/composers-seed";
import { getComposerImage } from "@/lib/composer-images";

const LONG_PRESS_MS = 500;

const ERAS: MusicEra[] = [
  "renaissance",
  "baroque",
  "classical",
  "romantic",
  "modern",
];

const composerBirthYears: Record<string, number> = {};
for (const c of seedComposers) {
  composerBirthYears[c.id] = c.birthYear;
}

function PieceRow({
  piece,
  index,
  eraColor,
  onDelete,
}: {
  piece: MusicPiece;
  index: number;
  eraColor: string;
  onDelete: (pieceId: string) => void;
}) {
  const composerImage = getComposerImage(piece.composerId);
  const thumbRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const [showDelete, setShowDelete] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const updatePopoverPos = useCallback(() => {
    if (thumbRef.current) {
      const rect = thumbRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    }
  }, []);

  useEffect(() => {
    if (!showDelete) return;
    updatePopoverPos();
    window.addEventListener("scroll", updatePopoverPos, true);
    window.addEventListener("resize", updatePopoverPos);
    return () => {
      window.removeEventListener("scroll", updatePopoverPos, true);
      window.removeEventListener("resize", updatePopoverPos);
    };
  }, [showDelete, updatePopoverPos]);

  const startLongPress = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowDelete(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, LONG_PRESS_MS);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const dismiss = useCallback(() => setShowDelete(false), []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(piece.id);
    setShowDelete(false);
  }, [piece.id, onDelete]);

  const thumbBorder = showDelete ? "2px solid #ef4444" : `1.5px solid ${eraColor}55`;
  const thumbShadow = showDelete
    ? "0 0 16px rgba(239,68,68,0.35), 0 2px 6px rgba(0,0,0,0.3)"
    : `0 2px 6px ${eraColor}14`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8, transition: { duration: 0.18 } }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 420,
        damping: 30,
      }}
    >
      <Link
        href={`/piece/${piece.id}`}
        onClick={(e) => {
          if (didLongPress.current || showDelete) e.preventDefault();
        }}
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onContextMenu={(e) => e.preventDefault()}
        className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.025] active:bg-white/[0.04]"
        style={{
          opacity: showDelete ? 0.55 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <motion.div
          ref={thumbRef}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            border: thumbBorder,
            background: `radial-gradient(circle at 35% 35%, ${eraColor}30, ${eraColor}10)`,
            boxShadow: thumbShadow,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          {composerImage ? (
            <img
              src={composerImage}
              alt={piece.composerName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              style={{ opacity: showDelete ? 0.5 : 1, transition: "opacity 0.2s" }}
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] font-body font-medium" style={{ color: eraColor }}>
              {piece.composerName.charAt(0)}
            </span>
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-body text-text-primary truncate">
              {piece.title}
            </h3>
            {piece.isFavorite && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill={eraColor}
                stroke="none"
                className="shrink-0"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </div>
          <p
            className="text-[10.5px] font-body mt-0.5 truncate"
            style={{ color: `${eraColor}88` }}
          >
            {piece.composerName}
          </p>
        </div>

        <motion.svg
          initial={{ x: 0 }}
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={`${eraColor}55`}
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 opacity-40 group-hover:opacity-90 transition-opacity"
        >
          <path d="M9 18l6-6-6-6" />
        </motion.svg>
      </Link>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showDelete && popoverPos && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[9998]"
                  onClick={dismiss}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="fixed z-[9999] -translate-x-1/2"
                  style={{ top: popoverPos.top, left: popoverPos.left }}
                >
                  <div className="bg-black/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-xl border border-white/10 whitespace-nowrap">
                    <p className="text-[10px] font-body text-white/50 text-center mb-1.5">
                      Remove {piece.title}?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConfirmDelete}
                        className="flex-1 text-[11px] font-body font-semibold text-red-400 bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={dismiss}
                        className="flex-1 text-[11px] font-body font-medium text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </motion.div>
  );
}

function EraPiecesSection({
  era,
  pieces,
  expanded,
  onToggle,
  eraIndex,
  onDeletePiece,
}: {
  era: MusicEra;
  pieces: MusicPiece[];
  expanded: boolean;
  onToggle: () => void;
  eraIndex: number;
  onDeletePiece: (pieceId: string) => void;
}) {
  const config = ERA_CONFIG[era];

  return (
    <div className="relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${config.color}08 0%, ${config.color}04 100%)`,
        }}
      />

      {eraIndex > 0 && (
        <div className="absolute top-0 w-full flex items-center pointer-events-none">
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}20, transparent)`,
            }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45 shrink-0"
            style={{
              backgroundColor: `${config.color}40`,
              boxShadow: `0 0 6px ${config.color}30`,
            }}
          />
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}20, transparent)`,
            }}
          />
        </div>
      )}

      <button
        onClick={onToggle}
        className="relative w-full flex items-center justify-between px-4 py-4 z-10"
      >
        <div className="flex flex-col items-start">
          <h2
            className="font-display text-xl leading-none tracking-tight italic"
            style={{ color: `${config.color}80` }}
          >
            {config.label}
          </h2>
          <span
            className="font-body text-[10px] tracking-widest mt-1"
            style={{ color: `${config.color}40` }}
          >
            {config.yearStart}–{config.yearEnd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!expanded && pieces.length > 0 && (
            <span
              className="text-[11px] font-body font-medium px-2.5 py-0.5 rounded-full"
              style={{
                color: config.color,
                background: `${config.color}15`,
              }}
            >
              {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
            </span>
          )}

          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config.color + "60"}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-hidden"
          >
            {pieces.length > 0 ? (
              <div className="pb-3 px-1">
                <AnimatePresence initial={false}>
                  {pieces.map((piece, i) => (
                    <PieceRow
                      key={piece.id}
                      piece={piece}
                      index={i}
                      eraColor={config.color}
                      onDelete={onDeletePiece}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="pb-6 px-4">
                <p
                  className="text-[12px] font-body italic text-center py-6"
                  style={{ color: `${config.color}40` }}
                >
                  No pieces in your collection yet
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PiecesTimeline({
  favoritesOnly = false,
}: {
  favoritesOnly?: boolean;
}) {
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [expandedEras, setExpandedEras] = useState<Set<MusicEra>>(
    () => new Set(ERAS),
  );

  useEffect(() => {
    const load = () => {
      const all = favoritesOnly ? getFavoritePieces() : getAllPieces();
      setPieces(all);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("collection-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("collection-updated", load);
    };
  }, [favoritesOnly]);

  const piecesByEra = useMemo(() => {
    const map: Record<MusicEra, MusicPiece[]> = {
      renaissance: [],
      baroque: [],
      classical: [],
      romantic: [],
      modern: [],
    };
    for (const p of pieces) {
      if (map[p.era]) {
        map[p.era].push(p);
      }
    }
    for (const era of ERAS) {
      map[era].sort((a, b) => {
        const yearA = composerBirthYears[a.composerId] ?? 0;
        const yearB = composerBirthYears[b.composerId] ?? 0;
        if (yearA !== yearB) return yearA - yearB;
        return a.title.localeCompare(b.title);
      });
    }
    return map;
  }, [pieces]);

  const toggleEra = useCallback((era: MusicEra) => {
    setExpandedEras((prev) => {
      const next = new Set(prev);
      if (next.has(era)) next.delete(era);
      else next.add(era);
      return next;
    });
  }, []);

  const handleDeletePiece = useCallback((pieceId: string) => {
    removePiece(pieceId);
    setPieces((prev) => prev.filter((p) => p.id !== pieceId));
    window.dispatchEvent(new Event("collection-updated"));
  }, []);

  return (
    <div className="flex flex-col">
      {ERAS.map((era, eraIdx) => (
        <EraPiecesSection
          key={era}
          era={era}
          pieces={piecesByEra[era]}
          expanded={expandedEras.has(era)}
          onToggle={() => toggleEra(era)}
          eraIndex={eraIdx}
          onDeletePiece={handleDeletePiece}
        />
      ))}
    </div>
  );
}
