"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Composer, MusicEra, ERA_CONFIG, ComposerRelationship } from "@/types";
import { composers, relationships } from "@/lib/composers-seed";
import { getComposerPieceCounts, getAllCustomComposers, removeComposerAndPieces, getFavoritePieces } from "@/lib/store";
import { MusicPiece } from "@/types";
import { getComposerImage } from "@/lib/composer-images";
import ComposerBubble from "./ComposerBubble";

const ERAS: MusicEra[] = [
  "renaissance",
  "baroque",
  "classical",
  "romantic",
  "modern",
];

const DEFAULT_COMPOSER_IDS = [
  "palestrina",
  "monteverdi",
  "bach",
  "vivaldi",
  "handel",
  "haydn",
  "mozart",
  "beethoven",
  "chopin",
  "tchaikovsky",
  "brahms",
  "debussy",
  "stravinsky",
  "shostakovich",
];

const composerNames: Record<string, string> = {};
for (const c of composers) {
  composerNames[c.id] = c.name;
}

function relationshipTypeLabel(type: string): string {
  switch (type) {
    case "teacher": return "Teacher\u2013Student";
    case "influence": return "Influence";
    case "contemporary": return "Contemporaries";
    default: return type;
  }
}

interface PositionedComposer {
  composer: Composer;
  rawY: number;
  y: number;
  side: "left" | "right";
}

const MIN_BUBBLE_GAP = 60;

function resolveCollisions(items: PositionedComposer[]): PositionedComposer[] {
  const sorted = [...items].sort((a, b) => a.rawY - b.rawY);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.y - prev.y < MIN_BUBBLE_GAP) {
      curr.y = prev.y + MIN_BUBBLE_GAP;
    }
  }
  return sorted;
}

function EraSection({
  era,
  eraComposers,
  allDisplayComposers,
  expanded,
  onToggle,
  pieceCounts,
  eraRelationships,
  eraIndex,
  onDeleteComposer,
}: {
  era: MusicEra;
  eraComposers: Composer[];
  allDisplayComposers: Composer[];
  expanded: boolean;
  onToggle: () => void;
  pieceCounts: Record<string, number>;
  eraRelationships: ComposerRelationship[];
  eraIndex: number;
  onDeleteComposer: (composerId: string) => void;
}) {
  const config = ERA_CONFIG[era];

  const positioned = useMemo(() => {
    let leftCount = 0;
    let rightCount = 0;
    const eraHeight = Math.max(eraComposers.length * MIN_BUBBLE_GAP + 40, 200);

    const items: PositionedComposer[] = eraComposers.map((composer, i) => {
      const fraction = eraComposers.length <= 1
        ? 0.5
        : i / (eraComposers.length - 1);
      const rawY = 20 + fraction * (eraHeight - 60);
      const side: "left" | "right" =
        leftCount <= rightCount ? "left" : "right";
      if (side === "left") leftCount++;
      else rightCount++;
      return { composer, rawY, y: rawY, side };
    });

    return resolveCollisions(items);
  }, [eraComposers]);

  const expandedHeight = useMemo(() => {
    if (positioned.length === 0) return 120;
    const lastY = positioned[positioned.length - 1].y;
    return Math.max(lastY + 70, 120);
  }, [positioned]);

  const composerPositionMap = useMemo(() => {
    const map: Record<string, { y: number; side: "left" | "right" }> = {};
    for (const pc of positioned) {
      map[pc.composer.id] = { y: pc.y, side: pc.side };
    }
    return map;
  }, [positioned]);

  const visibleRelationships = useMemo(() => {
    return eraRelationships.filter(
      (r) => composerPositionMap[r.from] && composerPositionMap[r.to],
    );
  }, [eraRelationships, composerPositionMap]);

  const [hoveredRel, setHoveredRel] = useState<ComposerRelationship | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleRelMouseEnter = useCallback((e: React.MouseEvent, rel: ComposerRelationship) => {
    setHoveredRel(rel);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRelMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRelMouseLeave = useCallback(() => {
    setHoveredRel(null);
    setTooltipPos(null);
  }, []);

  return (
    <div className="relative">
      {/* Era background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${config.color}08 0%, ${config.color}04 100%)`,
        }}
      />

      {/* Boundary line at top (except first era) */}
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

      {/* Clickable era header */}
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
          {/* Collapsed: show portrait stack */}
          {!expanded && eraComposers.length > 0 && (
            <div className="flex items-center -space-x-2">
              {eraComposers.slice(0, 5).map((c, i) => {
                const img = getComposerImage(c.id);
                const stackRotation = [5, -6, 4, -5, 7][i];
                return (
                  <div
                    key={c.id}
                    className="w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center"
                    style={{
                      borderColor: config.color + "50",
                      background: `radial-gradient(circle, ${config.color}20, ${config.color}08)`,
                      transform: `rotate(${stackRotation}deg)`,
                      zIndex: 5 - i,
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={c.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-[9px] font-body"
                        style={{ color: config.color }}
                      >
                        {c.name.charAt(0)}
                      </span>
                    )}
                  </div>
                );
              })}
              {eraComposers.length > 5 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-body"
                  style={{
                    borderColor: config.color + "50",
                    background: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  +{eraComposers.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Chevron */}
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

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: expandedHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-hidden"
          >
            {/* Radial glow */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: 200,
                height: 200,
                background: `radial-gradient(circle, ${config.color}0a 0%, transparent 70%)`,
              }}
            />

            {/* Central timeline line */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-px top-0"
              style={{
                height: expandedHeight,
                background: `linear-gradient(180deg, ${config.color}15, ${config.color}25, ${config.color}15)`,
              }}
            />

            {/* Relationship SVG lines */}
            {visibleRelationships.length > 0 && (
              <svg
                className="absolute inset-0 w-full pointer-events-none"
                style={{ height: expandedHeight }}
                viewBox={`0 0 400 ${expandedHeight}`}
                preserveAspectRatio="none"
              >
                {visibleRelationships.map((rel, i) => {
                  const fromPos = composerPositionMap[rel.from];
                  const toPos = composerPositionMap[rel.to];
                  if (!fromPos || !toPos) return null;

                  const fromX = fromPos.side === "left" ? 155 : 245;
                  const toX = toPos.side === "left" ? 155 : 245;
                  const fromY = fromPos.y + 22;
                  const toY = toPos.y + 22;
                  const midY = (fromY + toY) / 2;
                  const curveOffset =
                    fromPos.side === toPos.side ? 40 : 0;
                  const cpX =
                    fromPos.side === toPos.side
                      ? fromPos.side === "left"
                        ? fromX - curveOffset
                        : fromX + curveOffset
                      : 200;

                  const pathD = `M ${fromX} ${fromY} Q ${cpX} ${midY} ${toX} ${toY}`;
                  const isHovered =
                    hoveredRel?.from === rel.from && hoveredRel?.to === rel.to;

                  return (
                    <g key={`${rel.from}-${rel.to}-${i}`}>
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke={config.color}
                        strokeWidth={isHovered ? "1.5" : "1"}
                        strokeOpacity={isHovered ? "0.6" : "0.15"}
                        strokeDasharray={
                          rel.type === "influence"
                            ? "4 4"
                            : rel.type === "contemporary"
                              ? "2 6"
                              : "none"
                        }
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
                        style={{ pointerEvents: "none" }}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="15"
                        style={{ pointerEvents: "stroke", cursor: "pointer" }}
                        onMouseEnter={(e) => handleRelMouseEnter(e, rel)}
                        onMouseMove={handleRelMouseMove}
                        onMouseLeave={handleRelMouseLeave}
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Composer bubbles */}
            {positioned.map((pc, i) => (
              <div
                key={pc.composer.id}
                className="absolute w-full"
                style={{ top: pc.y }}
              >
                <ComposerBubble
                  composer={pc.composer}
                  pieceCount={pieceCounts[pc.composer.id] || 0}
                  index={i}
                  side={pc.side}
                  onDelete={onDeleteComposer}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hoveredRel && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 12,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-black/85 backdrop-blur-sm text-white rounded-lg px-3 py-2.5 max-w-[240px] shadow-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              <span>{composerNames[hoveredRel.from] || hoveredRel.from}</span>
              <span className="opacity-50">
                {hoveredRel.type === "contemporary" ? "&" : "\u2192"}
              </span>
              <span>{composerNames[hoveredRel.to] || hoveredRel.to}</span>
            </div>
            <div
              className="text-[10px] font-medium mt-1 tracking-wide uppercase"
              style={{ color: config.color }}
            >
              {relationshipTypeLabel(hoveredRel.type)}
            </div>
            {hoveredRel.description && (
              <p className="text-[10px] leading-relaxed mt-1 opacity-75">
                {hoveredRel.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Timeline({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [pieceCounts, setPieceCounts] = useState<Record<string, number>>({});
  const [favPieces, setFavPieces] = useState<MusicPiece[]>([]);
  const [expandedEras, setExpandedEras] = useState<Set<MusicEra>>(
    () => new Set(ERAS),
  );

  useEffect(() => {
    setPieceCounts(getComposerPieceCounts());
    setFavPieces(getFavoritePieces());

    const onStorage = () => {
      setPieceCounts(getComposerPieceCounts());
      setFavPieces(getFavoritePieces());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("collection-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("collection-updated", onStorage);
    };
  }, []);

  const [customComposers, setCustomComposers] = useState<Composer[]>([]);

  useEffect(() => {
    setCustomComposers(getAllCustomComposers());

    const onUpdate = () => setCustomComposers(getAllCustomComposers());
    window.addEventListener("collection-updated", onUpdate);
    return () => window.removeEventListener("collection-updated", onUpdate);
  }, []);

  const favComposerIds = useMemo(() => {
    return new Set(favPieces.map((p) => p.composerId));
  }, [favPieces]);

  const displayComposers = useMemo(() => {
    const allComposers = [...composers, ...customComposers.filter(
      (cc) => !composers.some((c) => c.id === cc.id),
    )];
    const composersWithPieces = allComposers.filter(
      (c) => (pieceCounts[c.id] || 0) > 0,
    );

    const base = composersWithPieces.length > 0
      ? composersWithPieces
      : composers.filter((c) => DEFAULT_COMPOSER_IDS.includes(c.id));

    if (favoritesOnly) {
      return base.filter((c) => favComposerIds.has(c.id));
    }
    return base;
  }, [pieceCounts, customComposers, favoritesOnly, favComposerIds]);

  const composersByEra = useMemo(() => {
    const map: Record<MusicEra, Composer[]> = {
      renaissance: [],
      baroque: [],
      classical: [],
      romantic: [],
      modern: [],
    };
    for (const c of displayComposers) {
      map[c.era].push(c);
    }
    for (const era of ERAS) {
      map[era].sort((a, b) => a.birthYear - b.birthYear);
    }
    return map;
  }, [displayComposers]);

  const relationshipsByEra = useMemo(() => {
    const map: Record<MusicEra, ComposerRelationship[]> = {
      renaissance: [],
      baroque: [],
      classical: [],
      romantic: [],
      modern: [],
    };
    const composerEra: Record<string, MusicEra> = {};
    for (const c of displayComposers) {
      composerEra[c.id] = c.era;
    }
    for (const rel of relationships) {
      const fromEra = composerEra[rel.from];
      const toEra = composerEra[rel.to];
      if (fromEra && toEra && fromEra === toEra) {
        map[fromEra].push(rel);
      }
    }
    return map;
  }, [displayComposers]);

  const handleDeleteComposer = useCallback((composerId: string) => {
    removeComposerAndPieces(composerId);
    setPieceCounts(getComposerPieceCounts());
    setCustomComposers(getAllCustomComposers());
  }, []);

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
        <EraSection
          key={era}
          era={era}
          eraComposers={composersByEra[era]}
          allDisplayComposers={displayComposers}
          expanded={expandedEras.has(era)}
          onToggle={() => toggleEra(era)}
          pieceCounts={pieceCounts}
          eraRelationships={relationshipsByEra[era]}
          eraIndex={eraIdx}
          onDeleteComposer={handleDeleteComposer}
        />
      ))}
    </div>
  );
}
