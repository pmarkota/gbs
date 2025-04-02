"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import GradientColorPicker, { GradientDirection } from "./GradientColorPicker";

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  // Gradient control states
  const [fromColor, setFromColor] = useState("#d4af37");
  const [viaColor, setViaColor] = useState("#d4af37");
  const [toColor, setToColor] = useState("#f1c40f");
  const [direction, setDirection] =
    useState<GradientDirection>("to bottom right");

  // Define fixed positions for floating shapes to prevent hydration mismatch
  const floatingShapes = [
    {
      width: 150,
      height: 150,
      left: "10%",
      top: "20%",
      xValues: [-20, 20, -10],
      yValues: [-15, 15, -5],
    },
    {
      width: 200,
      height: 200,
      left: "30%",
      top: "70%",
      xValues: [15, -15, 10],
      yValues: [10, -20, 15],
    },
    {
      width: 120,
      height: 120,
      left: "70%",
      top: "15%",
      xValues: [-25, 10, -15],
      yValues: [20, -10, 5],
    },
    {
      width: 180,
      height: 180,
      left: "80%",
      top: "60%",
      xValues: [10, -20, 15],
      yValues: [-10, 25, -15],
    },
    {
      width: 100,
      height: 100,
      left: "20%",
      top: "40%",
      xValues: [20, -10, 15],
      yValues: [-15, 10, -5],
    },
    {
      width: 160,
      height: 160,
      left: "60%",
      top: "80%",
      xValues: [-10, 15, -20],
      yValues: [15, -5, 10],
    },
  ];

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // The background gradient style
  const gradientStyle = {
    background: `linear-gradient(${direction}, ${fromColor}, ${viaColor}, ${toColor})`,
  };

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full py-20 md:py-28 relative overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 z-0" style={gradientStyle}></div>

      {/* Decorative patterns */}
      <div className="absolute inset-0 pattern-bg opacity-10 z-10"></div>

      {/* Animated floating shapes with fixed positions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white opacity-20"
            initial={{
              x: 0,
              y: 0,
              scale: 0.3,
            }}
            animate={{
              x: shape.xValues,
              y: shape.yValues,
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            style={{
              width: shape.width,
              height: shape.height,
              left: shape.left,
              top: shape.top,
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 md:px-6 relative z-30">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="inline-block text-3xl md:text-4xl font-bold text-black relative">
            ABOUT OUR COMPANY
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={isVisible ? { width: "100%" } : { width: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="flex justify-center"
        >
          {/* Our Mission Card - Only keeping this one */}
          <motion.div
            variants={cardVariants}
            className="relative group max-w-3xl"
          >
            <div className="absolute inset-0 bg-secondary rounded-xl transform -rotate-1 opacity-70 group-hover:-rotate-2 transition-transform duration-300"></div>
            <div className="relative bg-secondary rounded-xl p-8 shadow-lg transform group-hover:rotate-1 transition-transform duration-300 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-white rounded-full opacity-5 blur-xl"></div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 inline-block shadow-inner">
                <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                  OUR MISSION
                </h3>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <p className="mb-6 text-white/90 text-lg leading-relaxed">
                  TO EMPOWER CASINO SLOT PLAYERS WITH THE KNOWLEDGE, TOOLS, AND
                  INSIGHTS THEY NEED TO ENHANCE THEIR GAMEPLAY AND MAXIMIZE
                  THEIR WINNINGS.
                </p>

                <p className="text-white/90 text-lg leading-relaxed">
                  THROUGH EXPERT GUIDANCE, EDUCATIONAL CONTENT, AND ADVANCED
                  GAMEPLAY ANALYSIS, WE HELP PLAYERS MAKE INFORMED DECISIONS,
                  DEVELOP SMARTER GAMING HABITS, AND ENJOY A MORE REWARDING
                  EXPERIENCE.
                </p>
              </motion.div>

              <motion.div
                className="mt-6 flex justify-center"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/tree.svg"
                  alt="Decorative element"
                  width={80}
                  height={80}
                  className="opacity-40 drop-shadow-glow"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

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
        <div className="absolute top-16 right-4 z-40 w-80">
          <GradientColorPicker
            fromColor={fromColor}
            viaColor={viaColor}
            toColor={toColor}
            direction={direction}
            onFromColorChange={setFromColor}
            onViaColorChange={setViaColor}
            onToColorChange={setToColor}
            onDirectionChange={setDirection}
            showViaColor={true}
            label="About Section Background"
          />
        </div>
      )}

      {/* Decorative elements at the bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden h-20 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="relative block w-full"
        >
          <path
            fill="#a91e16"
            fillOpacity="1"
            d="M0,64L48,101.3C96,139,192,213,288,224C384,235,480,181,576,149.3C672,117,768,107,864,122.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </motion.div>
  );
};

export default AboutSection;
