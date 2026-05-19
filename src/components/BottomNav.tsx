"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    href: "/",
    label: "Collection",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    href: "/listen",
    label: "Identify",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
  },
  {
    href: "/practice",
    label: "Practice",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M2 8h20" />
      </svg>
    ),
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = pathname === "/listen" ? 1 : pathname.startsWith("/practice") ? 2 : 0;

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <motion.div
        layout
        className="flex items-center gap-2 rounded-full px-2 py-2 nav-pill"
      >
        {tabs.map((tab, i) => {
          const isActive = activeIndex === i;
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                layout
                className="relative flex items-center justify-center rounded-full overflow-hidden"
                animate={{
                  backgroundColor: isActive
                    ? "rgba(197, 201, 96, 0.14)"
                    : "transparent",
                }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1px solid rgba(197, 201, 96, 0.18)",
                      boxShadow: "0 0 16px rgba(197, 201, 96, 0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                <motion.div
                  layout="position"
                  className="relative z-10 flex items-center gap-2 px-3.5 py-2"
                >
                  <motion.span
                    className="flex items-center shrink-0"
                    animate={{
                      color: isActive ? "#c5c960" : "#6b6e58",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.icon}
                  </motion.span>

                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.span
                        key={tab.label}
                        className="text-[11px] font-body font-semibold tracking-wide whitespace-nowrap"
                        style={{ color: "#c5c960" }}
                        initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                        exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
