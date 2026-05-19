"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MusicPiece, YouTubeVideo, SheetMusic, ERA_CONFIG, MusicEra, PracticeSession } from "@/types";
import { getPieceById, toggleFavorite } from "@/lib/store";
import { getSessionsByPiece, removeSession } from "@/lib/practice-store";
import { deleteVideo } from "@/lib/practice-db";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import SheetMusicLink from "@/components/SheetMusicLink";
import PracticeSessionCard from "@/components/PracticeSessionCard";

const SECTIONS = ["Sheet Music", "Performances", "Practice"] as const;
type SectionId = typeof SECTIONS[number];

export default function PieceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [piece, setPiece] = useState<MusicPiece | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [sheets, setSheets] = useState<SheetMusic[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingSheets, setLoadingSheets] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId>("Sheet Music");
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    "Sheet Music": null,
    "Performances": null,
    "Practice": null,
  });
  const navRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((section: SectionId) => {
    const el = sectionRefs.current[section];
    if (!el) return;
    const navHeight = navRef.current?.offsetHeight || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navHeight = navRef.current?.offsetHeight || 0;
      const offset = navHeight + 24;
      let current: SectionId = "Sheet Music";
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const id = params.id as string;
    const found = getPieceById(id);
    if (found) {
      setPiece(found);
      setIsFav(found.isFavorite);
      fetchVideos(found);
      fetchSheets(found);
      setPracticeSessions(getSessionsByPiece(id));
    }
  }, [params.id]);

  async function fetchVideos(p: MusicPiece) {
    try {
      const q = `${p.title} ${p.composerName} classical performance`;
      const res = await fetch(
        `/api/youtube?q=${encodeURIComponent(q)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch {
      /* fail silently */
    } finally {
      setLoadingVideos(false);
    }
  }

  async function fetchSheets(p: MusicPiece) {
    try {
      const q = `${p.title} ${p.composerName}`;
      const res = await fetch(
        `/api/sheets?q=${encodeURIComponent(q)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSheets(data.sheets || []);
      }
    } catch {
      /* fail silently */
    } finally {
      setLoadingSheets(false);
    }
  }

  function handleFavorite() {
    if (!piece) return;
    const newFav = toggleFavorite(piece.id);
    setIsFav(newFav);
    window.dispatchEvent(new Event("collection-updated"));
  }

  async function handleDeleteSession(id: string) {
    try { await deleteVideo(id); } catch { /* blob may be missing */ }
    removeSession(id);
    setPracticeSessions((prev) => prev.filter((s) => s.id !== id));
  }

  if (!piece) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-sm font-body text-text-secondary">
          Piece not found
        </p>
      </div>
    );
  }

  const eraColor = ERA_CONFIG[piece.era as MusicEra]?.color || "#c5c960";

  return (
    <div className="min-h-dvh pb-24">
      {/* Sticky header block */}
      <div ref={navRef} className="sticky top-0 z-30 bg-bg-primary">
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-bg-primary to-transparent translate-y-full pointer-events-none" />

        {/* Breadcrumb */}
        <div className="px-5 pt-12 pb-2 flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-card shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e8e4d4"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-body text-text-secondary min-w-0">
            <button
              onClick={() => router.push("/")}
              className="hover:text-text-primary transition-colors shrink-0"
            >
              Collection
            </button>
            <span className="opacity-40 shrink-0">/</span>
            <button
              onClick={() => router.push(`/composer/${piece.composerId}`)}
              className="hover:text-text-primary transition-colors truncate max-w-[100px]"
            >
              {piece.composerName}
            </button>
            <span className="opacity-40 shrink-0">/</span>
            <span className="text-text-primary truncate max-w-[100px]">
              Piece
            </span>
          </div>
        </div>

        {/* Title + favorite */}
        <header className="px-5 pb-3 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl italic font-light text-text-primary leading-tight">
              {piece.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <button
                onClick={() => router.push(`/composer/${piece.composerId}`)}
                className="text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
              >
                {piece.composerName}
              </button>
              {piece.era && (
                <>
                  <span className="text-text-secondary opacity-30 text-xs">·</span>
                  <span
                    className="text-[10px] font-body font-medium tracking-widest uppercase px-2 py-px rounded-full"
                    style={{
                      color: eraColor,
                      background: `${eraColor}15`,
                      border: `1px solid ${eraColor}30`,
                    }}
                  >
                    {ERA_CONFIG[piece.era as MusicEra]?.label}
                  </span>
                </>
              )}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleFavorite}
            className="w-10 h-10 rounded-full flex items-center justify-center glass-card shrink-0 mt-1"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFav ? eraColor : "none"}
              stroke={isFav ? eraColor : "#9a9e80"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.button>
        </header>

        {/* Section nav */}
        <div className="px-5 flex items-center gap-4 pb-3">
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="relative pb-1.5 text-[12px] font-body font-medium tracking-wide transition-colors"
              style={{
                color: activeSection === section ? "#e8e4d4" : "#9a9e8060",
              }}
            >
              {section}
              {activeSection === section && (
                <motion.div
                  layoutId="section-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                  style={{ background: eraColor }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-8">
        {/* Sheet Music Section */}
        <section ref={(el) => { sectionRefs.current["Sheet Music"] = el; }}>
          <h2 className="font-display text-lg text-text-primary mb-3">
            Sheet Music
          </h2>
          {loadingSheets ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="glass-card p-4 h-16 animate-pulse" />
              ))}
            </div>
          ) : sheets.length > 0 ? (
            <div className="space-y-3">
              {sheets.map((sheet, i) => (
                <SheetMusicLink key={i} sheet={sheet} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-body text-text-secondary">
                No sheet music found yet.
              </p>
              <a
                href={`https://imslp.org/wiki/Special:Search?search=${encodeURIComponent(piece.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-body mt-2 inline-block"
                style={{ color: "#a8d8c8" }}
              >
                Search IMSLP directly →
              </a>
            </div>
          )}
        </section>

        {/* YouTube Videos Section */}
        <section ref={(el) => { sectionRefs.current["Performances"] = el; }}>
          <h2 className="font-display text-lg text-text-primary mb-3">
            Performances
          </h2>
          {loadingVideos ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="glass-card h-[82px] animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-2">
              {videos.map((video, i) => (
                <YouTubeVideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-body text-text-secondary">
                No performances found yet.
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(piece.title + " " + piece.composerName + " classical")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-body mt-2 inline-block"
                style={{ color: "#a8d8c8" }}
              >
                Search YouTube directly →
              </a>
            </div>
          )}
        </section>

        {/* Practice Section */}
        <section ref={(el) => { sectionRefs.current["Practice"] = el; }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-text-primary">
              Practice
            </h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/practice?pieceId=${piece.id}`)}
              className="h-8 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-body font-medium"
              style={{
                background: `${eraColor}15`,
                color: eraColor,
                border: `1px solid ${eraColor}30`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={eraColor} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Record
            </motion.button>
          </div>
          {practiceSessions.length > 0 ? (
            <div className="space-y-2">
              {practiceSessions.map((session, i) => (
                <PracticeSessionCard
                  key={session.id}
                  session={session}
                  index={i}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-body text-text-secondary">
                No practice sessions yet.
              </p>
              <p className="text-xs font-body text-text-secondary/60 mt-1">
                Record yourself practicing this piece to track your progress.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
