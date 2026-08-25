"use client";

import { useEffect, useState } from "react";

export default function MatchRing({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 800;
      const steps = 30;
      const increment = score / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current = Math.min(score, Math.round(increment * step));
        setAnimatedScore(current);
        if (step >= steps) clearInterval(interval);
      }, duration / steps);

      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timeout);
  }, [score]);

  const ringColor =
    score >= 70 ? "var(--teal)" : score >= 40 ? "var(--amber)" : "var(--muted)";

  return (
    <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color: "var(--foreground)" }}>
        {animatedScore}%
      </span>
    </div>
  );
}