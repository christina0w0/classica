"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Composer, MusicPiece, ERA_CONFIG } from "@/types";
import { composers } from "@/lib/composers-seed";
import { addPiece, addCustomComposer, slugify } from "@/lib/store";

interface AddPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: () => void;
  preselectedComposer?: Composer | null;
}

export default function AddPieceModal({
  isOpen,
  onClose,
  onAdded,
  preselectedComposer,
}: AddPieceModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [composerQuery, setComposerQuery] = useState("");
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(
    preselectedComposer ?? null,
  );
  const [showComposerList, setShowComposerList] = useState(false);
  const [saved, setSaved] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setComposerQuery("");
      setSelectedComposer(preselectedComposer ?? null);
      setShowComposerList(false);
      setSaved(false);
      setTimeout(() => titleInputRef.current?.focus(), 350);
    }
  }, [isOpen, preselectedComposer]);

  const filteredComposers = useMemo(() => {
    if (!composerQuery.trim()) return composers.slice(0, 10);
    const q = composerQuery.toLowerCase();
    return composers.filter((c) => c.name.toLowerCase().includes(q));
  }, [composerQuery]);

  const canSubmit = title.trim().length > 0 && selectedComposer !== null;

  const handleSelectComposer = useCallback((c: Composer) => {
    setSelectedComposer(c);
    setComposerQuery(c.name);
    setShowComposerList(false);
  }, []);

  const handleCreateCustomComposer = useCallback(() => {
    if (!composerQuery.trim()) return;
    const id = slugify(composerQuery.trim());
    const custom: Composer = {
      id,
      name: composerQuery.trim(),
      era: "classical",
      birthYear: 1800,
    };
    addCustomComposer(custom);
    setSelectedComposer(custom);
    setShowComposerList(false);
  }, [composerQuery]);

  const handleSave = useCallback(() => {
    if (!canSubmit || !selectedComposer) return;

    const piece: MusicPiece = {
      id: `piece-${Date.now()}`,
      title: title.trim(),
      composerId: selectedComposer.id,
      composerName: selectedComposer.name,
      era: selectedComposer.era,
      identifiedDate: new Date().toISOString(),
      isFavorite: false,
    };

    addPiece(piece);
    setSaved(true);
    window.dispatchEvent(new Event("collection-updated"));

    setTimeout(() => {
      onAdded?.();
      onClose();
    }, 600);
  }, [canSubmit, selectedComposer, title, onAdded, onClose]);

  const eraColor = selectedComposer
    ? ERA_CONFIG[selectedComposer.era].color
    : "#c5c960";

  const isLocked = !!preselectedComposer;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
          >
            <div
              className="rounded-t-2xl border border-border-subtle border-b-0 overflow-hidden"
              style={{ background: "var(--bg-card-solid)" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-text-secondary/30" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center justify-between">
                <h2 className="font-display text-xl italic text-text-primary">
                  Add Piece
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9a9e80"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="px-5 pb-6 space-y-4">
                {/* Title input */}
                <div>
                  <label className="text-xs font-body font-medium text-text-secondary tracking-wide uppercase block mb-1.5">
                    Piece Title
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='e.g. "The Four Seasons" or "Symphony No. 5"'
                    className="w-full h-12 px-4 rounded-xl text-sm font-body text-text-primary placeholder:text-text-secondary/50 outline-none transition-shadow"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-subtle)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 1px ${eraColor}40`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </div>

                {/* Composer selector */}
                <div className="relative">
                  <label className="text-xs font-body font-medium text-text-secondary tracking-wide uppercase block mb-1.5">
                    Composer
                  </label>
                  {isLocked && selectedComposer ? (
                    <div
                      className="w-full h-12 px-4 rounded-xl text-sm font-body text-text-primary flex items-center gap-3"
                      style={{
                        background: `${eraColor}10`,
                        border: `1px solid ${eraColor}25`,
                      }}
                    >
                      <span>{selectedComposer.name}</span>
                      <span
                        className="text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full ml-auto"
                        style={{
                          color: eraColor,
                          background: `${eraColor}15`,
                          border: `1px solid ${eraColor}30`,
                        }}
                      >
                        {ERA_CONFIG[selectedComposer.era].label}
                      </span>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={composerInputRef}
                        type="text"
                        value={composerQuery}
                        onChange={(e) => {
                          setComposerQuery(e.target.value);
                          setSelectedComposer(null);
                          setShowComposerList(true);
                        }}
                        onFocus={() => setShowComposerList(true)}
                        placeholder="Search composers..."
                        className="w-full h-12 px-4 rounded-xl text-sm font-body text-text-primary placeholder:text-text-secondary/50 outline-none transition-shadow"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-subtle)",
                        }}
                        onFocusCapture={(e) =>
                          (e.target.style.boxShadow = `0 0 0 1px ${eraColor}40`)
                        }
                        onBlurCapture={(e) => {
                          e.target.style.boxShadow = "none";
                          setTimeout(() => setShowComposerList(false), 200);
                        }}
                      />

                      {/* Era badge when composer selected */}
                      {selectedComposer && (
                        <span
                          className="absolute right-3 top-[38px] text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
                          style={{
                            color: eraColor,
                            background: `${eraColor}15`,
                            border: `1px solid ${eraColor}30`,
                          }}
                        >
                          {ERA_CONFIG[selectedComposer.era].label}
                        </span>
                      )}

                      {/* Composer dropdown */}
                      <AnimatePresence>
                        {showComposerList && !selectedComposer && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto"
                            style={{
                              background: "var(--bg-card-solid)",
                              border: "1px solid var(--border-subtle)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            }}
                          >
                            {filteredComposers.length > 0 ? (
                              filteredComposers.map((c) => {
                                const cColor = ERA_CONFIG[c.era].color;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectComposer(c)}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ background: cColor }}
                                    />
                                    <span className="text-sm font-body text-text-primary truncate flex-1">
                                      {c.name}
                                    </span>
                                    <span
                                      className="text-[9px] font-medium tracking-widest uppercase shrink-0"
                                      style={{ color: cColor }}
                                    >
                                      {ERA_CONFIG[c.era].label}
                                    </span>
                                  </button>
                                );
                              })
                            ) : composerQuery.trim() ? (
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleCreateCustomComposer}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#c5c960"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span className="text-sm font-body text-text-primary">
                                  Add &ldquo;{composerQuery.trim()}&rdquo;
                                </span>
                              </button>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>

                {/* Save button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!canSubmit || saved}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-body text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    background: saved
                      ? `${eraColor}20`
                      : canSubmit
                        ? "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)"
                        : "rgba(255,255,255,0.05)",
                    color: saved ? eraColor : canSubmit ? "#1a1f0e" : "#9a9e80",
                  }}
                >
                  {saved ? (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={eraColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added to Collection
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add to Collection
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border-subtle" />
                  <span className="text-[10px] font-body text-text-secondary tracking-widest uppercase">
                    or
                  </span>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>

                {/* Identify shortcut */}
                <button
                  onClick={() => {
                    onClose();
                    router.push("/listen");
                  }}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-body text-sm font-medium glass-card transition-colors hover:bg-white/5"
                  style={{ color: "#a8d8c8" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a8d8c8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                  Identify with Microphone
                </button>
              </div>

              {/* Safe area padding for iOS */}
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
