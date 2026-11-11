"use client";

import React, { useState } from "react";
import { Tape } from "./Tape";

export const Header: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="header-scrap-container">
      <div
        className="header-scrap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        tabIndex={0}
        role="banner"
        aria-label="Saiky's Space"
      >
        {/* Taped to the desk */}
        <Tape
          variant="cream"
          angle={-3}
          width={95}
          height={30}
          style={{ position: "absolute", top: -14, left: 32, zIndex: 10 }}
        />
        <Tape
          variant="kraft"
          angle={2.5}
          width={100}
          height={30}
          style={{ position: "absolute", top: -12, right: 36, zIndex: 10 }}
        />

        <div className="header-image-stack">
          {/* Base normal drawing */}
          <picture>
            <source srcSet="/assets/header.webp" type="image/webp" />
            <img
              src="/assets/header.jpg"
              alt="Saiky's Space"
              width={1600}
              height={521}
              className="header-img header-img--normal"
              fetchPriority="high"
            />
          </picture>

          {/* Hover blue highlighter overlay with left-to-right marker wipe */}
          <picture
            className={`header-img-hover-wrapper ${
              isHovered ? "is-active" : ""
            }`}
            aria-hidden="true"
          >
            <source srcSet="/assets/header_hover.webp" type="image/webp" />
            <img
              src="/assets/header_hover.jpg"
              alt=""
              width={1600}
              height={521}
              className="header-img header-img--hover"
            />
          </picture>
        </div>
      </div>
    </header>
  );
};
