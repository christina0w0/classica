"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PracticeSession } from "@/types";
import { getVideo } from "@/lib/practice-db";
import { getSessionById, updateSessionReflection } from "@/lib/practice-store";
import { syncToNotion } from "@/lib/notion-sync";

interface PracticeSessionCardProps {
  session: PracticeSession;
  index: number;
  onDelete: (id: string) => void;
  onSessionUpdate?: () => void;
  defaultExpanded?: boolean;
}

function hasReflectionContent(r?: PracticeSession["reflection"]): boolean {
  if (!r) return false;
  return !!(r.whatWentWell || r.needsWork || r.nextFocus || r.journal);
}

export default function PracticeSessionCard({
  session,
  index,
  onDelete,
  onSessionUpdate,
  defaultExpanded = false,
}: PracticeSessionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(session.notionSyncStatus);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [editingReflection, setEditingReflection] = useState(false);
  const [editWell, setEditWell] = useState("");
  const [editWork, setEditWork] = useState("");
  const [editFocus, setEditFocus] = useState("");
  const [editJournal, setEditJournal] = useState("");
  const [currentReflection, setCurrentReflection] = useState(session.reflection);

  const startEditReflection = useCallback(() => {
    const r = currentReflection;
    setEditWell(r?.whatWentWell ?? "");
    setEditWork(r?.needsWork ?? "");
    setEditFocus(r?.nextFocus ?? "");
    setEditJournal(r?.journal ?? "");
    setEditingReflection(true);
  }, [currentReflection]);

  const saveReflection = useCallback(() => {
    const reflection: PracticeSession["reflection"] = {
      whatWentWell: editWell.trim() || undefined,
      needsWork: editWork.trim() || undefined,
      nextFocus: editFocus.trim() || undefined,
      journal: editJournal.trim() || undefined,
    };
    updateSessionReflection(session.id, reflection);
    setCurrentReflection(reflection);
    setEditingReflection(false);
    onSessionUpdate?.();
  }, [session.id, editWell, editWork, editFocus, editJournal, onSessionUpdate]);

  const loadVideo = useCallback(async () => {
    if (videoUrl) return;
    setLoading(true);
    try {
      const blob = await getVideo(session.id);
      if (blob) {
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch {
      // video may have been deleted
    } finally {
      setLoading(false);
    }
  }, [session.id, videoUrl]);

  useEffect(() => {
    if (expanded) {
      loadVideo();
    }
  }, [expanded, loadVideo]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };


  const handleNotionSync = useCallback(async () => {
    setSyncing(true);
    setSyncStatus("pending");
    const fresh = getSessionById(session.id);
    const success = await syncToNotion(fresh ?? session);
    setSyncStatus(success ? "synced" : "error");
    setSyncing(false);
  }, [session]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/30 shrink-0 flex items-center justify-center">
          {session.thumbnailDataUrl ? (
            <img
              src={session.thumbnailDataUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-body font-medium text-text-primary truncate">
            {session.pieceName}
          </p>
          <p className="text-[11px] font-body text-text-secondary truncate">
            {session.composerName}
          </p>
        </div>

        {/* Meta */}
        <div className="text-right shrink-0">
          <p className="text-[11px] font-body text-text-secondary">
            {formatDate(session.date)}
          </p>
          <p className="text-[10px] font-body text-text-secondary/60 tabular-nums">
            {formatDuration(session.duration)}
          </p>
        </div>

        {/* Chevron */}
        <motion.svg
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b6e58"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0"
        >
          <polyline points="9 18 15 12 9 6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Video player */}
              <div className="rounded-xl overflow-hidden bg-black/30 aspect-[4/3]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent"
                    />
                  </div>
                ) : videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs font-body text-text-secondary">
                      Video not available
                    </p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-[11px] font-body text-text-secondary">
                <span>{formatTime(session.date)}</span>
                <span>{formatDuration(session.duration)} practice</span>
              </div>

              {/* Notes */}
              {session.notes && (
                <p className="text-xs font-body text-text-secondary/80 leading-relaxed">
                  {session.notes}
                </p>
              )}

              {/* Reflection */}
              <AnimatePresence mode="wait">
                {editingReflection ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] p-2.5">
                      <input
                        value={editWell}
                        onChange={(e) => setEditWell(e.target.value)}
                        placeholder="What went well?"
                        className="w-full bg-transparent text-[11px] font-body text-text-primary placeholder:text-text-secondary/40 outline-none rounded-lg px-2 py-1.5 border border-[var(--border-subtle)] focus:border-[#c5c960]/40 transition-colors"
                        autoFocus
                      />
                      <input
                        value={editWork}
                        onChange={(e) => setEditWork(e.target.value)}
                        placeholder="What needs work?"
                        className="w-full bg-transparent text-[11px] font-body text-text-primary placeholder:text-text-secondary/40 outline-none rounded-lg px-2 py-1.5 border border-[var(--border-subtle)] focus:border-[#c5c960]/40 transition-colors"
                      />
                      <input
                        value={editFocus}
                        onChange={(e) => setEditFocus(e.target.value)}
                        placeholder="Focus for next practice"
                        className="w-full bg-transparent text-[11px] font-body text-text-primary placeholder:text-text-secondary/40 outline-none rounded-lg px-2 py-1.5 border border-[var(--border-subtle)] focus:border-[#c5c960]/40 transition-colors"
                      />
                      <textarea
                        value={editJournal}
                        onChange={(e) => setEditJournal(e.target.value)}
                        placeholder="Journal notes..."
                        rows={2}
                        className="w-full bg-transparent text-[11px] font-body text-text-primary placeholder:text-text-secondary/40 outline-none rounded-lg px-2 py-1.5 border border-[var(--border-subtle)] focus:border-[#c5c960]/40 transition-colors resize-none"
                      />
                      <div className="flex gap-2 pt-0.5">
                        <button
                          onClick={() => setEditingReflection(false)}
                          className="text-[10px] font-body font-medium text-text-secondary px-3 py-1 rounded-full bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveReflection}
                          className="text-[10px] font-body font-medium px-3 py-1 rounded-full"
                          style={{
                            background: "rgba(197, 201, 96, 0.15)",
                            color: "#c5c960",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : hasReflectionContent(currentReflection) ? (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={startEditReflection}
                      className="w-full text-left space-y-1.5 rounded-xl border border-[var(--border-subtle)] p-2.5 group transition-colors hover:border-[#c5c960]/20"
                    >
                      {currentReflection?.whatWentWell && (
                        <p className="text-[11px] font-body text-text-secondary/90">
                          <span className="text-text-secondary/60">Went well:</span>{" "}
                          {currentReflection.whatWentWell}
                        </p>
                      )}
                      {currentReflection?.needsWork && (
                        <p className="text-[11px] font-body text-text-secondary/90">
                          <span className="text-text-secondary/60">Needs work:</span>{" "}
                          {currentReflection.needsWork}
                        </p>
                      )}
                      {currentReflection?.nextFocus && (
                        <p className="text-[11px] font-body text-text-secondary/90">
                          <span className="text-text-secondary/60">Next focus:</span>{" "}
                          {currentReflection.nextFocus}
                        </p>
                      )}
                      {currentReflection?.journal && (
                        <p className="text-[11px] font-body text-text-secondary/90">
                          <span className="text-text-secondary/60">Notes:</span>{" "}
                          {currentReflection.journal}
                        </p>
                      )}
                      <p className="text-[9px] font-body text-text-secondary/30 group-hover:text-[#c5c960]/50 transition-colors pt-0.5">
                        Tap to edit
                      </p>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={startEditReflection}
                      className="w-full rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-[#c5c960]/30 p-3 flex items-center justify-center gap-2 transition-colors group"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-[#c5c960] transition-colors">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span className="text-[11px] font-body text-text-secondary/60 group-hover:text-[#c5c960]/80 transition-colors">
                        Add reflection
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notion Sync */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  {syncStatus === "synced" ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : syncStatus === "error" ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  ) : syncStatus === "pending" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 rounded-full border-[1.5px] border-accent/30 border-t-accent"
                    />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="1.5">
                      <path d="M4 4h16v16H4z" />
                      <path d="M8 8h2v8H8z" />
                      <path d="M14 8l-2 8h2l2-8h-2z" />
                    </svg>
                  )}
                  <span className="text-[10px] font-body text-text-secondary">
                    {syncStatus === "synced"
                      ? "Synced to Notion"
                      : syncStatus === "error"
                        ? "Sync failed"
                        : syncStatus === "pending"
                          ? "Syncing..."
                          : "Notion"}
                  </span>
                </div>
                <button
                  onClick={handleNotionSync}
                  disabled={syncing}
                  className="text-[10px] font-body font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(197, 201, 96, 0.15)",
                    color: syncing ? "#6b6e58" : "#c5c960",
                  }}
                >
                  {syncing ? "Syncing..." : syncStatus === "synced" ? "Re-sync" : "Sync"}
                </button>
              </div>

              {/* Delete */}
              <div className="pt-1">
                <AnimatePresence mode="wait">
                  {!showDeleteConfirm ? (
                    <motion.button
                      key="delete-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-[11px] font-body text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      Delete session
                    </motion.button>
                  ) : (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[11px] font-body text-text-secondary">
                        Delete this recording?
                      </span>
                      <button
                        onClick={() => onDelete(session.id)}
                        className="text-[11px] font-body font-medium text-red-400 px-2 py-1 rounded-full bg-red-400/10"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-[11px] font-body text-text-secondary px-2 py-1"
                      >
                        No
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
