"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// Form types
type AuthMode = "login" | "register";

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle register form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        // Call login API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginForm),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Show success animation
        setShowSuccess(true);

        // Save token to localStorage
        saveToken(data.token);

        // Redirect after short delay for animation
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        // Validate passwords match
        if (registerForm.password !== registerForm.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Call register API
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: registerForm.username,
            email: registerForm.email,
            password: registerForm.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Show success animation
        setShowSuccess(true);

        // Save token to localStorage for automatic login
        saveToken(data.token);

        // Redirect after short delay for animation
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#1a0805] to-[#3a120a]">
      <Header />
      <main className="relative flex-grow px-4 pt-24 pb-16 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute left-1/4 -top-20 w-48 h-48 rounded-full bg-[#d4af37] blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.3,
            }}
            className="absolute right-1/3 top-1/3 w-64 h-64 rounded-full bg-[#d4af37] blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.6,
            }}
            className="absolute left-1/3 bottom-20 w-32 h-32 rounded-full bg-[#d4af37] blur-3xl"
          />
        </div>

        <motion.div
          className="container relative z-10 max-w-md mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="relative bg-gradient-to-br from-[#1f0d0c] to-[#291210] p-8 rounded-2xl shadow-[0_10px_50px_rgba(212,175,55,0.2)] border border-[#d4af3730] backdrop-blur-sm overflow-hidden"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 15px 60px rgba(212,175,55,0.25)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Glowing orbs animations */}
            <motion.div
              className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#d4af37] opacity-10 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#d4af37] opacity-10 blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.08, 0.12, 0.08],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5,
              }}
            />

            {/* Logo at top */}
            <motion.div
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <Image
                  src="/GSlogo.svg"
                  alt="GambleShield Logo"
                  width={45}
                  height={45}
                  className="mr-2 animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
                <span className="text-[#d4af37] font-bold text-xl">
                  GAMBLE<span className="font-normal">SHIELD</span>
                </span>
              </div>
            </motion.div>

            {/* Auth Mode Tabs */}
            <motion.div
              className="flex mb-8 border-b border-[#d4af3730]"
              variants={itemVariants}
            >
              <motion.button
                className={`flex-1 py-3 font-medium transition-all duration-300 ${
                  mode === "login"
                    ? "text-[#d4af37] border-b-2 border-[#d4af37]"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setMode("login")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                className={`flex-1 py-3 font-medium transition-all duration-300 ${
                  mode === "register"
                    ? "text-[#d4af37] border-b-2 border-[#d4af37]"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => setMode("register")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register
              </motion.button>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-[#2c1910] p-8 rounded-lg border border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] text-center"
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-[#d4af37]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                    <motion.h3
                      className="text-xl font-bold text-[#d4af37] mb-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Success!
                    </motion.h3>
                    <motion.p
                      className="text-white/80"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {mode === "login"
                        ? "Login successful"
                        : "Registration complete"}
                    </motion.p>
                    <motion.p
                      className="mt-2 text-sm text-white/60"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Redirecting...
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  className="mb-6 p-4 bg-[#471212] border border-red-500/50 text-red-300 rounded-lg shadow-[0_0_15px_rgba(200,0,0,0.15)]"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-400 mr-2 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  key="login-form"
                >
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label
                      htmlFor="username"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        placeholder="Enter your username"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <label
                      htmlFor="password"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b3941e] hover:from-[#e1bd45] hover:to-[#c19f20] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-opacity-50 transform active:translate-y-0"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-3 -ml-1 text-black animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Login"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Register Form */}
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  key="register-form"
                >
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label
                      htmlFor="username"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                        placeholder="Choose a username"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label
                      htmlFor="email"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        placeholder="Enter your email"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label
                      htmlFor="password"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        placeholder="Create a password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[#d4af37] font-medium mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full pl-10 pr-4 py-3 bg-[#1f0d0c]/40 border border-[#d4af3740] rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.3)] placeholder-gray-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="Confirm your password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-60">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#d4af37]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b3941e] hover:from-[#e1bd45] hover:to-[#c19f20] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-opacity-50 transform active:translate-y-0"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-3 -ml-1 text-black animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Register"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Additional information */}
            <motion.div
              className="mt-8 text-xs text-center text-gray-500"
              variants={itemVariants}
            >
              <p>
                By using our services, you agree to our{" "}
                <motion.a
                  href="#"
                  className="text-[#d4af37] hover:underline"
                  whileHover={{ scale: 1.05, color: "#e1bd45" }}
                >
                  Terms of Service
                </motion.a>{" "}
                and{" "}
                <motion.a
                  href="#"
                  className="text-[#d4af37] hover:underline"
                  whileHover={{ scale: 1.05, color: "#e1bd45" }}
                >
                  Privacy Policy
                </motion.a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
