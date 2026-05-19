"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MusicPiece, MusicEra, ERA_CONFIG } from "@/types";
import { getAllPieces, getFavoritePieces } from "@/lib/store";
import { composers as seedComposers } from "@/lib/composers-seed";
import { getComposerImage } from "@/lib/composer-images";

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
}: {
  piece: MusicPiece;
  index: number;
  eraColor: string;
}) {
  const composerImage = getComposerImage(piece.composerId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        href={`/piece/${piece.id}`}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.03] active:bg-white/[0.05] group"
      >
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            border: `1.5px solid ${eraColor}50`,
            background: `radial-gradient(circle, ${eraColor}20, ${eraColor}08)`,
          }}
        >
          {composerImage ? (
            <img
              src={composerImage}
              alt={piece.composerName}
              width={36}
              height={36}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span
              className="text-[10px] font-body font-medium"
              style={{ color: eraColor }}
            >
              {piece.composerName.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-body font-medium text-text-primary truncate">
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
            className="text-[11px] font-body mt-0.5 truncate"
            style={{ color: `${eraColor}90` }}
          >
            {piece.composerName}
          </p>
        </div>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={`${eraColor}40`}
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </motion.div>
  );
}

function EraPiecesSection({
  era,
  pieces,
  expanded,
  onToggle,
  eraIndex,
}: {
  era: MusicEra;
  pieces: MusicPiece[];
  expanded: boolean;
  onToggle: () => void;
  eraIndex: number;
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
                {pieces.map((piece, i) => (
                  <PieceRow
                    key={piece.id}
                    piece={piece}
                    index={i}
                    eraColor={config.color}
                  />
                ))}
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
        />
      ))}
    </div>
  );
}
