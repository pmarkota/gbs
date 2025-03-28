"use client";

import React, { useRef, useEffect, useState, CSSProperties } from "react";
import Image from "next/image";

type AffiliateType = {
  id: number;
  name: string;
  logo: string;
  url: string;
};

// Custom style type that includes pointerEvents
type RowStyle = CSSProperties & {
  pointerEvents: "auto" | "none";
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
];

const AffiliatesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Function to handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, url: string) => {
    if (e.key === "Enter" || e.key === " ") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollPercent =
          1 - Math.max(0, Math.min(1, rect.top / (window.innerHeight * 0.8)));
        setScrollPosition(scrollPercent);
      }
    };

    window.addEventListener("scroll", updateScrollPosition);
    window.addEventListener("resize", updateScrollPosition);

    // Initial update
    updateScrollPosition();

    return () => {
      window.removeEventListener("scroll", updateScrollPosition);
      window.removeEventListener("resize", updateScrollPosition);
    };
  }, []);

  // Calculate which row is visible based on scroll position
  const getRowVisibility = (rowIndex: number) => {
    // All rows have full opacity when they appear
    if (scrollPosition < 0.25 && rowIndex > 0) {
      return 0; // Only first row visible initially
    }

    if (scrollPosition < 0.7 && rowIndex > 1) {
      return 0; // First and second row visible until 70% scroll
    }

    return 1; // Full opacity when visible
  };

  // Calculate translation and z-index for each row
  const getRowStyles = (rowIndex: number): RowStyle => {
    const visibility = getRowVisibility(rowIndex);

    // Base positions - all rows start below the viewport
    const basePosition = 150; // Start position below viewport (in vh)

    // Each row has a base position where it should end up - adjusted spacing for proper overlap
    const finalPositions = [0, 30, 60]; // Increased spacing to reduce overlap

    // Calculate transition progress for each row
    let progress = 0;

    if (rowIndex === 0) {
      // First row is instantly in position
      progress = 1;
    } else if (rowIndex === 1) {
      // Second row starts moving when scroll is 0.25 and completes at 0.55 (further delayed)
      progress = Math.max(0, Math.min(1, (scrollPosition - 0.25) / 0.3));
    } else if (rowIndex === 2) {
      // Third row starts moving when scroll is 0.7 and completes at 1.0 (further delayed)
      progress = Math.max(0, Math.min(1, (scrollPosition - 0.7) / 0.3));
    }

    // Calculate position with smooth easing
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easedProgress = easeInOutCubic(progress);

    // Lerp between start and end positions
    const yPosition =
      basePosition - (basePosition - finalPositions[rowIndex]) * easedProgress;

    // Z-index ensures proper stacking
    const zIndex = rowIndex * 10;

    return {
      opacity: visibility,
      transform: `translateY(${yPosition}vh)`,
      zIndex,
      pointerEvents: visibility > 0.5 ? "auto" : "none",
    };
  };

  // Render a row of pillars
  const renderRow = (startIndex: number, rowIndex: number) => {
    const rowStyles = getRowStyles(rowIndex);
    const opacityValue = Number(rowStyles.opacity);
    const isRowActive = !isNaN(opacityValue) && opacityValue > 0.5;

    return (
      <div
        className="absolute left-0 right-0 flex justify-center gap-4 transition-all duration-700 ease-in-out md:gap-8 lg:gap-12"
        style={rowStyles}
      >
        {affiliates
          .slice(startIndex, startIndex + 3)
          .map((affiliate, index) => (
            <div
              key={affiliate.id}
              className="relative flex flex-col items-center"
              style={{
                transitionDelay: `${index * 200}ms`,
                transform: isVisible ? "translateY(0)" : "translateY(50px)",
                opacity: isVisible ? 1 : 0,
                transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
              }}
            >
              <div className="relative">
                {/* Pillar image */}
                <Image
                  src="/stup_black_1200.svg"
                  alt="Pillar"
                  width={250}
                  height={700}
                  className="w-56 h-auto md:w-72 lg:w-80"
                  priority={rowIndex === 0}
                />

                {/* Plain black rectangle without icons */}
                <div
                  className={`absolute top-[12%] left-1/2 -translate-x-1/2 w-[80%] aspect-square  rounded-sm cursor-pointer transition-transform hover:scale-105 ${
                    isRowActive ? "animate-pulse" : ""
                  }`}
                  onClick={() =>
                    window.open(affiliate.url, "_blank", "noopener,noreferrer")
                  }
                  onKeyDown={(e) => handleKeyDown(e, affiliate.url)}
                  tabIndex={isRowActive ? 0 : -1}
                  aria-label={`Visit ${affiliate.name}`}
                >
                  {/* No content - just empty black squares */}
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #c4261d, #a91e16)",
        minHeight: "180vh", // Increased space for scrolling
      }}
    >
      <div className="absolute inset-0 pattern-bg opacity-30"></div>

      <div className="container relative z-10 px-4 pt-24 mx-auto md:px-6">
        <h2 className="mb-24 text-2xl font-bold text-center text-white md:text-3xl animate-fadeIn">
          VERIFIED AFFILIATES
        </h2>

        <div className="relative h-[140vh]">
          {renderRow(0, 0)}
          {renderRow(3, 1)}
          {renderRow(6, 2)}
        </div>
      </div>
    </div>
  );
};

export default AffiliatesSection;
