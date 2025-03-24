"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser, removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({ username: currentUser.username });
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleToggleMenu();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-opacity-95 backdrop-blur-sm shadow-lg" : "bg-opacity-100"
      }`}
      style={{ backgroundColor: "#d4af37" }}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Link href="/" className="flex items-center">
            <Image
              src="/GSlogo.svg"
              alt="GambleShield Logo"
              width={40}
              height={40}
              className="mr-2 drop-shadow-md"
            />
            <span className="text-black font-bold text-xl drop-shadow-sm">
              GAMBLE<span className="font-normal">SHIELD</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/"
              className="text-black font-medium hover:text-gray-800 transition-colors"
            >
              HOME
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/about"
              className="text-black font-medium hover:text-gray-800 transition-colors"
            >
              ABOUT
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/affiliates"
              className="text-black font-medium hover:text-gray-800 transition-colors"
            >
              AFFILIATES
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/blog"
              className="text-black font-medium hover:text-gray-800 transition-colors"
            >
              BLOG
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/support"
              className="text-black font-medium hover:text-gray-800 transition-colors"
            >
              SUPPORT
            </Link>
          </motion.div>
        </nav>

        {/* Login/Logout button */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-black font-medium">
                Welcome, {user.username}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md"
                tabIndex={0}
                aria-label="Logout"
              >
                LOGOUT
              </motion.button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth"
                className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md"
                tabIndex={0}
                aria-label="Login or register"
              >
                LOGIN
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile menu button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 focus:outline-none"
          onClick={handleToggleMenu}
          onKeyDown={handleKeyDown}
          aria-label="Toggle menu"
          tabIndex={0}
        >
          <div className="w-6 h-0.5 bg-black mb-1.5"></div>
          <div className="w-6 h-0.5 bg-black mb-1.5"></div>
          <div className="w-6 h-0.5 bg-black"></div>
        </motion.button>
      </div>

      {/* Mobile menu */}
      <motion.div
        animate={{
          maxHeight: isMenuOpen ? "500px" : "0px",
          opacity: isMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-primary border-t border-black/10 overflow-hidden"
        style={{ backgroundColor: "#d4af37" }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link
            href="/"
            className="text-black font-medium hover:text-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            HOME
          </Link>
          <Link
            href="/about"
            className="text-black font-medium hover:text-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            ABOUT
          </Link>
          <Link
            href="/affiliates"
            className="text-black font-medium hover:text-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            AFFILIATES
          </Link>
          <Link
            href="/blog"
            className="text-black font-medium hover:text-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            BLOG
          </Link>
          <Link
            href="/support"
            className="text-black font-medium hover:text-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            SUPPORT
          </Link>
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-black font-medium hover:text-gray-800 transition-colors text-left"
            >
              LOGOUT
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-black font-medium hover:text-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              LOGIN
            </Link>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
