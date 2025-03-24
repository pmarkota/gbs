"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full py-6 md:py-8"
      style={{ backgroundColor: "#d4af37" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/GSlogo.svg"
              alt="GambleShield Logo"
              width={30}
              height={30}
              className="mr-2 drop-shadow-md"
            />
            <span className="text-black font-bold drop-shadow-sm">
              GAMBLE<span className="font-normal">SHIELD</span>
            </span>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            <motion.div
              whileHover={{ scale: 1.1, color: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="text-black text-sm hover:underline">
                Home
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/about"
                className="text-black text-sm hover:underline"
              >
                About
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/affiliates"
                className="text-black text-sm hover:underline"
              >
                Affiliates
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/blog" className="text-black text-sm hover:underline">
                Blog
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: "#000" }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/support"
                className="text-black text-sm hover:underline"
              >
                Support
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-black text-sm font-medium"
          >
            &copy; {currentYear} GambleShield. All rights reserved.
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-center text-black/70 text-xs"
        >
          <p>
            Gambling can be addictive. Please play responsibly. For help and
            support with gambling addiction, please visit{" "}
            <Link
              href="/responsible-gaming"
              className="underline hover:text-black transition-colors"
            >
              Responsible Gaming
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
