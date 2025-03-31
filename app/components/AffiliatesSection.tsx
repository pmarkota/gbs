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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate how far the section is scrolled into view
        const topOffset = rect.top;

        // Significantly delay animation start - only begin when section is 50% into viewport
        // End when section is further scrolled (90% of viewport height)
        let progress =
          1 -
          Math.max(
            0,
            Math.min(
              1,
              (topOffset - viewportHeight * 0.5) / (viewportHeight * 0.4)
            )
          );
        progress = Math.max(0, Math.min(1, progress));

        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Get number of items per row based on screen size
  const getItemsPerRow = () => {
    if (windowWidth < 768) {
      return 2; // Small devices: 2 items
    } else if (windowWidth < 1024) {
      return 3; // Medium devices: 3 items
    } else {
      return 5; // Large devices: 5 items
    }
  };

  // Render the affiliates grid
  const renderPillarGrid = () => {
    const itemsPerRow = getItemsPerRow();
    const columns = Array.from({ length: itemsPerRow }, (_, i) => i);

    // Calculate the horizontal offset value for each row
    const rowOffset = 30; // pixels to shift each row to the right (increased from 15)

    // Vertical animation calculations
    const calculateVerticalOffset = (rowIndex: number) => {
      if (rowIndex === 0) return 0; // First row stays in place

      // Higher starting positions for even more dramatic movement
      const startingOffset = rowIndex === 1 ? 250 : 450; // Further increased for later appearance

      // Slower animation speeds to make animation last longer during scroll
      const speed = rowIndex === 1 ? 1.4 : 1.2;

      // Stronger easing for even more delayed initial movement
      const easedProgress = Math.pow(scrollProgress, 0.6);

      // Calculate how much to move based on scroll progress and speed
      const moveAmount = startingOffset * easedProgress * speed;

      // Clamp the movement to not exceed the starting offset
      return Math.max(0, startingOffset - moveAmount);
    };

    return (
      <div className="flex justify-center gap-4 md:gap-6 lg:gap-8">
        {columns.map((columnIndex) => (
          <div
            key={`column-${columnIndex}`}
            className="flex flex-col items-center"
          >
            {/* Each column has 3 pillars stacked vertically with increasing right offset */}
            {[0, 1, 2].map((rowIndex) => {
              const affiliateIndex = rowIndex * itemsPerRow + columnIndex;
              if (affiliateIndex >= affiliates.length) return null;

              const affiliate = affiliates[affiliateIndex];

              // Calculate x offset based on row index - static horizontal positioning
              const xOffset = rowIndex * rowOffset;

              // Calculate y offset for animation
              const yOffset = calculateVerticalOffset(rowIndex);

              return (
                <div
                  key={`pillar-${affiliateIndex}`}
                  className="relative mb-[-75%] last:mb-0" // Even more negative margin for tighter stacking
                  style={{
                    marginLeft: `${xOffset}px`, // Offset each row to the right
                    transform: `translateY(${yOffset}px)`, // Animate vertical position
                    transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)", // Adjusted easing for better movement
                  }}
                >
                  <Image
                    src="/stup_black_1200.svg"
                    alt={`${affiliate.name} Pillar`}
                    width={250}
                    height={700}
                    className="w-28 h-auto sm:w-32 md:w-44 lg:w-48"
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
        background: "linear-gradient(to bottom, #c4261d, #a91e16)",
        minHeight: "180vh", // Further increased for more scrolling space
      }}
    >
      <div className="absolute inset-0 pattern-bg opacity-30"></div>

      <div className="container relative z-10 px-4 mx-auto md:px-6">
        <h2 className="mb-16 text-2xl font-bold text-center text-white md:text-3xl">
          VERIFIED AFFILIATES
        </h2>

        <div className="relative mt-16 mx-auto">{renderPillarGrid()}</div>
      </div>
    </div>
  );
};

export default AffiliatesSection;
