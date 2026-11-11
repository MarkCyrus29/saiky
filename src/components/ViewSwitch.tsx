"use client";

import React from "react";
import { Tape } from "./Tape";

export type ViewMode = "rows" | "player";

interface ViewSwitchProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewSwitch: React.FC<ViewSwitchProps> = ({ mode, onChange }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Tracklist view mode"
      className="view-switch-container"
    >
      <div className="view-switch-scraps">
        {/* Rows button scrap */}
        <button
          type="button"
          role="radio"
          aria-checked={mode === "rows"}
          onClick={() => onChange("rows")}
          className={`view-switch-scrap ${
            mode === "rows" ? "view-switch-scrap--active" : ""
          }`}
          style={{ transform: "rotate(-1.8deg)" }}
        >
          <Tape
            variant={mode === "rows" ? "cyan" : "cream"}
            angle={-2}
            width={48}
            height={18}
            style={{ position: "absolute", top: -8, left: 12 }}
          />
          <span className="view-switch-label">rows</span>
        </button>

        {/* Player button scrap */}
        <button
          type="button"
          role="radio"
          aria-checked={mode === "player"}
          onClick={() => onChange("player")}
          className={`view-switch-scrap ${
            mode === "player" ? "view-switch-scrap--active" : ""
          }`}
          style={{ transform: "rotate(1.5deg)" }}
        >
          <Tape
            variant={mode === "player" ? "cyan" : "kraft"}
            angle={2}
            width={48}
            height={18}
            style={{ position: "absolute", top: -8, right: 12 }}
          />
          <span className="view-switch-label">player</span>
        </button>
      </div>
    </div>
  );
};

