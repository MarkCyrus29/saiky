import React from "react";

interface TapeProps {
  variant?: "cream" | "kraft" | "cyan" | "paper";
  angle?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Tape: React.FC<TapeProps> = ({
  variant = "cream",
  angle = -1.5,
  width = 90,
  height = 28,
  className = "",
  style = {},
}) => {
  return (
    <div
      aria-hidden="true"
      className={`washi-tape washi-tape--${variant} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
    />
  );
};

