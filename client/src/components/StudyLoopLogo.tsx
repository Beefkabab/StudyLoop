import React from "react";

interface StudyLoopLogoProps {
  size?: number;
  className?: string;
  variant?: "badge" | "iconOnly";
  rounded?: "lg" | "xl" | "2xl" | "full";
  showText?: boolean;
}

export function StudyLoopLogo({
  size = 40,
  className = "",
  variant = "badge",
  rounded = "xl",
  showText = false,
}: StudyLoopLogoProps) {
  const roundedClass = {
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  const iconSize = Math.max(12, Math.round(size * 0.56));

  if (variant === "iconOnly") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
        <path d="m18 15-2-2" />
        <path d="m15 18-2-2" />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center ${roundedClass} bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 text-white shadow-md shadow-sky-500/25 shrink-0 transition-all duration-200`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
          <path d="m18 15-2-2" />
          <path d="m15 18-2-2" />
        </svg>
      </div>

      {showText && (
        <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-none">
          Study<span className="text-sky-600">Loop</span>
        </span>
      )}
    </div>
  );
}
