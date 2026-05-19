"use client";

import { motion } from "framer-motion";
import { YouTubeVideo } from "@/types";

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  index: number;
}

export default function YouTubeVideoCard({
  video,
  index,
}: YouTubeVideoCardProps) {
  return (
    <motion.a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card overflow-hidden block p-2.5 flex items-center gap-3"
    >
      <div className="relative w-28 h-[72px] rounded-lg overflow-hidden shrink-0 bg-bg-card-solid">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="#e8e4d4"
              stroke="none"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-body text-text-primary line-clamp-2 leading-snug">
          {video.title}
        </h3>
        <p className="text-xs font-body text-text-secondary mt-1">
          {video.channelTitle}
        </p>
      </div>
    </motion.a>
  );
}
