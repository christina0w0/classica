"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Composer, ERA_CONFIG } from "@/types";
import { getComposerImage } from "@/lib/composer-images";
import { getPortraitShape, getPortraitRotation } from "@/lib/portrait-shapes";

const LONG_PRESS_MS = 500;

interface ComposerBubbleProps {
  composer: Composer;
  pieceCount: number;
  index: number;
  side: "left" | "right";
  onDelete?: (composerId: string) => void;
}

export default function ComposerBubble({
  composer,
  pieceCount,
  index,
  side,
  onDelete,
}: ComposerBubbleProps) {
  const [imgError, setImgError] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const baseSize = 44;
  const size = baseSize + Math.min(pieceCount * 8, 28);
  const eraColor = ERA_CONFIG[composer.era].color;
  const lastName = composer.name.split(" ").pop() || composer.name;
  const lastNamePronunciation = composer.pronunciation?.split(" ").pop();
  const localImage = getComposerImage(composer.id);

  const rotation = useMemo(() => getPortraitRotation(composer.id), [composer.id]);
  const shape = useMemo(() => getPortraitShape(composer.id), [composer.id]);
  const useClipPath = !!shape.clipPath;
  const glowRadius = pieceCount * 4 + 10;
  const baseShadow = `0 0 ${glowRadius}px ${eraColor}25, 0 2px 8px rgba(0,0,0,0.3)`;

  const portraitBorder = useClipPath
    ? 'none'
    : showDelete ? '2px solid #ef4444' : `2px solid ${eraColor}70`;
  const portraitShadow = useClipPath
    ? 'none'
    : showDelete
      ? `0 0 16px rgba(239,68,68,0.35), 0 2px 8px rgba(0,0,0,0.3)`
      : baseShadow;
  const portraitFilter = useClipPath
    ? showDelete
      ? 'drop-shadow(0 0 3px rgba(239,68,68,0.6)) drop-shadow(0 0 8px rgba(239,68,68,0.25))'
      : `drop-shadow(0 0 2px ${eraColor}80) drop-shadow(0 0 ${Math.max(glowRadius / 3, 5)}px ${eraColor}35) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
    : undefined;

  const updatePopoverPos = useCallback(() => {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
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

  const handleDelete = useCallback(() => {
    onDelete?.(composer.id);
    setShowDelete(false);
  }, [composer.id, onDelete]);

  const dismiss = useCallback(() => {
    setShowDelete(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 180, damping: 18 }}
      className={`absolute flex items-center gap-2.5 ${side === "left" ? "flex-row-reverse right-[55%]" : "flex-row left-[55%]"}`}
    >
      <div className="relative">
        <Link
          href={`/composer/${composer.id}`}
          className="block"
          onClick={(e) => {
            if (didLongPress.current || showDelete) e.preventDefault();
          }}
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            ref={bubbleRef}
            whileTap={{ scale: 0.9 }}
            className="overflow-hidden flex items-center justify-center cursor-pointer"
            style={{
              width: size,
              height: size,
              rotate: rotation,
              clipPath: shape.clipPath,
              borderRadius: shape.borderRadius || '0',
              border: portraitBorder,
              boxShadow: portraitShadow,
              filter: portraitFilter,
              background: `radial-gradient(circle at 35% 35%, ${eraColor}30, ${eraColor}10)`,
              transition: "border-color 0.2s, box-shadow 0.2s, filter 0.2s",
            }}
          >
            {localImage && !imgError ? (
              <img
                src={localImage}
                alt={composer.name}
                width={size}
                height={size}
                className="w-full h-full object-cover"
                style={{ opacity: showDelete ? 0.5 : 1, transition: "opacity 0.2s" }}
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <span
                className="font-display text-lg"
                style={{ color: eraColor }}
              >
                {composer.name.charAt(0)}
              </span>
            )}
          </motion.div>
        </Link>

        {shape.index === 1 && !showDelete && (
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rotate-45 rounded-[1px] pointer-events-none"
            style={{ backgroundColor: eraColor, opacity: 0.55 }}
          />
        )}
        {shape.index === 5 && !showDelete && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ backgroundColor: eraColor, opacity: 0.45 }}
          />
        )}

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
                        Remove {lastName}?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDelete}
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
      </div>

      <Link
        href={`/composer/${composer.id}`}
        className={`flex flex-col ${side === "left" ? "items-end" : "items-start"}`}
        onClick={(e) => {
          if (showDelete) {
            e.preventDefault();
            dismiss();
          }
        }}
      >
        <span
          className={`text-[11px] font-body font-medium whitespace-nowrap ${side === "left" ? "text-right" : "text-left"}`}
          style={{ color: `${eraColor}cc` }}
        >
          {lastName}
        </span>
        {lastNamePronunciation && (
          <span
            className={`text-[9px] font-body whitespace-nowrap italic ${side === "left" ? "text-right" : "text-left"}`}
            style={{ color: `${eraColor}80` }}
          >
            {lastNamePronunciation}
          </span>
        )}
      </Link>
    </motion.div>
  );
}
