"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

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
    const rowOffset = 35;

    const calculateVerticalOffset = (rowIndex: number) => {
      if (rowIndex === 0) return 0;

      // Define starting and target offsets for the animation
      const startingOffset = rowIndex === 1 ? 150 : 250; // Initial position
      const targetOffset = rowIndex === 1 ? -200 : -300; // Final position (MUCH more negative for higher)

      // Apply an easing function if desired. Example: cubic ease-in-out
      // easing function: 0 -> 0, 0.5 -> 0.5, 1 -> 1, smooth transition
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(scrollProgress); // Progress 0 to 1

      // Calculate total distance the pillar needs to travel
      const totalDistance = startingOffset - targetOffset;

      // Calculate how much the pillar has moved based on eased progress
      const moveAmount = totalDistance * easedProgress;

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
                  className="relative mb-[-75%] last:mb-0 w-32 sm:w-48 md:w-56 lg:w-64"
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
                              ? "/gs_zastava-800.png"
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
                              <p className="text-yellow-300 text-[13px] text-center sm:text-[15px] font-bold leading-tight mb-1">
                                Welcome offer
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-[14px] font-semibold leading-tight mb-1">
                                100% up to $500
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight mt-0.5">
                                Wagering: 30 x DB
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight mt-0.5">
                                Max bet: 5
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight mt-0.5">
                                Max win: 10 x D
                              </p>
                            </>
                          ) : (
                            // Expanded version
                            <>
                              <p className="text-yellow-300 text-[13px] text-center sm:text-[15px] font-bold leading-tight">
                                Welcome offer
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-[14px] font-semibold leading-tight mb-0.5">
                                100% up to $500
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight">
                                Wagering: 30 x DB
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight">
                                Max bet: 5
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight">
                                Max win: 10 x D
                              </p>
                              <div className="mt-1 border-t border-yellow-300/40 w-3/4"></div>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight mt-1">
                                Time to wager: 7 days
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold leading-tight">
                                <span className="opacity-90">Casino terms</span>
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold mt-1.5">
                                Easy verification
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold">
                                Lots of games
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold mt-1.5">
                                Max win rule
                              </p>
                              <p className="text-yellow-300 text-[12px] text-center sm:text-xs font-semibold">
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
                    src="/stup_2200_red.svg"
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

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 md:py-24"
      style={{
        // Use a red gradient similar to AboutSection's gold one
        background: "linear-gradient(to bottom right, #a91e16, #d42b1d)",
        // Keeping the large height is okay, it provides scroll room
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
      {/* Ensure content is above overlays */}
      <div className="container relative z-10 px-4 mx-auto md:px-6">
        <h2 className="mb-16 text-2xl font-bold text-center text-white md:text-3xl lg:text-4xl">
          VERIFIED AFFILIATES
        </h2>

        {/* Ensure grid isn't pushed down excessively by other styles */}
        <div className="relative mt-16 mx-auto">{renderPillarGrid()}</div>
      </div>
    </div>
  );
};

export default AffiliatesSection;
