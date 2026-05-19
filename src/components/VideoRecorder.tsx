"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, thumbnailDataUrl: string, duration: number) => void;
  onCancel: () => void;
}

export default function VideoRecorder({ onRecordingComplete, onCancel }: VideoRecorderProps) {
  const [state, setState] = useState<"preview" | "recording" | "reviewing">("preview");
  const [elapsed, setElapsed] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);

  const previewRef = useRef<HTMLVideoElement>(null);
  const reviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  const startStream = useCallback(async (facing: "user" | "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError("Camera access is required to record practice videos.");
    }
  }, []);

  useEffect(() => {
    startStream(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const flipCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startStream(next);
  }, [facingMode, startStream]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setElapsed(0);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current, { mimeType });
    } catch (err) {
      setError("This browser could not start video recording.");
      return;
    }
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = (event) => {
    };

    recorder.onstop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const blob = new Blob(chunksRef.current, { type: mimeType });
      recordedBlobRef.current = blob;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setReviewUrl(URL.createObjectURL(blob));
      setState("reviewing");
    };

    try {
      recorder.start(1000);
    } catch (err) {
      setError("This browser failed to start recording.");
      return;
    }
    setState("recording");

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const generateThumbnail = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const video = reviewRef.current;
      if (!video || !video.src) {
        resolve("");
        return;
      }

      const timeout = setTimeout(() => resolve(""), 3000);

      const capture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        clearTimeout(timeout);
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };

      const seekAndCapture = () => {
        const targetTime = Math.min(1, (video.duration || 1) * 0.1);
        if (Math.abs(video.currentTime - targetTime) < 0.1) {
          capture();
          return;
        }
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          capture();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = targetTime;
      };

      if (video.readyState >= 2) {
        seekAndCapture();
      } else {
        const onLoaded = () => {
          video.removeEventListener("loadeddata", onLoaded);
          seekAndCapture();
        };
        video.addEventListener("loadeddata", onLoaded);
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!recordedBlobRef.current) return;
    const thumbnail = await generateThumbnail();
    onRecordingComplete(recordedBlobRef.current, thumbnail, elapsed);
  }, [elapsed, generateThumbnail, onRecordingComplete]);

  const handleDiscard = useCallback(() => {
    recordedBlobRef.current = null;
    if (reviewUrl) {
      URL.revokeObjectURL(reviewUrl);
      setReviewUrl(null);
    }
    setState("preview");
    startStream(facingMode);
  }, [facingMode, startStream, reviewUrl]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-body text-text-secondary text-center max-w-xs">{error}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-6 py-3 rounded-full glass-card text-sm font-body text-text-primary"
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video viewfinder */}
      <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-[4/3]">
        <AnimatePresence mode="wait">
          {state !== "reviewing" ? (
            <motion.video
              key="preview"
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.video
              key="review"
              ref={reviewRef}
              src={reviewUrl || undefined}
              controls
              playsInline
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Recording indicator */}
        {state === "recording" && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-body font-medium text-white tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        )}

        {/* Flip camera (only in preview/recording) */}
        {state !== "reviewing" && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={flipCamera}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
              <polyline points="15 3 17 5 15 7" />
              <polyline points="9 21 7 19 9 17" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {state === "preview" && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              className="h-11 px-5 rounded-full glass-card text-sm font-body font-medium text-text-secondary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={startRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                boxShadow: "0 4px 24px rgba(239,68,68,0.3)",
              }}
            >
              <div className="w-5 h-5 rounded-full bg-white" />
            </motion.button>
            <div className="w-[72px]" />
          </>
        )}

        {state === "recording" && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={stopRecording}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              boxShadow: "0 4px 24px rgba(239,68,68,0.3)",
            }}
          >
            <div className="w-5 h-5 rounded-sm bg-white" />
          </motion.button>
        )}

        {state === "reviewing" && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDiscard}
              className="h-11 px-5 rounded-full glass-card text-sm font-body font-medium text-red-400"
            >
              Discard
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className="h-11 px-6 rounded-full text-sm font-body font-medium"
              style={{
                background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
                color: "#1a1f0e",
              }}
            >
              Save Recording
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
