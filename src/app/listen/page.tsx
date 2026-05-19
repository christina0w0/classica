"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import WaveformAnimation from "@/components/WaveformAnimation";
import SheetMusicLink from "@/components/SheetMusicLink";
import YouTubeVideoCard from "@/components/YouTubeVideoCard";
import { RecognitionResult, MusicPiece, SheetMusic, YouTubeVideo } from "@/types";
import { addPiece, addCustomComposer, updateCustomComposer, slugify } from "@/lib/store";
import { composers } from "@/lib/composers-seed";
import { Composer } from "@/types";
import { getComposerImage } from "@/lib/composer-images";
import { yearToEra } from "@/lib/era-utils";
import { ERA_CONFIG } from "@/types";
import { getPortraitShape } from "@/lib/portrait-shapes";

type ListenState = "idle" | "listening" | "processing" | "found" | "error";

export default function ListenPage() {
  const router = useRouter();
  const [state, setState] = useState<ListenState>("idle");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedPieceId, setSavedPieceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordMimeRef = useRef<string>("audio/webm");

  const [createdComposer, setCreatedComposer] = useState<Composer | null>(null);
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");
  const [sheets, setSheets] = useState<SheetMusic[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const matchedComposer = useMemo(() => {
    if (!result) return null;
    return composers.find(
      (c) =>
        result.composerName &&
        c.name.toLowerCase().includes(result.composerName.toLowerCase()),
    ) ?? null;
  }, [result]);

  const resolvedComposer = matchedComposer || createdComposer;

  const composerImage = useMemo(() => {
    if (fetchedImageUrl) return fetchedImageUrl;
    if (!resolvedComposer) return undefined;
    return getComposerImage(resolvedComposer.id);
  }, [resolvedComposer, fetchedImageUrl]);

  const eraColor = result?.era ? ERA_CONFIG[result.era].color : "#c5c960";

  const listenShape = useMemo(() => {
    if (!resolvedComposer) return null;
    return getPortraitShape(resolvedComposer.id);
  }, [resolvedComposer]);
  const listenClip = !!listenShape?.clipPath;

  const composerLifespan = useMemo(() => {
    if (!resolvedComposer) return null;
    if (resolvedComposer.birthYear === 0) return null;
    return resolvedComposer.deathYear
      ? `${resolvedComposer.birthYear}–${resolvedComposer.deathYear}`
      : `b. ${resolvedComposer.birthYear}`;
  }, [resolvedComposer]);

  useEffect(() => {
    if (state !== "found" || !result) return;

    const query = `${result.pieceName || result.title} ${result.composerName || result.artist}`;

    setLoadingSheets(true);
    fetch(`/api/sheets?q=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : { sheets: [] }))
      .then((data) => setSheets((data.sheets || []).slice(0, 3)))
      .catch(() => setSheets([]))
      .finally(() => setLoadingSheets(false));

    setLoadingVideos(true);
    fetch(`/api/youtube?q=${encodeURIComponent(query + " classical performance")}`)
      .then((res) => (res.ok ? res.json() : { videos: [] }))
      .then((data) => setVideos((data.videos || []).slice(0, 3)))
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));

    const composerName = result.composerName || result.artist;
    if (!matchedComposer && composerName) {
      fetch(`/api/composer-image?name=${encodeURIComponent(composerName)}`)
        .then((res) => (res.ok ? res.json() : { imageUrl: "" }))
        .then((data) => {
          if (data.imageUrl) setFetchedImageUrl(data.imageUrl);
        })
        .catch(() => {});
    }

    const composerId = matchedComposer?.id;
    const bioUrl = composerId
      ? `/api/composer/${composerId}/bio`
      : composerName
        ? `/api/composer/unknown/bio?name=${encodeURIComponent(composerName)}`
        : null;
    if (bioUrl) {
      fetch(bioUrl)
        .then((res) => (res.ok ? res.json() : { bio: "" }))
        .then((data) => {
          if (data.bio) {
            const firstTwo = data.bio.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
            setBio(firstTwo);
          }
        })
        .catch(() => {});
    }
  }, [state, result, matchedComposer]);

  const startListening = useCallback(async () => {
    try {
      setState("listening");
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : undefined;
      const mediaRecorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      recordMimeRef.current = mediaRecorder.mimeType || "audio/webm";
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("processing");

        const blob = new Blob(chunksRef.current, { type: recordMimeRef.current });
        const ext =
          recordMimeRef.current.includes("mp4") || recordMimeRef.current.includes("m4a")
            ? "m4a"
            : "webm";
        try {
          const formData = new FormData();
          formData.append("audio", blob, `recording.${ext}`);

          const res = await fetch("/api/recognize", {
            method: "POST",
            body: formData,
          });

          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            title?: string;
          };

          if (!res.ok) {
            setErrorMsg(
              typeof data.error === "string"
                ? data.error
                : `Recognition failed (${res.status}).`,
            );
            setState("error");
            return;
          }

          if (data.error) {
            setErrorMsg(data.error);
            setState("error");
          } else {
            setResult(data as RecognitionResult);
            setState("found");
          }
        } catch (e) {
          const msg =
            e instanceof Error && e.message
              ? e.message
              : "Could not reach the server. Check your connection and try again.";
          setErrorMsg(msg);
          setState("error");
        }
      };

      mediaRecorder.start(1000);

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          // Helps some browsers flush the last buffered chunk.
          try {
            mediaRecorder.requestData();
          } catch {}
          mediaRecorder.stop();
        }
      }, 10000);
    } catch {
      setErrorMsg("Microphone access is required to identify music.");
      setState("error");
    }
  }, [state]);

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const savePiece = useCallback(() => {
    if (!result) return;

    const composerName = result.composerName || result.artist;
    const era = result.era || (matchedComposer ? matchedComposer.era : yearToEra(1800));
    let composerId = matchedComposer?.id || "unknown";

    if (!matchedComposer) {
      composerId = slugify(composerName);
      const newComposer: Composer = {
        id: composerId,
        name: composerName,
        era,
        birthYear: 0,
        imageUrl: fetchedImageUrl || undefined,
      };
      addCustomComposer(newComposer);
      setCreatedComposer(newComposer);

      if (!fetchedImageUrl) {
        fetch(`/api/composer-image?name=${encodeURIComponent(composerName)}`)
          .then((res) => (res.ok ? res.json() : { imageUrl: "" }))
          .then((data) => {
            if (data.imageUrl) {
              updateCustomComposer(composerId, { imageUrl: data.imageUrl });
              setFetchedImageUrl(data.imageUrl);
            }
          })
          .catch(() => {});
      }
    }

    const pieceId = `piece-${Date.now()}`;
    const piece: MusicPiece = {
      id: pieceId,
      title: result.pieceName || result.title,
      composerId,
      composerName,
      era,
      identifiedDate: new Date().toISOString(),
      isFavorite: false,
    };

    addPiece(piece);
    setSaved(true);
    setSavedPieceId(pieceId);
    window.dispatchEvent(new Event("collection-updated"));
  }, [result, matchedComposer]);

  const reset = () => {
    setState("idle");
    setResult(null);
    setSaved(false);
    setSavedPieceId(null);
    setCreatedComposer(null);
    setFetchedImageUrl(null);
    setErrorMsg("");
    setBio("");
    setSheets([]);
    setVideos([]);
    setLoadingSheets(false);
    setLoadingVideos(false);
  };

  return (
    <div className="relative min-h-dvh flex flex-col pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="font-display text-xl italic font-light text-text-primary">
          Identify
        </h1>
        {state === "found" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={reset}
            className="h-9 px-4 rounded-full flex items-center gap-1.5 glass-card font-body text-xs font-medium text-text-secondary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9e80" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            Listen Again
          </motion.button>
        )}
      </header>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-80 h-80 rounded-full"
            style={{
              background: `radial-gradient(circle, ${state === "listening" ? "rgba(197,201,96,0.12)" : "rgba(197,201,96,0.05)"} 0%, transparent 70%)`,
              transition: "background 0.5s ease",
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* Idle / Listening / Processing */}
          {(state === "idle" ||
            state === "listening" ||
            state === "processing") && (
            <motion.div
              key="waveform"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 z-10"
            >
              <WaveformAnimation
                isListening={state === "listening" || state === "processing"}
              />

              <p className="text-sm font-body text-text-secondary text-center">
                {state === "idle" && "Tap to identify classical music"}
                {state === "listening" && "Listening..."}
                {state === "processing" && "Identifying the piece..."}
              </p>

              {state === "idle" && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={startListening}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                    boxShadow: "0 4px 24px rgba(197,201,96,0.3)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a1f0e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </motion.button>
              )}

              {state === "listening" && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={stopListening}
                  className="w-16 h-16 rounded-full flex items-center justify-center glass-card border-accent/30"
                >
                  <div className="w-5 h-5 rounded-sm bg-accent" />
                </motion.button>
              )}

              {state === "processing" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent"
                />
              )}
            </motion.div>
          )}

          {/* Result found */}
          {state === "found" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full z-10 max-w-md mx-auto overflow-y-auto"
              style={{ maxHeight: "calc(100dvh - 120px)" }}
            >
              {/* Composer + Piece — single card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${eraColor}18 0%, transparent 70%)`,
                  }}
                />

                {/* Top row: portrait + composer/piece info */}
                <div className="flex gap-4 relative z-10">
                  <button
                    onClick={() => resolvedComposer && router.push(`/composer/${resolvedComposer.id}`)}
                    disabled={!resolvedComposer}
                    className="shrink-0 relative"
                  >
                    {!listenClip && (
                      <div
                        className="absolute -top-1 -right-1 w-2 h-2 rotate-45 rounded-[1px] pointer-events-none z-10"
                        style={{ backgroundColor: eraColor, opacity: 0.5 }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: -5 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                      className="w-16 h-16 overflow-hidden flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${eraColor}30, ${eraColor}10)`,
                        clipPath: listenShape?.clipPath,
                        borderRadius: listenShape?.borderRadius || '50%',
                        border: listenClip ? 'none' : `3px solid ${eraColor}50`,
                        boxShadow: listenClip ? 'none' : `0 0 0 3px ${eraColor}12, 0 0 0 6px ${eraColor}06, 0 0 30px ${eraColor}20`,
                        filter: listenClip
                          ? `drop-shadow(0 0 2px ${eraColor}80) drop-shadow(0 0 8px ${eraColor}30) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
                          : undefined,
                      }}
                    >
                      {composerImage ? (
                        <img
                          src={composerImage}
                          alt={result.composerName || result.artist}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="font-display text-xl italic"
                          style={{ color: eraColor }}
                        >
                          {(result.composerName || result.artist).charAt(0)}
                        </span>
                      )}
                    </motion.div>
                  </button>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <h2 className="font-display text-lg italic text-text-primary leading-snug line-clamp-2">
                      {result.pieceName || result.title}
                    </h2>
                    <button
                      onClick={() => resolvedComposer && router.push(`/composer/${resolvedComposer.id}`)}
                      disabled={!resolvedComposer}
                      className="text-sm font-body text-text-secondary mt-0.5 hover:underline text-left"
                    >
                      {result.composerName || result.artist}
                    </button>
                    <div className="flex items-center gap-2 mt-1.5">
                      {result.era && (
                        <span
                          className="text-[10px] font-body font-medium tracking-widest uppercase px-2 py-px rounded-full"
                          style={{
                            color: eraColor,
                            background: `${eraColor}15`,
                            border: `1px solid ${eraColor}30`,
                          }}
                        >
                          {ERA_CONFIG[result.era].label}
                        </span>
                      )}
                      {composerLifespan && (
                        <span className="text-[11px] font-body text-text-secondary">
                          {composerLifespan}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio intro */}
                <AnimatePresence>
                  {bio && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-body text-text-secondary leading-relaxed mt-4 relative z-10"
                    >
                      {bio}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div
                  className="my-4 h-px relative z-10"
                  style={{ background: `${eraColor}15` }}
                />

                {/* Save button */}
                <motion.button
                  layout
                  whileTap={{ scale: 0.95 }}
                  onClick={savePiece}
                  disabled={saved}
                  className="w-full h-11 rounded-full flex items-center justify-center gap-2 font-body text-sm font-medium transition-colors relative z-10"
                  style={{
                    background: saved
                      ? `${eraColor}20`
                      : "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                    color: saved ? eraColor : "#1a1f0e",
                  }}
                >
                  {saved ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={eraColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1f0e" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                  {saved ? "Saved to Collection" : "Save to Collection"}
                </motion.button>

                {/* Post-save navigation */}
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="w-full overflow-hidden relative z-10"
                    >
                      <div className="flex items-center gap-2 pt-3">
                        {savedPieceId && (
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/piece/${savedPieceId}`)}
                            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 font-body text-xs font-medium glass-card"
                            style={{ color: eraColor }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={eraColor} strokeWidth="2" strokeLinecap="round">
                              <path d="M9 18V5l12-2v13" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                            View Piece
                          </motion.button>
                        )}
                        {resolvedComposer && (
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/composer/${resolvedComposer.id}`)}
                            className="flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 font-body text-xs font-medium glass-card"
                            style={{ color: eraColor }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={eraColor} strokeWidth="2" strokeLinecap="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Composer
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Section 3: Listen (YouTube embed) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-3"
              >
                <h3 className="font-display text-base italic text-text-primary mb-2 px-1">
                  Listen
                </h3>
                {loadingVideos ? (
                  <div className="glass-card aspect-video animate-pulse rounded-2xl" />
                ) : videos.length > 0 ? (
                  <div className="glass-card overflow-hidden rounded-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${videos[0].id}?autoplay=0&rel=0&modestbranding=1`}
                      title={videos[0].title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video"
                      style={{ border: "none" }}
                    />
                  </div>
                ) : (
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs font-body text-text-secondary">
                      No audio available.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Section 4: YouTube Performances */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3"
              >
                <h3 className="font-display text-base italic text-text-primary mb-2 px-1">
                  Performances
                </h3>
                {loadingVideos ? (
                  <div className="flex gap-3 overflow-hidden">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="glass-card shrink-0 w-52 aspect-video animate-pulse"
                      />
                    ))}
                  </div>
                ) : videos.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                    {videos.map((video, i) => (
                      <div key={video.id} className="shrink-0 w-52">
                        <YouTubeVideoCard video={video} index={i} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs font-body text-text-secondary">
                      No performances found.
                    </p>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent((result.pieceName || result.title) + " " + (result.composerName || result.artist) + " classical")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-body mt-1.5 inline-block"
                      style={{ color: "#a8d8c8" }}
                    >
                      Search YouTube directly →
                    </a>
                  </div>
                )}
              </motion.div>

              {/* Section 5: Sheet Music */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-3 pb-4"
              >
                <h3 className="font-display text-base italic text-text-primary mb-2 px-1">
                  Sheet Music
                </h3>
                {loadingSheets ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="glass-card p-4 h-16 animate-pulse" />
                    ))}
                  </div>
                ) : sheets.length > 0 ? (
                  <div className="space-y-2">
                    {sheets.map((sheet, i) => (
                      <SheetMusicLink key={i} sheet={sheet} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs font-body text-text-secondary">
                      No sheet music found.
                    </p>
                    <a
                      href={`https://imslp.org/wiki/Special:Search?search=${encodeURIComponent(result.pieceName || result.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-body mt-1.5 inline-block"
                      style={{ color: "#a8d8c8" }}
                    >
                      Search IMSLP directly →
                    </a>
                  </div>
                )}
              </motion.div>

            </motion.div>
          )}

          {/* Error */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 z-10"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" x2="9" y1="9" y2="15" />
                  <line x1="9" x2="15" y1="9" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-body text-text-secondary text-center max-w-xs">
                {errorMsg}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="px-6 py-3 rounded-full glass-card text-sm font-body text-text-primary"
              >
                Try again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
