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

  return <></>;
};

export default AboutSection;
