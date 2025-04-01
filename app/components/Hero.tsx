"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const Hero = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

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
        style={{
          backgroundColor: "#d42b1d", // Red background
        }}
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
            backgroundImage: "url('/homeGS-01.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Content Container */}
        <div className="container relative z-30 flex flex-col h-full px-4 mx-auto">
          {/* Title text in center */}
          <div className="absolute left-1/2 top-[20%] transform -translate-x-1/2 text-center max-w-md">
            <h1 className="text-3xl font-bold text-black md:text-3xl">
              {user ? "Welcome Back, You!" : "Shield Your Game,"}
              <br />
              <span className="block mt-2">
                {user ? "Ready To Win Today?" : "Boost Your Wins!"}
              </span>
            </h1>
          </div>

          {/* Text content on right side */}
          <div className="absolute top-[10%] right-5 md:right-10 max-w-xs text-right">
            <p className="text-lg font-bold leading-tight text-center text-white md:text-base">
              With Gamble Shield, you don&apos;t just play — you play better,
              smarter, and more profitably.
              <br />
              <br />
              Join us today and unlock your true potential in the world of
              casino slots.
            </p>
          </div>

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

      {/* Full width yellow section with wave top */}
      <div className="relative w-full pb-16 bg-primary">
        {/* About Our Company heading */}
        <div className="container px-4 pt-12 pb-8 mx-auto">
          <h2 className="text-4xl font-bold text-center text-black">
            ABOUT OUR COMPANY
            <div className="h-1 mx-auto mt-2 w-80 bg-black/50"></div>
          </h2>
        </div>

        {/* Company info cards */}
        <div className="container grid grid-cols-1 gap-8 px-4 mx-auto md:grid-cols-2">
          {/* Vision Card */}
          <div className="p-6 rounded-lg shadow-lg bg-secondary">
            <h3 className="inline-block px-4 py-2 mb-4 text-2xl font-bold text-white rounded bg-secondary/70">
              OUR VISION
            </h3>
            <p className="mb-4 text-white">
              OUR GOAL IS TO BECOME THE LEADING PLATFORM FOR CASINO SLOT PLAYERS
              SEEKING TO ENHANCE THEIR SKILLS, MAXIMIZE THEIR EARNINGS, AND
              MINIMIZE LOSSES.
            </p>
            <p className="text-white">
              WE STRIVE TO CREATE A SUPPORTIVE AND INNOVATIVE COMMUNITY WHERE
              PLAYERS CAN ACCESS EXPERT STRATEGIES, WATCH GAMEPLAY VIDEOS,
              STREAM PLAY, AND MAKE INFORMED GAMING DECISIONS.
            </p>
          </div>

          {/* Mission Card */}
          <div className="p-6 rounded-lg shadow-lg bg-secondary">
            <h3 className="inline-block px-4 py-2 mb-4 text-2xl font-bold text-white rounded bg-secondary/70">
              OUR MISSION
            </h3>
            <p className="mb-4 text-white">
              TO EMPOWER CASINO SLOT PLAYERS WITH THE KNOWLEDGE, TOOLS, AND
              INSIGHTS THEY NEED TO ENHANCE THEIR GAMEPLAY AND MAXIMIZE THEIR
              WINNINGS.
            </p>
            <p className="text-white">
              THROUGH EXPERT GUIDANCE, EDUCATIONAL CONTENT, AND ADVANCED
              GAMEPLAY ANALYSIS, WE HELP PLAYERS MAKE INFORMED DECISIONS,
              DEVELOP SMARTER GAMING HABITS, AND ENJOY A MORE REWARDING
              EXPERIENCE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
