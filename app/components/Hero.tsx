"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    if (btnRef.current) {
      observer.observe(btnRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
      if (btnRef.current) {
        observer.unobserve(btnRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      const link = e.currentTarget as HTMLAnchorElement;
      link.click();
    }
  };

  return (
    <div
      className="relative w-full mt-16 pt-8 pb-16 md:pt-16 md:pb-24"
      style={{ background: "linear-gradient(to bottom, #c4261d, #a91e16)" }}
    >
      <div className="pattern-bg absolute inset-0 opacity-30"></div>

      {/* Decorative columns */}
      <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
        <div className="absolute left-[5%] top-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>
        <div className="absolute left-[15%] top-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>
        <div className="absolute right-[5%] top-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>
        <div className="absolute right-[15%] top-0 opacity-30 hidden md:block">
          <Image
            src="/column.svg"
            alt="Decorative column"
            width={30}
            height={300}
          />
        </div>

        {/* Decorative trees */}
        <div className="absolute left-[30%] top-[50%] opacity-70 hidden md:block">
          <Image src="/tree.svg" alt="Decorative tree" width={30} height={60} />
        </div>
        <div className="absolute right-[30%] top-[60%] opacity-70 hidden md:block">
          <Image src="/tree.svg" alt="Decorative tree" width={30} height={60} />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div
            ref={textRef}
            className="opacity-0"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Shield Your Game,
              <br />
              Boost Your Wins!
            </h1>
            <p className="text-md md:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              With Gamble Shield, you don't just play — you play better, smarter
              and more profitably! Join us today and unlock your true potential
              in the world of casino slots.
            </p>
          </div>

          <Link
            href="/registration"
            ref={btnRef}
            className="inline-block bg-primary hover:bg-primary-light text-black font-bold py-3 px-8 rounded transition-colors duration-300 opacity-0 animate-pulse"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Register now"
          >
            REGISTRATION
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
