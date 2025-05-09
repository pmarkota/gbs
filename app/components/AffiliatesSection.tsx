"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import GradientColorPicker, { GradientDirection } from "./GradientColorPicker";
import PillarStyleSelector, { PillarStyle } from "./PillarStyleSelector";

type AffiliateType = {
  id: number;
  name: string;
  logo: string;
  url: string;
};

const affiliates: AffiliateType[] = [
  // ... (your affiliates array remains unchanged)
  {
    id: 1,
    name: "Dublinbet",
    logo: "/casino1.svg",
    url: "https://dublinbet.com",
  },
  {
    id: 2,
    name: "Casumo",
    logo: "/casino2.svg",
    url: "https://www.casumo.com",
  },
  {
    id: 3,
    name: "Nine Casino",
    logo: "/casino1.svg",
    url: "https://www.ninecasino.com",
  },
  {
    id: 4,
    name: "Wine & Casino",
    logo: "/casino1.svg",
    url: "https://wineandcasino.com",
  },
  {
    id: 5,
    name: "Casumo",
    logo: "/casino2.svg",
    url: "https://www.casumo.com",
  },
  {
    id: 6,
    name: "Dublinbet",
    logo: "/casino1.svg",
    url: "https://dublinbet.com",
  },
  {
    id: 7,
    name: "Nine Casino",
    logo: "/casino1.svg",
    url: "https://www.ninecasino.com",
  },
  {
    id: 8,
    name: "Casumo",
    logo: "/casino2.svg",
    url: "https://www.casumo.com",
  },
  {
    id: 9,
    name: "Wine & Casino",
    logo: "/casino1.svg",
    url: "https://wineandcasino.com",
  },
  {
    id: 10,
    name: "Dublinbet",
    logo: "/casino1.svg",
    url: "https://dublinbet.com",
  },
  {
    id: 11,
    name: "Casumo",
    logo: "/casino2.svg",
    url: "https://www.casumo.com",
  },
  {
    id: 12,
    name: "Nine Casino",
    logo: "/casino1.svg",
    url: "https://www.ninecasino.com",
  },
  {
    id: 13,
    name: "Wine & Casino",
    logo: "/casino1.svg",
    url: "https://wineandcasino.com",
  },
  {
    id: 14,
    name: "Casumo",
    logo: "/casino2.svg",
    url: "https://www.casumo.com",
  },
  {
    id: 15,
    name: "Dublinbet",
    logo: "/casino1.svg",
    url: "https://dublinbet.com",
  },
];

const AffiliatesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // Progress 0 to 1
  const [expandedFlags, setExpandedFlags] = useState<{
    [key: number]: boolean;
  }>({});

  // Control states
  const [showControls, setShowControls] = useState(false);
  const [fromColor, setFromColor] = useState("#a91e16");
  const [toColor, setToColor] = useState("#d42b1d");
  const [direction, setDirection] =
    useState<GradientDirection>("to bottom right");
  const [pillarStyle, setPillarStyle] = useState<PillarStyle>("Gold");

  // Get pillar src based on selected style
  const getPillarSrc = (): string => {
    switch (pillarStyle) {
      case "Gold":
        return "/stup_2200_goldnovi.svg";
      case "Red":
        return "/stup_2200_red.svg";
      case "Black":
        return "/stup_2200.svg";
      default:
        return "/stup_2200_goldnovi.svg";
    }
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Toggle all flags together
  const toggleAllFlags = () => {
    // Check if any flag is expanded
    const anyExpanded = Object.values(expandedFlags).some((value) => value);

    // Create a new state with all flags set to the opposite of anyExpanded
    const itemsPerRow = getItemsPerRow();
    const newExpandedFlags: { [key: number]: boolean } = {};

    for (let i = 0; i < itemsPerRow; i++) {
      newExpandedFlags[i] = !anyExpanded;
    }

    setExpandedFlags(newExpandedFlags);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const topOffset = rect.top;

      let progress = 0;

      // Start animation when the top of the section is near the bottom of the viewport.
      // Adjust this value (e.g., 0.9 for even earlier, 0.6 for later) if needed.
      const triggerPoint = viewportHeight * 1; //TODO  Changed from 0.5

      // Define the distance over which the animation occurs (e.g., 1 viewport height)
      const animationDistance = viewportHeight * 1.5;

      if (topOffset < triggerPoint) {
        // Calculate how far past the trigger point we've scrolled
        const distancePastTrigger = triggerPoint - topOffset;
        // Map this distance to a 0-1 progress value over the animationDistance
        progress = Math.min(
          1,
          Math.max(0, distancePastTrigger / animationDistance)
        );
      } else {
        // Ensure progress is 0 before the trigger point
        progress = 0;
      }
      // --- END ADJUSTMENT 1 ---

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // No dependency on scrollProgress needed here

  const getItemsPerRow = () => {
    if (windowWidth === 0) return 5;
    if (windowWidth < 768) return 2;
    if (windowWidth < 1024) return 3;
    return 5;
  };

  const renderPillarGrid = () => {
    const itemsPerRow = getItemsPerRow();
    const columns = Array.from({ length: itemsPerRow }, (_, i) => i);
    const rowOffset = 0;

    // Function to get the correct expanded flag image based on column index
    const getExpandedFlagImage = (columnIndex: number) => {
      // Use modulo to handle cases where there are more than 5 columns
      const flagIndex = columnIndex % 5;

      switch (flagIndex) {
        case 0:
          return "/gs_zastava-800.png"; // 1st pillar
        case 1:
          return "/gs_zastava-800_navy.png"; // 2nd pillar
        case 2:
          return "/gs_zastava-800_ljubicasta.png"; // 3rd pillar
        case 3:
          return "/gs_zastava-800_nar.png"; // 4th pillar
        case 4:
          return "/gs_zastava-800_zelena.png"; // 5th pillar
        default:
          return "/gs_zastava-800.png"; // Fallback
      }
    };

    const calculateVerticalOffset = (rowIndex: number) => {
      if (rowIndex === 0) return 0;

      // Define starting and target offsets for the animation
      const startingOffset = rowIndex === 1 ? 150 : 250; // Initial position
      const targetOffset = rowIndex === 1 ? -200 : -400; // Row 3 target is now -400 for consistent spacing

      // Apply an easing function if desired. Example: cubic ease-in-out
      // easing function: 0 -> 0, 0.5 -> 0.5, 1 -> 1, smooth transition
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(scrollProgress); // Base progress 0 to 1

      // Adjust progress for rows 2 and 3 to make them start earlier
      let finalProgress = easedProgress;
      if (rowIndex > 0) {
        const speedFactor = 1.2; // Increase factor for earlier start (e.g., 1.1, 1.3)
        finalProgress = Math.min(1, easedProgress * speedFactor);
      }

      // Calculate total distance the pillar needs to travel
      const totalDistance = startingOffset - targetOffset;

      // Calculate how much the pillar has moved based on adjusted progress
      const moveAmount = totalDistance * finalProgress;

      // Calculate the current vertical offset
      const currentOffset = startingOffset - moveAmount;

      // Return the calculated offset (interpolates from startingOffset to targetOffset)
      return currentOffset;
    };

    return (
      <div className="flex justify-center gap-4 md:gap-6 lg:gap-8">
        {columns.map((columnIndex) => (
          <div
            key={`column-${columnIndex}`}
            className="flex flex-col items-center"
          >
            {[0, 1, 2].map((rowIndex) => {
              const affiliateIndex = rowIndex * itemsPerRow + columnIndex;
              if (affiliateIndex >= affiliates.length) return null;
              const affiliate = affiliates[affiliateIndex];
              const xOffset = rowIndex * rowOffset;
              const yOffset = calculateVerticalOffset(rowIndex);

              return (
                <div
                  key={`pillar-${affiliateIndex}`}
                  className="relative mb-[-75%] last:mb-0 w-44 sm:w-48 md:w-56 lg:w-64"
                  style={{
                    marginLeft: `${xOffset}px`,
                    transform: `translateY(${yOffset}px)`,
                    // Use a slightly longer transition to accommodate smoother easing
                    transition: "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)", // Example: Ease-in-out
                  }}
                >
                  {rowIndex === 0 && (
                    <>
                      {/* Casumo logo above the flag */}
                      <div className="absolute inset-x-0 top-[-80px] z-10 flex justify-center">
                        <Image
                          src="/casumo.png"
                          alt="Casumo"
                          width={100}
                          height={40}
                          className="w-[80%] h-auto"
                        />
                      </div>
                      <div
                        className="absolute inset-x-0 top-[9%] z-10 cursor-pointer"
                        onClick={toggleAllFlags}
                      >
                        <Image
                          src={
                            expandedFlags[columnIndex]
                              ? getExpandedFlagImage(columnIndex)
                              : "/zatvorena-500.png"
                          }
                          alt="GS Zastava"
                          width={180}
                          height={120}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                          {!expandedFlags[columnIndex] ? (
                            // Basic version
                            <>
                              <p
                                className="font-hadriatic-bold text-yellow-300 text-[20px] text-center sm:text-[20px] leading-tight mb-1"
                                style={{
                                  fontFamily: "var(--font-hadriatic-bold)",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                Welcome offer
                              </p>
                              <p
                                className="font-hadriatic-bold text-yellow-300 text-[12px] text-center sm:text-[20px] leading-tight mb-1"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                100% up to $500
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-0.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Wagering: 30 x DB
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-0.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max bet: 5
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-0.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max win: 10 x D
                              </p>
                            </>
                          ) : (
                            // Expanded version
                            <>
                              <p
                                className="font-hadriatic-bold text-yellow-300 text-[13px] text-center sm:text-[20px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-bold)",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                Welcome offer
                              </p>
                              <p
                                className="font-hadriatic-bold text-yellow-300 text-[12px] text-center sm:text-[20px] leading-tight mb-0.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                100% up to $500
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Wagering: 30 x DB
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max bet: 5
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max win: 10 x D
                              </p>
                              <div className="mt-1 border-t border-yellow-300/40 w-3/4"></div>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-1"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Time to wager: 7 days
                              </p>
                              <p
                                className="font-hadriatic-italic text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-italic)",
                                  letterSpacing: "0.12em",
                                }}
                              >
                                <span className="opacity-90">Casino terms</span>
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-1.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Easy verification
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Lots of games
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-1.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max win rule
                              </p>
                              <p
                                className="font-hadriatic-regular text-yellow-300 text-[12px] text-center sm:text-[16px] leading-tight mt-1.5"
                                style={{
                                  fontFamily: "var(--font-hadriatic-regular)",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Max withdraw 500 per day
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {rowIndex === 1 && (
                    <>
                      {/* Casumo logo above the flag - SECOND ROW */}
                      <div className="absolute inset-x-0 top-[-80px] z-10 flex justify-center">
                        <Image
                          src="/casumo.png"
                          alt="Casumo"
                          width={100}
                          height={40}
                          className="w-[80%] h-auto"
                        />
                      </div>
                      <div className="absolute inset-x-0 top-[9%] z-10 w-full">
                        <Image
                          src="/gs_zastava-06.png"
                          alt="GS Zastava 06"
                          width={180}
                          height={120}
                          className="w-full h-auto"
                        />
                      </div>
                    </>
                  )}
                  <Image
                    src={getPillarSrc()}
                    alt={`${affiliate.name} Pillar`}
                    width={300}
                    height={840}
                    className="w-full h-auto"
                    priority={rowIndex === 0}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // The background gradient style
  const gradientStyle = {
    background: `linear-gradient(${direction}, ${fromColor}, ${toColor})`,
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 md:py-24 pb-32 md:pb-40"
      style={{
        ...gradientStyle,
        minHeight: "350vh",
      }}
    >
      {/* Pattern overlay (like AboutSection) */}
      <div className="absolute inset-0 pattern-bg opacity-10 z-0"></div>

      {/* Subtle grain texture overlay (kept from previous) */}
      <div
        // Positioned slightly above pattern, below content
        className="absolute inset-0 opacity-10 z-1"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          mixBlendMode: "overlay",
        }}
      />

      {/* Color control toggle button */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={toggleControls}
          className="bg-secondary text-white px-3 py-2 rounded-full shadow-lg hover:bg-secondary-dark transition-colors"
        >
          {showControls ? "✕" : "🎨"}
        </button>
      </div>

      {/* Color control panel */}
      {showControls && (
        <div className="absolute top-16 right-4 z-40 w-80 flex flex-col gap-4">
          <GradientColorPicker
            fromColor={fromColor}
            toColor={toColor}
            direction={direction}
            onFromColorChange={setFromColor}
            onToColorChange={setToColor}
            onDirectionChange={setDirection}
            showViaColor={false}
            label="Affiliates Section Background"
          />
          <PillarStyleSelector
            selectedStyle={pillarStyle}
            onStyleChange={setPillarStyle}
          />
        </div>
      )}

      {/* Ensure content is above overlays */}
      <div className="container relative z-10 px-4 mx-auto md:px-6">
        <div className="flex justify-center w-full mb-24 md:mb-32">
          <div className="relative transform transition-transform duration-300 hover:scale-102 hover:-translate-y-1">
            <h2 className="relative px-10 py-5 text-2xl font-bold text-center text-white md:text-3xl lg:text-4xl bg-gradient-to-r from-red-800 via-rose-600 to-red-800 rounded-xl shadow-[0_15px_35px_rgba(225,29,72,0.5)] border border-rose-300/40 backdrop-blur-md overflow-hidden">
              <span className="relative z-10 tracking-wider text-shadow-red drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                VERIFIED AFFILIATES
              </span>
              <span className="absolute inset-0 bg-gradient-to-br from-red-500/40 to-rose-500/40 blur-[2px]"></span>
              <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></span>
              {/* Decorative elements */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_8px_2px_rgba(250,204,21,0.5)]"></span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_8px_2px_rgba(250,204,21,0.5)]"></span>
            </h2>
            {/* Enhanced glow effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 via-rose-500/40 to-red-600/10 rounded-xl blur-2xl -z-10 opacity-80 animate-pulse-slow"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 rounded-xl blur-md -z-10 opacity-90"></div>
          </div>
        </div>

        {/* Add keyframes animation for pulse-slow */}
        <style jsx global>{`
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 0.6;
            }
            50% {
              opacity: 0.9;
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .text-shadow-red {
            text-shadow: 0 0 15px rgba(255, 100, 100, 0.5);
          }
        `}</style>

        {/* Ensure grid isn't pushed down excessively by other styles */}
        <div className="relative mt-24 mx-auto">{renderPillarGrid()}</div>
      </div>
    </div>
  );
};

export default AffiliatesSection;
