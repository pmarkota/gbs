"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const Hero = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Section background gradient
  const [gradientFrom, setGradientFrom] = useState("#b37a42"); // RGB 179, 122, 66
  const [gradientTo, setGradientTo] = useState("#363636"); // RGB 54, 54, 54

  // About Our Company header color
  const [headerGradientMiddle, setHeaderGradientMiddle] = useState("#ffcf00"); // Bright gold

  // Card colors
  const [cardBgColor, setCardBgColor] = useState("#800000"); // Darker burgundy to match image
  const [cardHeaderColor, setCardHeaderColor] = useState("#ffd700"); // Golden yellow to match image

  const [showControls, setShowControls] = useState(false);

  const checkUserStatus = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({ username: currentUser.username });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Section is visible, but we don't need this state anymore
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Check if user is logged in
    checkUserStatus();

    // Listen for auth changes
    window.addEventListener("authChange", checkUserStatus);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      window.removeEventListener("authChange", checkUserStatus);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      const link = e.currentTarget as HTMLAnchorElement;
      link.click();
    }
  };

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div
        ref={sectionRef}
        className="relative w-full min-h-[600px] h-[calc(100vh-150px)] mt-16 overflow-hidden"
      >
        {/* Pattern Repeatable Background */}
        <div
          className="absolute inset-0 z-10 bg-pattern"
          style={{
            opacity: 0.4, // Lighter opacity
          }}
        ></div>

        <style jsx>{`
          .bg-pattern {
            background-image: url("/4znaka_bez crvene.png");
            background-repeat: repeat;
            background-size: 48px; /* Set exact size to match image dimensions */
            image-rendering: -webkit-optimize-contrast;
            background-position: 0 0;
          }
        `}</style>

        {/* Main SVG Background */}
        <div
          className="absolute inset-0 z-20"
          style={{
            backgroundImage: "url('/gs_home _72 ppi.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Content Container */}
        <div className="container relative z-30 flex flex-col h-full px-4 mx-auto">
          {/* Title text in center */}
          <div className="absolute left-1/2 top-[20%] transform -translate-x-1/2 text-center max-w-md"></div>

          {/* Registration button - styled to match image */}
          <div className="absolute left-1/2 top-[55%] transform -translate-x-1/2">
            {user ? (
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="px-8 py-2 text-lg font-bold text-black rounded-full bg-primary"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  aria-label="My Profile"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    MY PROFILE
                  </span>
                </Link>
                <Link
                  href="/videos"
                  className="px-8 py-2 text-lg font-bold text-black rounded-full bg-primary"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  aria-label="Watch Videos"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    WATCH VIDEOS
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/auth"
                className="inline-block px-10 py-2 text-xl font-bold text-black transition-colors duration-300 border-2 border-black rounded-full shadow-md bg-primary hover:bg-primary/90"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #e9c767, #d4af37)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-label="Register now"
              >
                REGISTRATION
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Full width section with about our company */}
      <div
        className="relative w-full pb-16"
        style={{
          position: "relative",
          minHeight: "800px",
          overflow: "hidden",
        }}
      >
        {/* Base solid color background (removing this in favor of single gradient) */}

        {/* Single gradient background that can be controlled */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
            zIndex: -1,
          }}
        ></div>

        {/* Background image without any gradient overlay */}
        <div
          className="absolute inset-0 w-screen"
          style={{
            backgroundImage: "url('/gs_about our company2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 1, // Move above the gradient
            left: 0,
            right: 0,
            margin: "0 calc(-50vw + 50%)",
            width: "100vw",
            pointerEvents: "none", // Ensures clicks pass through to elements below
            // Removed mixBlendMode to prevent blending with gradient
            opacity: 1, // Full opacity to prevent gradient showing through
          }}
        ></div>

        {/* Gold/yellow bar for "ABOUT OUR COMPANY" heading at top of section */}
        <div
          className="absolute top-0 left-0 right-0 w-screen"
          style={{
            height: "80px", // Thicker bar
            backgroundColor: headerGradientMiddle, // Single color instead of gradient
            zIndex: 3,
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "2px solid #333",
            borderBottom: "2px solid #333",
          }}
        >
          <h2 className="text-4xl font-bold text-black">ABOUT OUR COMPANY</h2>
        </div>

        {/* Add spacing after the heading section */}
        <div className="h-28"></div>

        {/* Company info cards */}
        <div
          className="container relative grid grid-cols-1 gap-8 px-4 mx-auto md:grid-cols-2"
          style={{ zIndex: 3, marginTop: "40px", position: "relative" }}
        >
          {/* Vision Card */}
          <div
            className="overflow-hidden rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 group"
            style={{
              background: `linear-gradient(135deg, ${cardBgColor}, rgba(60,0,0,0.9))`,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Card header with gold/yellow background */}
            <div
              className="py-4 font-bold text-black relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${cardHeaderColor}, #e3b423)`,
                borderBottom: "2px solid rgba(0,0,0,0.3)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <h3 className="text-2xl font-bold text-center drop-shadow-sm">
                OUR VISION
              </h3>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            {/* Card content */}
            <div className="p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <p className="mb-6 text-white leading-relaxed relative z-10">
                OUR GOAL IS TO BECOME THE LEADING PLATFORM FOR CASINO SLOT
                PLAYERS SEEKING TO ENHANCE THEIR SKILLS, MAXIMIZE THEIR
                EARNINGS, AND MINIMIZE LOSSES.
              </p>
              <p className="text-white leading-relaxed relative z-10">
                WE STRIVE TO CREATE A SUPPORTIVE AND INNOVATIVE COMMUNITY WHERE
                PLAYERS CAN ACCESS EXPERT STRATEGIES, WATCH GAMEPLAY VIDEOS,
                STREAM PLAY, AND MAKE INFORMED GAMING DECISIONS.
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div
            className="overflow-hidden rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 group"
            style={{
              background: `linear-gradient(135deg, ${cardBgColor}, rgba(60,0,0,0.9))`,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Card header with gold/yellow background */}
            <div
              className="py-4 font-bold text-black relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${cardHeaderColor}, #e3b423)`,
                borderBottom: "2px solid rgba(0,0,0,0.3)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <h3 className="text-2xl font-bold text-center drop-shadow-sm">
                OUR MISSION
              </h3>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            {/* Card content */}
            <div className="p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <p className="mb-6 text-white leading-relaxed relative z-10">
                TO EMPOWER CASINO SLOT PLAYERS WITH THE KNOWLEDGE, TOOLS, AND
                INSIGHTS THEY NEED TO ENHANCE THEIR GAMEPLAY AND MAXIMIZE THEIR
                WINNINGS.
              </p>
              <p className="text-white leading-relaxed relative z-10">
                THROUGH EXPERT GUIDANCE, EDUCATIONAL CONTENT, AND ADVANCED
                GAMEPLAY ANALYSIS, WE HELP PLAYERS MAKE INFORMED DECISIONS,
                DEVELOP SMARTER GAMING HABITS, AND ENJOY A MORE REWARDING
                EXPERIENCE.
              </p>
            </div>
          </div>
        </div>

        {/* Color control toggle button */}
        <div className="absolute top-16 right-4" style={{ zIndex: 10 }}>
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-3 py-2 text-white transition-colors rounded-full shadow-lg bg-secondary hover:bg-secondary/80"
          >
            {showControls ? "✕" : "🎨"}
          </button>
        </div>

        {/* Color control panel */}
        {showControls && (
          <div className="absolute top-28 right-4 z-10 bg-white p-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <h4 className="mb-4 font-bold text-center">Color Controls</h4>

            {/* Section Background Gradient */}
            <div className="pb-4 mb-4 border-b">
              <h5 className="mb-2 font-bold">Main Background</h5>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block mb-1 text-sm">From Color:</label>
                  <input
                    type="color"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">To Color:</label>
                  <input
                    type="color"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Header Color */}
            <div className="pb-4 mb-4 border-b">
              <h5 className="mb-2 font-bold">Header Banner</h5>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block mb-1 text-sm">Header Color:</label>
                  <input
                    type="color"
                    value={headerGradientMiddle}
                    onChange={(e) => setHeaderGradientMiddle(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Card Colors */}
            <div>
              <h5 className="mb-2 font-bold">Cards</h5>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block mb-1 text-sm">Card Background:</label>
                  <input
                    type="color"
                    value={cardBgColor}
                    onChange={(e) => setCardBgColor(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Card Header:</label>
                  <input
                    type="color"
                    value={cardHeaderColor}
                    onChange={(e) => setCardHeaderColor(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
