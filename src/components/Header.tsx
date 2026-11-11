"use client";

import React, { useState } from "react";

interface SocialItem {
  name: string;
  key: string;
  url: string;
  tilt: number;
}

const SOCIALS: SocialItem[] = [
  {
    name: "Spotify",
    key: "spotify",
    url: "https://open.spotify.com/artist/5VHFut3HVmD4UHfXDmcBOE",
    tilt: -3,
  },
  {
    name: "Bandcamp",
    key: "bandcamp",
    url: "https://saiky.bandcamp.com/",
    tilt: 2.8,
  },
  {
    name: "Soundcloud",
    key: "soundcloud",
    url: "https://soundcloud.com/goodmorningsaiky",
    tilt: -2.2,
  },
  {
    name: "TikTok",
    key: "tiktok",
    url: "https://www.tiktok.com/@goodmorningsaiky",
    tilt: 3.2,
  },
  {
    name: "Instagram",
    key: "ig",
    url: "https://www.instagram.com/goodmorning.saiky",
    tilt: -2.6,
  },
  {
    name: "YouTube",
    key: "yt",
    url: "https://www.youtube.com/@goodmorningsaiky",
    tilt: 2.5,
  },
];

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

          {/* Hover blue highlighter overlay */}
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

      {/* Socials on the bottom of the header */}
      <nav className="header-socials-row" aria-label="Social media profiles">
        {SOCIALS.map((social) => (
          <a
            key={social.key}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="header-social-item"
            aria-label={social.name}
            title={social.name}
            style={{ "--askew": `${social.tilt}deg` } as React.CSSProperties}
          >
            <div className="social-icon-stack">
              <picture>
                <source srcSet={`/assets/socials/${social.key}.webp`} type="image/webp" />
                <img
                  src={`/assets/socials/${social.key}.png`}
                  alt={social.name}
                  width={320}
                  height={320}
                  className="social-icon-img social-icon-img--normal"
                />
              </picture>
              <picture className="social-icon-hover-wrapper" aria-hidden="true">
                <source srcSet={`/assets/socials/${social.key}_hover.webp`} type="image/webp" />
                <img
                  src={`/assets/socials/${social.key}_hover.png`}
                  alt=""
                  width={320}
                  height={320}
                  className="social-icon-img social-icon-img--hover"
                />
              </picture>
            </div>
          </a>
        ))}
      </nav>
    </header>
  );
};
