"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/auth";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
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
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Check if user is logged in
    checkUserStatus();

    // Listen for auth changes
    window.addEventListener("authChange", checkUserStatus);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
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

  // Fixed positions for decorative columns
  const columnPositions = [
    { left: "5%", top: "0" },
    { left: "15%", top: "0" },
    { right: "5%", top: "0" },
    { right: "15%", top: "0" },
  ];

  // Fixed positions for decorative trees
  const treePositions = [
    { left: "30%", top: "50%" },
    { right: "30%", top: "60%" },
  ];

  // Animation variants with corrected easing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const decorationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 0.5,
      scale: 1,
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  const statsItems = [
    { label: "Happy Players", value: "10K+", icon: "👥" },
    { label: "Success Rate", value: "85%", icon: "📈" },
    { label: "Avg. Profit", value: "+120%", icon: "💰" },
  ];

  // Action buttons for logged-in users
  const loggedInActions = [
    {
      label: "MY PROFILE",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/dashboard",
      primary: true,
    },
    {
      label: "WATCH VIDEOS",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/videos",
      primary: false,
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="relative w-full mt-16 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at center, #d42b1d 0%, #a91e16 100%)",
      }}
    >
      {/* 3D Casino chip background pattern */}
      <div className="absolute inset-0 pattern-bg opacity-20"></div>

      {/* Particle effect overlay */}
      <div className="absolute inset-0 bg-particle-overlay pointer-events-none"></div>

      {/* Animated cards floating in background */}
      <div className="absolute inset-0 overflow-hidden">
        {[1, 2, 3, 4].map((_, index) => (
          <motion.div
            key={`card-${index}`}
            className="absolute"
            initial={{
              x: index % 2 === 0 ? -100 : "100vw",
              y: 100 + index * 150,
              rotate: index % 2 === 0 ? -10 : 10,
              opacity: 0,
            }}
            animate={{
              x: index % 2 === 0 ? "110vw" : -100,
              y: 50 + index * 150,
              rotate: index % 2 === 0 ? 10 : -10,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 20 + index * 5,
              repeat: Infinity,
              delay: index * 2,
            }}
          >
            <div
              className="w-16 h-24 md:w-24 md:h-36 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20"
              style={{
                backgroundImage: "url('/cards.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Glowing orb behind main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.1) 60%, rgba(212,175,55,0) 100%)",
          boxShadow: "0 0 100px 50px rgba(212,175,55,0.3)",
        }}
      />

      {/* Decorative columns with animations */}
      <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
        {columnPositions.map((pos, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={decorationVariants}
            className="absolute top-0 opacity-50 hidden md:block"
            style={pos}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Image
                src="/column.svg"
                alt="Decorative column"
                width={35}
                height={35}
                style={{ height: "auto", maxHeight: "350px" }}
                className="drop-shadow-glow"
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Decorative trees with animations */}
        {treePositions.map((pos, i) => (
          <motion.div
            key={`tree-${i}`}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={decorationVariants}
            className="absolute opacity-70 hidden md:block"
            style={pos}
          >
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            >
              <Image
                src="/tree.svg"
                alt="Decorative tree"
                width={40}
                height={40}
                style={{ height: "auto" }}
                className="drop-shadow-glow"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-8 relative z-10">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="mb-2">
              <motion.span
                className="inline-block px-4 py-1 bg-primary/20 text-primary text-sm md:text-base rounded-full backdrop-blur-sm border border-primary/30"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                #1 PLATFORM FOR SLOT ENTHUSIASTS
              </motion.span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-text">
              <span className="relative inline-block">
                {user ? `Welcome Back, ${user.username}!` : "Shield Your Game,"}
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </span>
              <br />
              <span className="relative inline-block mt-2">
                {user ? "Ready To Win Today?" : "Boost Your Wins!"}
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                />
              </span>
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-white/90 mt-8 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {user
                ? "Access your profile, watch educational videos, and continue your winning journey with our advanced tools and insights."
                : "With Gamble Shield, you don't just play — you play better, smarter and more profitably! Join us today and unlock your true potential in the world of casino slots."}
            </motion.p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {user ? (
              // Show different action buttons for logged-in users
              loggedInActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href={action.href}
                    className={`relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold rounded-md ${
                      action.primary
                        ? "bg-primary text-black shadow-gold-inner"
                        : "bg-transparent text-white border-2 border-white/30 hover:bg-white/10"
                    } transition-colors duration-300`}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-label={action.label}
                  >
                    {action.primary && (
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    )}
                    <span className="relative flex items-center">
                      {action.icon}
                      {action.label}
                      {action.primary && (
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </motion.svg>
                      )}
                    </span>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Show registration and videos buttons for non-logged-in users
              <>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/registration"
                    className="relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-bold bg-primary text-black rounded-md shadow-gold-inner group"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-label="Register now"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      JOIN NOW
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/videos"
                    className="relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold border-2 border-white/30 text-white bg-transparent rounded-md group hover:bg-white/10 transition-colors duration-300"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-label="Watch videos"
                  >
                    <span className="relative flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                </motion.div>
              </>
            )}
          </div>

          {/* Animated stats section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto"
          >
            {statsItems.map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index + 1.9, duration: 0.5 }}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {item.value}
                </div>
                <div className="text-xs md:text-sm text-white/80">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="flex justify-center items-center gap-6 mt-12 flex-wrap"
          >
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-primary mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-white/80">SSL Secured</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-primary mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-white/80">Trusted Community</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-primary mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M15.22 6.268a.75.75 0 01.44.68V18a.75.75 0 01-1.5 0V7.838l-1.22.122a.75.75 0 11-.15-1.492l2.25-.225a.75.75 0 01.68.44zM8.58 7.22a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V7.97a.75.75 0 01.75-.75zm2.25 3a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm2.25-1.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zm2.25-3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.47a.75.75 0 01.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-white/80">Live Stats</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0"
        >
          <path
            fill="#d4af37"
            fillOpacity="1"
            d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,154.7C672,171,768,181,864,170.7C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
