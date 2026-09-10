"use client";

import React from "react";

interface Props {
  className?: string;
  color?: string;
  accentColor?: string;
}

export function CornerOrnament({
  className = "",
  color = "#005C3C",
  accentColor = "#E1A929",
}: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer L-Frame Border */}
      <path
        d="M 0 0 L 100 0 L 100 6 L 6 6 L 6 100 L 0 100 Z"
        fill={color}
      />

      {/* Solomon's Knot Interlaced Squares (Centered in Corner) */}
      <g transform="translate(18, 18)">
        {/* First Square - Gold Ribbon */}
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="2"
          stroke={accentColor}
          strokeWidth="3.5"
          fill="none"
        />

        {/* Second Square Rotated 45° - Green Ribbon Interlace */}
        <rect
          x="6"
          y="6"
          width="36"
          height="36"
          rx="2"
          stroke={color}
          strokeWidth="3.5"
          fill="none"
          transform="rotate(45 24 24)"
        />

        {/* Interlocking Edge Details / Overlap Rings */}
        <circle cx="24" cy="24" r="5" stroke={accentColor} strokeWidth="2" fill="none" />
        <circle cx="24" cy="24" r="2" fill={color} />
      </g>

      {/* Subtle Frame Accent Lines */}
      <path
        d="M 12 90 L 12 12 L 90 12"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    </svg>
  );
}