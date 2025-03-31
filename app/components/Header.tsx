"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser, removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ username: string; role?: string } | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        username: currentUser.username,
        role: currentUser.role,
      });
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);

    // Dispatch auth change event
    window.dispatchEvent(new Event("authChange"));

    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggleMenu();
    }
  };

  // Navbar items with metadata for hover effects
  const navItems = [
    { name: "HOME", path: "/", delay: 0 },
    { name: "ABOUT", path: "/about", delay: 0.1 },
    { name: "AFFILIATES", path: "/affiliates", delay: 0.2 },
    { name: "BLOG", path: "/blog", delay: 0.3 },
    { name: "SUPPORT", path: "/support", delay: 0.4 },
  ];

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-lg shadow-[0_5px_30px_rgba(212,175,55,0.25)]"
          : "bg-transparent"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 transition-opacity duration-500 ${
          scrolled ? "opacity-100" : ""
        }`}
      ></div>

      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center relative z-10">
        {/* Logo section with enhanced animations */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative"
        >
          <Link href="/" className="flex items-center">
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(212, 175, 55, 0.3)",
                    "0 0 20px rgba(212, 175, 55, 0.5)",
                    "0 0 10px rgba(212, 175, 55, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="absolute inset-0 rounded-full"
              />
              <div className="relative z-10">
                <Image
                  src="/GSlogo.svg"
                  alt="GambleShield Logo"
                  width={45}
                  height={45}
                  style={{ height: "auto" }}
                  className="drop-shadow-gold"
                />
              </div>
            </div>
            <div className="flex flex-col ml-3">
              <span className="text-white font-bold text-xl tracking-wider">
                GAMBLE
                <span className="text-primary font-semibold">SHIELD</span>
              </span>
              <motion.div
                className="h-0.5 bg-primary"
                initial={{ width: 0 }}
                animate={{ width: scrolled ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </Link>
        </motion.div>

        {/* Desktop menu with enhanced hover effects */}
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.3 }}
              className="relative group"
            >
              <Link
                href={item.path}
                className="text-white hover:text-primary transition-colors duration-200 py-2 px-3 relative overflow-hidden flex flex-col items-center"
              >
                <span className="relative z-10">{item.name}</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-primary rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="absolute inset-0 bg-white/5 rounded-md"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>

              {/* Glowing dot indicator for current page */}
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
                animate={{
                  boxShadow: [
                    "0 0 3px 1px rgba(212, 175, 55, 0.3)",
                    "0 0 5px 2px rgba(212, 175, 55, 0.6)",
                    "0 0 3px 1px rgba(212, 175, 55, 0.3)",
                  ],
                }}
              />
            </motion.div>
          ))}

          {/* Admin Dashboard Link - Only visible to admin users */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="relative group"
            >
              <Link
                href="/admin"
                className="text-primary hover:text-primary-light transition-colors duration-200 py-2 px-3 relative overflow-hidden flex flex-col items-center"
              >
                <span className="relative z-10 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-1" />
                  ADMIN
                </span>
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-primary rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="absolute inset-0 bg-primary/5 rounded-md"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>

              {/* Glowing dot indicator */}
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
                animate={{
                  boxShadow: [
                    "0 0 3px 1px rgba(212, 175, 55, 0.3)",
                    "0 0 5px 2px rgba(212, 175, 55, 0.6)",
                    "0 0 3px 1px rgba(212, 175, 55, 0.3)",
                  ],
                }}
              />
            </motion.div>
          )}
        </nav>

        {/* Login/Logout button with enhanced effects */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center space-x-4">
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white text-sm"
              >
                Welcome,{" "}
                <span className="text-primary font-medium">
                  {user.username}
                </span>
              </motion.span>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(196, 38, 29, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-gradient-to-r from-secondary-dark to-secondary hover:from-secondary hover:to-secondary-dark text-white font-medium py-2 px-6 rounded-md shadow-md relative overflow-hidden"
                tabIndex={0}
                aria-label="Logout"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                LOGOUT
              </motion.button>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-md blur-sm opacity-70"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
              <Link
                href="/auth"
                className="relative bg-gradient-to-r from-secondary-dark to-secondary hover:from-secondary hover:to-secondary-dark text-white font-medium py-2 px-6 rounded-md block shadow-md overflow-hidden"
                tabIndex={0}
                aria-label="Login or register"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                LOGIN
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile menu button with enhanced hamburger animation */}
        <motion.button
          className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center focus:outline-none"
          onClick={handleToggleMenu}
          onKeyDown={handleKeyDown}
          aria-label="Toggle menu"
          tabIndex={0}
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <motion.div
              animate={
                isMenuOpen
                  ? { rotate: 45, y: 8, backgroundColor: "#ffffff" }
                  : {
                      rotate: 0,
                      y: 0,
                      backgroundColor: scrolled ? "#ffffff" : "#ffffff",
                    }
              }
              transition={{ duration: 0.3 }}
              className="w-full h-0.5 rounded-full bg-white"
            />
            <motion.div
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-0.5 rounded-full bg-white"
            />
            <motion.div
              animate={
                isMenuOpen
                  ? { rotate: -45, y: -8, backgroundColor: "#ffffff" }
                  : {
                      rotate: 0,
                      y: 0,
                      backgroundColor: scrolled ? "#ffffff" : "#ffffff",
                    }
              }
              transition={{ duration: 0.3 }}
              className="w-full h-0.5 rounded-full bg-white"
            />
          </div>
        </motion.button>
      </div>

      {/* Mobile menu with enhanced slide animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-primary/20 overflow-hidden absolute w-full z-40"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pattern-bg opacity-5"
            />

            <div className="container mx-auto px-4 py-6 relative z-10">
              <div className="flex flex-col space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden"
                  >
                    <Link
                      href={item.path}
                      className="text-white hover:text-primary transition-colors flex items-center py-3 px-2 border-b border-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: 3 }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.2 }}
                        className="h-5 bg-primary rounded-full mr-3"
                      />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Admin Dashboard Link in mobile menu - Only visible to admin users */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                    className="relative overflow-hidden"
                  >
                    <Link
                      href="/admin"
                      className="text-primary hover:text-primary-light transition-colors flex items-center py-3 px-2 border-b border-white/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: 3 }}
                        transition={{
                          delay: navItems.length * 0.1 + 0.3,
                          duration: 0.2,
                        }}
                        className="h-5 bg-primary rounded-full mr-3"
                      />
                      <ShieldCheckIcon className="w-5 h-5 mr-1" />
                      ADMIN DASHBOARD
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-3">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/70 text-sm px-2"
                    >
                      Logged in as{" "}
                      <span className="text-primary">{user.username}</span>
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-secondary-dark to-secondary text-white w-full font-medium px-4 py-3 rounded-md shadow-md"
                    >
                      LOGOUT
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      href="/auth"
                      className="bg-gradient-to-r from-secondary-dark to-secondary text-white font-medium px-4 py-3 rounded-md block text-center shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
