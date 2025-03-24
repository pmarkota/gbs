"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";

const AboutSection = () => {
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slideUp");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (visionRef.current) {
      observer.observe(visionRef.current);
    }

    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      if (visionRef.current) {
        observer.unobserve(visionRef.current);
      }
      if (missionRef.current) {
        observer.unobserve(missionRef.current);
      }
    };
  }, []);

  return (
    <div
      className="w-full py-8 md:py-12"
      style={{ backgroundColor: "#d4af37" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-8 md:mb-12">
          ABOUT OUR COMPANY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Our Vision */}
          <div
            ref={visionRef}
            className="bg-secondary rounded-lg p-6 text-white opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            <div className="bg-white/20 rounded-lg p-4 mb-4 inline-block">
              <h3 className="text-xl font-bold text-center">OUR VISION</h3>
            </div>

            <p className="mb-4 text-center">
              OUR GOAL IS TO BECOME THE LEADING PLATFORM FOR CASINO SLOT PLAYERS
              SEEKING TO ENHANCE THEIR SKILLS, MAXIMIZE THEIR EARNINGS, AND
              MINIMIZE LOSSES.
            </p>

            <p className="text-center">
              WE STRIVE TO CREATE A SUPPORTIVE AND INNOVATIVE COMMUNITY WHERE
              PLAYERS CAN ACCESS EXPERT STRATEGIES, WATCH GAMEPLAY VIDEOS,
              STREAM PLAY, AND MAKE INFORMED GAMING DECISIONS.
            </p>

            <div className="mt-6 flex justify-center">
              <Image
                src="/tree.svg"
                alt="Decorative element"
                width={60}
                height={100}
                className="opacity-50"
              />
            </div>
          </div>

          {/* Our Mission */}
          <div
            ref={missionRef}
            className="bg-secondary rounded-lg p-6 text-white opacity-0"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <div className="bg-white/20 rounded-lg p-4 mb-4 inline-block">
              <h3 className="text-xl font-bold text-center">OUR MISSION</h3>
            </div>

            <p className="mb-4 text-center">
              TO EMPOWER CASINO SLOT PLAYERS WITH THE KNOWLEDGE, TOOLS, AND
              INSIGHTS THEY NEED TO ENHANCE THEIR GAMEPLAY AND MAXIMIZE THEIR
              WINNINGS.
            </p>

            <p className="text-center">
              THROUGH EXPERT GUIDANCE, EDUCATIONAL CONTENT, AND ADVANCED
              GAMEPLAY ANALYSIS, WE HELP PLAYERS MAKE INFORMED DECISIONS,
              DEVELOP SMARTER GAMING HABITS, AND ENJOY A MORE REWARDING
              EXPERIENCE.
            </p>

            <div className="mt-6 flex justify-center">
              <Image
                src="/tree.svg"
                alt="Decorative element"
                width={60}
                height={100}
                className="opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
