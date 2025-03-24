"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";

const AffiliatesSection = () => {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const affiliatesRef = useRef<HTMLDivElement>(null);

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

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    if (affiliatesRef.current) {
      observer.observe(affiliatesRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
      if (affiliatesRef.current) {
        observer.unobserve(affiliatesRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, url: string) => {
    if (e.key === "Enter" || e.key === " ") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="w-full py-12 md:py-16 relative"
      style={{ background: "linear-gradient(to bottom, #c4261d, #a91e16)" }}
    >
      <div className="pattern-bg absolute inset-0 opacity-30"></div>

      {/* Decorative elements */}
      <div className="absolute left-0 bottom-0 w-full h-full overflow-hidden">
        <div className="absolute left-[10%] bottom-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>
        <div className="absolute right-[10%] bottom-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <h2
          ref={headerRef}
          className="text-2xl md:text-3xl font-bold text-center text-white mb-12 opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          VERIFIED AFFILIATES
        </h2>

        <div
          ref={affiliatesRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-0"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          {/* Affiliate 1 */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col items-center transition-transform hover:scale-105">
            <div
              className="cursor-pointer"
              onClick={() =>
                window.open(
                  "https://dublinbet.com",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onKeyDown={(e) => handleKeyDown(e, "https://dublinbet.com")}
              tabIndex={0}
              aria-label="Visit Dublinbet"
            >
              <Image
                src="/casino1.svg"
                alt="Dublinbet"
                width={180}
                height={60}
                className="mb-4"
              />
            </div>
            <div className="h-24 flex items-center justify-center">
              <p className="text-white text-center">
                Premier online casino offering a wide range of games and
                bonuses.
              </p>
            </div>
          </div>

          {/* Affiliate 2 */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col items-center transition-transform hover:scale-105">
            <div
              className="cursor-pointer"
              onClick={() =>
                window.open(
                  "https://www.casumo.com",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onKeyDown={(e) => handleKeyDown(e, "https://www.casumo.com")}
              tabIndex={0}
              aria-label="Visit Casumo"
            >
              <Image
                src="/casino2.svg"
                alt="Casumo"
                width={180}
                height={60}
                className="mb-4"
              />
            </div>
            <div className="h-24 flex items-center justify-center">
              <p className="text-white text-center">
                Award-winning casino known for innovative gameplay and rewarding
                promotions.
              </p>
            </div>
          </div>

          {/* Affiliate 3 */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg flex flex-col items-center transition-transform hover:scale-105">
            <div
              className="cursor-pointer"
              onClick={() =>
                window.open(
                  "https://www.ninecasino.com",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onKeyDown={(e) => handleKeyDown(e, "https://www.ninecasino.com")}
              tabIndex={0}
              aria-label="Visit Nine Casino"
            >
              <Image
                src="/casino1.svg"
                alt="Nine Casino"
                width={180}
                height={60}
                className="mb-4"
              />
            </div>
            <div className="h-24 flex items-center justify-center">
              <p className="text-white text-center">
                Modern casino platform with excellent user experience and
                diverse gaming options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesSection;
