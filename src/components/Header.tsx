"use client";

import React, { useState } from "react";
import Image from "next/image";

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
          <Image
            src="/assets/header.jpg"
            alt="Saiky's Space"
            width={1600}
            height={521}
            className="header-img header-img--normal"
            priority
          />

          {/* Hover blue highlighter overlay */}
          <div
            className={`header-img-hover-wrapper ${
              isHovered ? "is-active" : ""
            }`}
            aria-hidden="true"
          >
            <Image
              src="/assets/header_hover.jpg"
              alt=""
              width={1600}
              height={521}
              className="header-img header-img--hover"
            />
          </div>
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
              <Image
                src={`/assets/socials/${social.key}.png`}
                alt={social.name}
                width={88}
                height={88}
                className="social-icon-img social-icon-img--normal"
              />
              <div className="social-icon-hover-wrapper" aria-hidden="true">
                <Image
                  src={`/assets/socials/${social.key}_hover.png`}
                  alt=""
                  width={88}
                  height={88}
                  className="social-icon-img social-icon-img--hover"
                />
              </div>
            </div>
          </a>
        ))}
      </nav>
    </header>
  );
};
