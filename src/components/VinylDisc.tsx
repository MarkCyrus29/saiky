"use client";

import React, { useRef } from "react";
import { useVinylSpin } from "@/src/hooks/useVinylSpin";

interface VinylDiscProps {
  vinylName: string;
  isSpinning: boolean;
  isHoveredOrFocused?: boolean;
  isPlaying?: boolean;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const VinylDisc: React.FC<VinylDiscProps> = ({
  vinylName,
  isSpinning,
  isHoveredOrFocused = false,
  isPlaying = false,
  size = 280,
  className = "",
  style = {},
}) => {
  const discRef = useRef<HTMLDivElement | null>(null);

  // Hook handles smooth acceleration, coasting to stop, and maintaining angle across pause/resume
  useVinylSpin(discRef, isSpinning);

  const dimensionStyle = {
    width: typeof size === "number" ? `${size}px` : size,
    height: typeof size === "number" ? `${size}px` : size,
  };

  return (
    <div
      className={`vinyl-wrapper ${className}`}
      style={{ ...dimensionStyle, ...style }}
    >
      {/* The rotating disc element */}
      <div
        ref={discRef}
        className="vinyl-disc"
        style={dimensionStyle}
      >
        {/* Base normal drawing */}
        <picture
          className={`vinyl-img-wrapper vinyl-img-wrapper--normal ${
            isHoveredOrFocused ? "is-hidden" : ""
          }`}
        >
          <source srcSet={`/assets/vinyl-${vinylName}.webp`} type="image/webp" />
          <img
            src={`/assets/vinyl-${vinylName}.png`}
            alt=""
            width={900}
            height={900}
            className="vinyl-img vinyl-img--normal"
            draggable={false}
          />
        </picture>

        {/* Hover blue highlighter overlay */}
        <picture
          className={`vinyl-img-wrapper vinyl-img-wrapper--hover ${
            isHoveredOrFocused ? "is-active" : ""
          }`}
          aria-hidden="true"
        >
          <source
            srcSet={`/assets/vinyl-${vinylName}_hover.webp`}
            type="image/webp"
          />
          <img
            src={`/assets/vinyl-${vinylName}_hover.png`}
            alt=""
            width={900}
            height={900}
            className="vinyl-img vinyl-img--hover"
            draggable={false}
          />
        </picture>
      </div>
    </div>
  );
};

