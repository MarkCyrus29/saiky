"use client";

import React, { useRef } from "react";
import Image from "next/image";
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
        <div
          className={`vinyl-img-wrapper vinyl-img-wrapper--normal ${
            isHoveredOrFocused ? "is-hidden" : ""
          }`}
        >
          <Image
            src={`/assets/vinyl-${vinylName}.png`}
            alt=""
            width={600}
            height={600}
            className="vinyl-img vinyl-img--normal"
            draggable={false}
            priority
          />
        </div>

        {/* Hover blue highlighter overlay */}
        <div
          className={`vinyl-img-wrapper vinyl-img-wrapper--hover ${
            isHoveredOrFocused ? "is-active" : ""
          }`}
          aria-hidden="true"
        >
          <Image
            src={`/assets/vinyl-${vinylName}_hover.png`}
            alt=""
            width={600}
            height={600}
            className="vinyl-img vinyl-img--hover"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

