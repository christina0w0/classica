"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MusicPiece, PracticeSession, SheetMusic } from "@/types";
import { getAllPieces } from "@/lib/store";
import {
  getAllSessions,
  addSession,
  removeSession,
} from "@/lib/practice-store";
import {
  saveVideo,
  deleteVideo,
  getStorageEstimate,
} from "@/lib/practice-db";
import VideoRecorder from "@/components/VideoRecorder";
import PracticeSessionCard from "@/components/PracticeSessionCard";
import SheetMusicLink from "@/components/SheetMusicLink";
import { syncToNotion } from "@/lib/notion-sync";

type View = "journal" | "select-piece" | "sheet-music" | "recording" | "reflection";

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  );
}

function PracticePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPieceId = searchParams.get("pieceId");

  const [view, setView] = useState<View>("journal");
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<MusicPiece | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingThumbnail, setPendingThumbnail] = useState("");
  const [pendingDuration, setPendingDuration] = useState(0);
  const [journal, setJournal] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [needsWork, setNeedsWork] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notionSyncing, setNotionSyncing] = useState(false);
  const [notionSyncResult, setNotionSyncResult] = useState<"success" | "error" | null>(null);
  const savedSessionRef = useRef<PracticeSession | null>(null);
  const [storageInfo, setStorageInfo] = useState<string | null>(null);
  const [pieceSearch, setPieceSearch] = useState("");
  const [showPiecePicker, setShowPiecePicker] = useState(false);
  const [pieceSheets, setPieceSheets] = useState<SheetMusic[]>([]);
  const [loadingPieceSheets, setLoadingPieceSheets] = useState(false);
  const didAutoStart = useRef(false);

  type SortField = "date" | "piece" | "duration";
  type SortDir = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterPieceId, setFilterPieceId] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const loadSessions = useCallback(() => {
    setSessions(getAllSessions());
  }, []);

  const loadPieces = useCallback(() => {
    setPieces(getAllPieces());
  }, []);

  useEffect(() => {
    loadSessions();
    loadPieces();

    getStorageEstimate().then((est) => {
      if (est && est.quota > 0) {
        const usedMB = (est.used / (1024 * 1024)).toFixed(0);
        const quotaMB = (est.quota / (1024 * 1024)).toFixed(0);
        setStorageInfo(`${usedMB} MB / ${quotaMB} MB`);
      }
    });

    const onUpdate = () => loadSessions();
    window.addEventListener("practice-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("practice-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [loadSessions, loadPieces]);

  const fetchSheetsForPiece = useCallback((piece: MusicPiece) => {
    setPieceSheets([]);
    setLoadingPieceSheets(true);
    fetch(`/api/sheets?q=${encodeURIComponent(`${piece.title} ${piece.composerName}`)}`)
      .then((res) => (res.ok ? res.json() : { sheets: [] }))
      .then((data) => setPieceSheets(data.sheets || []))
      .catch(() => {})
      .finally(() => setLoadingPieceSheets(false));
  }, []);

  // Auto-start recording flow once if pieceId is provided via URL
  useEffect(() => {
    if (didAutoStart.current) return;
    if (preselectedPieceId && pieces.length > 0) {
      const piece = pieces.find((p) => p.id === preselectedPieceId);
      if (piece) {
        didAutoStart.current = true;
        setSelectedPiece(piece);
        setView("sheet-music");
        fetchSheetsForPiece(piece);
      }
    }
  }, [preselectedPieceId, pieces, fetchSheetsForPiece]);

  const startRecordFlow = useCallback(() => {
    if (pieces.length === 1) {
      setSelectedPiece(pieces[0]);
      setView("sheet-music");
      fetchSheetsForPiece(pieces[0]);
    } else {
      setView("select-piece");
    }
  }, [pieces, fetchSheetsForPiece]);

  const handlePieceSelect = useCallback((piece: MusicPiece) => {
    setSelectedPiece(piece);
    setView("sheet-music");
    fetchSheetsForPiece(piece);
  }, [fetchSheetsForPiece]);

  const startRecording = useCallback(() => {
    setView("recording");
  }, []);

  const handleRecordingComplete = useCallback(
    (blob: Blob, thumbnailDataUrl: string, duration: number) => {
      setPendingBlob(blob);
      setPendingThumbnail(thumbnailDataUrl);
      setPendingDuration(duration);
      setJournal("");
      setWhatWentWell("");
      setNeedsWork("");
      setNextFocus("");
      setView("reflection");
    },
    [],
  );

  const persistSession = useCallback(async () => {
    if (!pendingBlob || !selectedPiece) return;

    const sessionId = `practice-${Date.now()}`;
    await saveVideo(sessionId, pendingBlob);

    const session: PracticeSession = {
      id: sessionId,
      pieceId: selectedPiece.id,
      pieceName: selectedPiece.title,
      composerName: selectedPiece.composerName,
      date: new Date().toISOString(),
      duration: pendingDuration,
      notes: journal.trim() || undefined,
      reflection: {
        journal: journal.trim() || undefined,
        whatWentWell: whatWentWell.trim() || undefined,
        needsWork: needsWork.trim() || undefined,
        nextFocus: nextFocus.trim() || undefined,
      },
      thumbnailDataUrl: pendingThumbnail || undefined,
    };
    addSession(session);
    loadSessions();

    return { sessionId, session };
  }, [
    journal,
    loadSessions,
    needsWork,
    nextFocus,
    pendingBlob,
    pendingDuration,
    pendingThumbnail,
    selectedPiece,
    whatWentWell,
  ]);

  const resetAfterSave = useCallback(() => {
    setPendingBlob(null);
    setPendingThumbnail("");
    setPendingDuration(0);
    setSelectedPiece(null);
    setPieceSheets([]);
    setShowPiecePicker(false);
    setJournal("");
    setWhatWentWell("");
    setNeedsWork("");
    setNextFocus("");
    setView("journal");
    if (preselectedPieceId) router.replace("/practice");
  }, [preselectedPieceId, router]);
  const handleSave = async () => {
    if (!pendingBlob || !selectedPiece) return;
    setSaving(true);
    try {
      const persisted = await persistSession();
      if (!persisted) return;
      savedSessionRef.current = persisted.session;
      setSaved(true);
    } catch {
      // storage error -- fall through
    } finally {
      setSaving(false);
    }
  };

  const handleNotionSync = async () => {
    const session = savedSessionRef.current;
    if (!session || notionSyncing) return;
    setNotionSyncing(true);
    setNotionSyncResult(null);
    try {
      await syncToNotion(session);
      setNotionSyncResult("success");
    } catch {
      setNotionSyncResult("error");
    } finally {
      setNotionSyncing(false);
    }
  };

  const handleDone = () => {
    setSaved(false);
    setNotionSyncing(false);
    setNotionSyncResult(null);
    savedSessionRef.current = null;
    resetAfterSave();
  };

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteVideo(id);
      } catch {
        // blob may already be missing
      }
      removeSession(id);
      loadSessions();
    },
    [loadSessions],
  );

  const handleCancel = useCallback(() => {
    setPendingBlob(null);
    setPendingThumbnail("");
    setPendingDuration(0);
    setSelectedPiece(null);
    setPieceSheets([]);
    setShowPiecePicker(false);
    setJournal("");
    setWhatWentWell("");
    setNeedsWork("");
    setNextFocus("");
    setView("journal");
    if (preselectedPieceId) router.replace("/practice");
  }, [preselectedPieceId, router]);

  const sortedFilteredSessions = useMemo(() => {
    const list = filterPieceId
      ? sessions.filter((s) => s.pieceId === filterPieceId)
      : [...sessions];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "piece") {
        cmp = a.pieceName.localeCompare(b.pieceName);
      } else if (sortField === "duration") {
        cmp = a.duration - b.duration;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [sessions, sortField, sortDir, filterPieceId]);

  const groupedSessions = useMemo(() => {
    const groups: { label: string; sessions: PracticeSession[] }[] = [];
    const now = new Date();

    const groupKey = (session: PracticeSession): string => {
      if (sortField === "piece") return session.pieceName;
      if (sortField === "duration") {
        if (session.duration < 60) return "Under 1 min";
        if (session.duration < 300) return "1 - 5 min";
        if (session.duration < 900) return "5 - 15 min";
        if (session.duration < 1800) return "15 - 30 min";
        return "30+ min";
      }
      const d = new Date(session.date);
      const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return "This Week";
      if (diffDays < 30) return "This Month";
      return d.toLocaleDateString(undefined, {
        month: "long",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    };

    for (const session of sortedFilteredSessions) {
      const label = groupKey(session);
      const existing = groups.find((g) => g.label === label);
      if (existing) {
        existing.sessions.push(session);
      } else {
        groups.push({ label, sessions: [session] });
      }
    }
    return groups;
  }, [sortedFilteredSessions, sortField]);

  const filterPieceName = useMemo(() => {
    if (!filterPieceId) return null;
    const s = sessions.find((s) => s.pieceId === filterPieceId);
    return s?.pieceName ?? null;
  }, [filterPieceId, sessions]);

  const uniquePieces = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of sessions) {
      if (!seen.has(s.pieceId)) seen.set(s.pieceId, s.pieceName);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const filteredPieces = useMemo(() => {
    if (!pieceSearch.trim()) return pieces;
    const q = pieceSearch.toLowerCase();
    return pieces.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.composerName.toLowerCase().includes(q),
    );
  }, [pieces, pieceSearch]);

  // Count sessions per piece for display in selector
  const pieceSessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.pieceId] = (counts[s.pieceId] || 0) + 1;
    }
    return counts;
  }, [sessions]);


  return (
    <div className="relative min-h-dvh flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl italic font-light text-text-primary">
            {view === "journal" && "Practice Journal"}
            {view === "select-piece" && "Select Piece"}
            {view === "sheet-music" && "Sheet Music"}
            {view === "recording" && "Record Practice"}
            {view === "reflection" && "Reflect on Today"}
          </h1>
          {view === "journal" && storageInfo && (
            <p className="text-[10px] font-body text-text-secondary/50 mt-0.5">
              {storageInfo} used
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel — all non-journal views except recording */}
          {(view === "select-piece" || view === "sheet-music" || view === "reflection") && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
              className="h-9 px-4 rounded-full flex items-center gap-1.5 glass-card font-body text-xs font-medium text-text-secondary"
            >
              Cancel
            </motion.button>
          )}

          {/* Active filter pill — journal view with filter active */}
          {view === "journal" && sessions.length > 0 && filterPieceName && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterPieceId(null)}
              className="h-8 px-2.5 rounded-lg flex items-center gap-1 text-[10px] font-body font-medium truncate max-w-[120px]"
              style={{
                background: "rgba(197, 201, 96, 0.1)",
                color: "#c5c960",
                border: "1px solid rgba(197, 201, 96, 0.2)",
              }}
            >
              <span className="truncate">{filterPieceName}</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="shrink-0">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          )}

          {/* Sort button — journal view with sessions */}
          {view === "journal" && sessions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-body font-medium text-text-secondary glass-card"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M6 12h12M9 18h6" />
                </svg>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  className="opacity-50"
                >
                  {sortDir === "desc"
                    ? <path d="M12 5v14M5 12l7 7 7-7" />
                    : <path d="M12 19V5M5 12l7-7 7 7" />
                  }
                </svg>
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/40"
                      onClick={() => setShowSortMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1.5 z-50 rounded-xl p-1.5 min-w-[160px] border border-[var(--border-subtle)] max-h-[60vh] overflow-y-auto"
                      style={{
                        background: "var(--bg-card-solid)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                    >
                      <p className="text-[9px] font-body font-medium text-text-secondary/40 uppercase tracking-widest px-2 pt-1 pb-1.5">
                        Sort by
                      </p>
                      {([
                        { field: "date" as SortField, label: "Date" },
                        { field: "piece" as SortField, label: "Piece" },
                        { field: "duration" as SortField, label: "Duration" },
                      ]).map(({ field, label }) => (
                        <button
                          key={field}
                          onClick={() => {
                            if (sortField === field) {
                              setSortDir(sortDir === "desc" ? "asc" : "desc");
                            } else {
                              setSortField(field);
                              setSortDir(field === "piece" ? "asc" : "desc");
                            }
                            setShowSortMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-body transition-colors hover:bg-white/5"
                          style={{
                            color: sortField === field ? "#c5c960" : undefined,
                          }}
                        >
                          <span>{label}</span>
                          {sortField === field && (
                            <svg
                              width="12" height="12" viewBox="0 0 24 24" fill="none"
                              stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round"
                            >
                              {sortDir === "desc"
                                ? <path d="M12 5v14M5 12l7 7 7-7" />
                                : <path d="M12 19V5M5 12l7-7 7 7" />
                              }
                            </svg>
                          )}
                        </button>
                      ))}

                      {uniquePieces.length > 1 && (
                        <>
                          <div className="h-px bg-white/5 my-1.5" />
                          <p className="text-[9px] font-body font-medium text-text-secondary/40 uppercase tracking-widest px-2 pt-1 pb-1.5">
                            Filter by piece
                          </p>
                          <button
                            onClick={() => {
                              setFilterPieceId(null);
                              setShowSortMenu(false);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-body transition-colors hover:bg-white/5"
                            style={{
                              color: !filterPieceId ? "#c5c960" : undefined,
                            }}
                          >
                            <span>All pieces</span>
                            {!filterPieceId && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          {uniquePieces.map(({ id, name }) => (
                            <button
                              key={id}
                              onClick={() => {
                                setFilterPieceId(id);
                                setShowSortMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-body transition-colors hover:bg-white/5"
                              style={{
                                color: filterPieceId === id ? "#c5c960" : undefined,
                              }}
                            >
                              <span className="truncate mr-2">{name}</span>
                              {filterPieceId === id && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Add entry — only when sessions exist; empty state has its own centered CTA */}
          {view === "journal" && sessions.length > 0 && (
            <button
              onClick={startRecordFlow}
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
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {/* JOURNAL VIEW */}
          {view === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 gap-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-accent/5 border border-accent/10">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b6e58"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2 8h20" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-body text-text-primary mb-1">
                      No practice sessions yet
                    </p>
                    <p className="text-xs font-body text-text-secondary max-w-[240px]">
                      Record your first video practice session to start tracking your progress.
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecordFlow}
                    className="h-11 px-6 rounded-full flex items-center gap-2 font-body text-sm font-medium"
                    style={{
                      background:
                        "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                      color: "#1a1f0e",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1a1f0e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Add Journal Entry
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedFilteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                      <p className="text-xs font-body text-text-secondary">
                        No sessions match this filter.
                      </p>
                      <button
                        onClick={() => setFilterPieceId(null)}
                        className="text-xs font-body font-medium"
                        style={{ color: "#c5c960" }}
                      >
                        Clear filter
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {groupedSessions.map((group) => (
                        <div key={group.label}>
                          <p className="text-[11px] font-body font-medium text-text-secondary/60 uppercase tracking-widest mb-2 px-1">
                            {group.label}
                          </p>
                          <div className="space-y-2">
                            {group.sessions.map((session, i) => (
                              <PracticeSessionCard
                                key={session.id}
                                session={session}
                                index={i}
                                onDelete={handleDelete}
                                onSessionUpdate={loadSessions}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* SELECT PIECE VIEW */}
          {view === "select-piece" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {pieces.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center">
                  <p className="text-sm font-body text-text-primary">No pieces in your collection</p>
                  <p className="text-xs font-body text-text-secondary max-w-[220px]">Add pieces to your collection first before recording a practice session.</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setView("journal"); router.push("/"); }}
                    className="h-10 px-5 rounded-full font-body text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)", color: "#1a1f0e" }}
                  >
                    Go to Collection
                  </motion.button>
                </div>
              ) : null}

              {/* Search + list */}
              {pieces.length > 0 && (<div><div className="mb-4">
                <div className="glass-card flex items-center gap-2 px-3 py-2.5 rounded-xl">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b6e58"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={pieceSearch}
                    onChange={(e) => setPieceSearch(e.target.value)}
                    placeholder="Search your pieces..."
                    className="flex-1 bg-transparent text-sm font-body text-text-primary placeholder:text-text-secondary/40 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                {filteredPieces.map((piece, i) => (
                  <motion.button
                    key={piece.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePieceSelect(piece)}
                    className="w-full glass-card p-3 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-medium text-text-primary truncate">
                        {piece.title}
                      </p>
                      <p className="text-[11px] font-body text-text-secondary truncate">
                        {piece.composerName}
                      </p>
                    </div>
                    {pieceSessionCounts[piece.id] && (
                      <span className="text-[10px] font-body text-text-secondary/50 px-2 py-0.5 rounded-full bg-white/5">
                        {pieceSessionCounts[piece.id]} session
                        {pieceSessionCounts[piece.id] > 1 ? "s" : ""}
                      </span>
                    )}
                    <svg
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
                    </svg>
                  </motion.button>
                ))}

                {filteredPieces.length === 0 && pieceSearch && (
                  <p className="text-center text-xs font-body text-text-secondary py-8">
                    No pieces found matching &ldquo;{pieceSearch}&rdquo;
                  </p>
                )}
              </div></div>)}
            </motion.div>
          )}

          {/* SHEET MUSIC VIEW */}
          {view === "sheet-music" && selectedPiece && (
            <motion.div
              key="sheet-music"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Piece selector — inline */}
              <AnimatePresence mode="wait">
                {!showPiecePicker ? (
                  <motion.button
                    key="piece-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowPiecePicker(true); setPieceSearch(""); }}
                    className="w-full glass-card p-4 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-body font-medium text-text-primary truncate">
                        {selectedPiece.title}
                      </p>
                      <p className="text-xs font-body text-text-secondary mt-0.5 truncate">
                        {selectedPiece.composerName}
                      </p>
                    </div>
                    <span className="text-[10px] font-body text-text-secondary/50 shrink-0">Change</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="piece-picker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    {/* Search row */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" x2="16.65" y1="21" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        value={pieceSearch}
                        onChange={(e) => setPieceSearch(e.target.value)}
                        placeholder="Search pieces…"
                        autoFocus
                        className="flex-1 bg-transparent text-sm font-body text-text-primary placeholder:text-text-secondary/40 outline-none"
                      />
                      <button
                        onClick={() => { setShowPiecePicker(false); setPieceSearch(""); }}
                        className="text-[11px] font-body text-text-secondary/60"
                      >
                        Done
                      </button>
                    </div>
                    {/* No results */}
                    {filteredPieces.length === 0 && (
                      <p className="px-4 py-4 text-xs font-body text-text-secondary/50 text-center">
                        No pieces found matching &ldquo;{pieceSearch}&rdquo;
                      </p>
                    )}
                    {/* Piece rows — flat, no nested cards */}
                    {filteredPieces.map((piece, i) => (
                      <button
                        key={piece.id}
                        onClick={() => {
                          setSelectedPiece(piece);
                          setShowPiecePicker(false);
                          setPieceSearch("");
                          fetchSheetsForPiece(piece);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : undefined}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium text-text-primary truncate">
                            {piece.title}
                          </p>
                          <p className="text-[11px] font-body text-text-secondary truncate">
                            {piece.composerName}
                          </p>
                        </div>
                        {piece.id === selectedPiece.id && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sheet music */}
              <div>
                <p className="text-[10px] font-body font-medium text-text-secondary/50 uppercase tracking-widest px-1 mb-2">
                  Sheet Music
                </p>
                {loadingPieceSheets ? (
                  <div className="flex items-center gap-2.5 px-1 py-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3.5 h-3.5 rounded-full border border-[#a8d8c8]/30 border-t-[#a8d8c8] shrink-0"
                    />
                    <p className="text-xs font-body text-text-secondary/60">
                      Loading sheet music…
                    </p>
                  </div>
                ) : pieceSheets.length > 0 ? (
                  <div className="space-y-2">
                    {pieceSheets.slice(0, 3).map((sheet, i) => (
                      <SheetMusicLink key={i} sheet={sheet} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-body text-text-secondary/50 px-1 py-3">
                    No sheet music found.
                  </p>
                )}
              </div>

              {/* Start recording CTA */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-full h-12 rounded-full flex items-center justify-center gap-2 font-body text-sm font-medium mt-2"
                style={{
                  background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                  color: "#1a1f0e",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1f0e" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Start Recording
              </motion.button>
            </motion.div>
          )}

          {/* RECORDING VIEW */}
          {view === "recording" && selectedPiece && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-text-primary truncate">
                    {selectedPiece.title}
                  </p>
                  <p className="text-[11px] font-body text-text-secondary truncate">
                    {selectedPiece.composerName}
                  </p>
                </div>
              </div>
              <VideoRecorder
                onRecordingComplete={handleRecordingComplete}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {/* REFLECTION VIEW */}
          {view === "reflection" && selectedPiece && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="glass-card p-3 flex items-center gap-3">
                {pendingThumbnail && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={pendingThumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-text-primary truncate">
                    {selectedPiece.title}
                  </p>
                  <p className="text-[11px] font-body text-text-secondary">
                    {Math.floor(pendingDuration / 60)}:{(pendingDuration % 60).toString().padStart(2, "0")} recorded
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-body text-text-secondary mb-1.5 block">
                  What went well?
                </label>
                <input
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="Tone, posture, consistency, musicality..."
                  className="w-full glass-card rounded-xl p-3 text-sm font-body text-text-primary placeholder:text-text-secondary/40 bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-body text-text-secondary mb-1.5 block">
                  What needs work?
                </label>
                <input
                  value={needsWork}
                  onChange={(e) => setNeedsWork(e.target.value)}
                  placeholder="Intonation, rhythm, fingering, memory..."
                  className="w-full glass-card rounded-xl p-3 text-sm font-body text-text-primary placeholder:text-text-secondary/40 bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-body text-text-secondary mb-1.5 block">
                  Focus for next practice
                </label>
                <input
                  value={nextFocus}
                  onChange={(e) => setNextFocus(e.target.value)}
                  placeholder="One clear goal for tomorrow..."
                  className="w-full glass-card rounded-xl p-3 text-sm font-body text-text-primary placeholder:text-text-secondary/40 bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-body text-text-secondary mb-1.5 block">
                  Journal notes
                </label>
                <textarea
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="Write reflections from today's session..."
                  rows={4}
                  className="w-full glass-card rounded-xl p-3 text-sm font-body text-text-primary placeholder:text-text-secondary/40 bg-transparent outline-none resize-none"
                />
              </div>

              <AnimatePresence mode="wait">
                {!saved ? (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="w-full h-11 rounded-full glass-card text-sm font-body font-medium text-text-secondary"
                    >
                      Discard
                    </motion.button>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-11 rounded-full text-sm font-body font-medium flex items-center justify-center gap-2"
                        style={{
                          background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                          color: "#1a1f0e",
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        {saving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 rounded-full border-2 border-[#1a1f0e]/30 border-t-[#1a1f0e]"
                          />
                        ) : (
                          "Save Practice"
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                          if (!pendingBlob || !selectedPiece) return;
                          setSaving(true);
                          try {
                            const persisted = await persistSession();
                            if (!persisted) return;
                            savedSessionRef.current = persisted.session;
                            setSaved(true);
                            setNotionSyncing(true);
                            try {
                              await syncToNotion(persisted.session);
                              setNotionSyncResult("success");
                            } catch {
                              setNotionSyncResult("error");
                            } finally {
                              setNotionSyncing(false);
                            }
                          } catch {
                            // storage error
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        title="Save & Sync to Notion"
                        className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(197, 201, 96, 0.15)",
                          border: "1px solid rgba(197, 201, 96, 0.3)",
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2">
                          <path d="M4 4h16v16H4z" />
                          <path d="M8 8h2v8H8z" />
                          <path d="M14 8l-2 8h2l2-8h-2z" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="space-y-3"
                  >
                    <div className="glass-card rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#c5c960]/20">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-sm font-body text-text-primary">Session saved</span>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="flex items-center gap-2.5">
                        {notionSyncing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 rounded-full border-2 border-[#c5c960]/20 border-t-[#c5c960] shrink-0"
                          />
                        ) : notionSyncResult === "success" ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#c5c960]/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c5c960" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        ) : notionSyncResult === "error" ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="2">
                              <path d="M4 4h16v16H4z" />
                              <path d="M8 8h2v8H8z" />
                              <path d="M14 8l-2 8h2l2-8h-2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-body text-text-primary">
                            {notionSyncing
                              ? "Syncing to Notion..."
                              : notionSyncResult === "success"
                                ? "Synced to Notion"
                                : notionSyncResult === "error"
                                  ? "Sync failed"
                                  : "Not synced to Notion"}
                          </span>
                        </div>
                        {!notionSyncing && notionSyncResult !== "success" && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNotionSync}
                            className="text-xs font-body font-medium px-3 py-1.5 rounded-full"
                            style={{
                              color: "#c5c960",
                              background: "rgba(197, 201, 96, 0.1)",
                              border: "1px solid rgba(197, 201, 96, 0.2)",
                            }}
                          >
                            {notionSyncResult === "error" ? "Retry" : "Sync"}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDone}
                      className="w-full h-11 rounded-full text-sm font-body font-medium"
                      style={{
                        background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                        color: "#1a1f0e",
                      }}
                    >
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
