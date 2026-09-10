"use client";

import React from "react";

interface Props {
  className?: string;
  color?: string;
}

export function CornerOrnament({ className = "", color = "#005C3C" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {/* Outer framing lines */}
      <path d="M 0 35 L 35 35 L 35 0" />
      <path d="M 10 95 L 10 50 L 50 50 L 50 10 L 95 10" />
      
      {/* Inner interlocking square grid */}
      <rect x="20" y="60" width="20" height="20" />
      <rect x="60" y="20" width="20" height="20" />
      <rect x="20" y="20" width="20" height="20" />
    </svg>
  );
}