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

  // Force re-render when tab changes to ensure input fields are visible
  React.useEffect(() => {
    // This empty effect will trigger a re-render when mode changes
    // which helps ensure input fields are properly displayed
  }, [mode]);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0a0404] via-[#1a0805] to-[#2d0f08] relative overflow-hidden">
      <Header />
      
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(212,175,55,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Floating Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 border border-[#d4af37]/20 rotate-45"
          animate={{ 
            y: [0, -20, 0],
            rotate: [45, 135, 45],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-6 h-6 rounded-full border border-[#d4af37]/30"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-3 h-12 bg-gradient-to-t from-[#d4af37]/10 to-transparent"
          animate={{ 
            scaleY: [1, 1.8, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Dynamic Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 40%, transparent 70%)'
          }}
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.01) 50%, transparent 80%)'
          }}
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        
        {/* Particle System */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <main className="relative flex-grow px-4 pt-16 pb-16 flex items-center justify-center min-h-screen">

        {/* Main Auth Container */}
        <motion.div
          className="relative z-10 w-full max-w-lg mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Glassmorphism Card with Advanced Effects */}
          <motion.div
            className="relative backdrop-blur-xl bg-gradient-to-br from-[#1a0805]/40 via-[#2d0f08]/60 to-[#1a0805]/40 p-10 rounded-3xl border border-[#d4af37]/20 shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              boxShadow: "0 30px 100px rgba(212,175,55,0.15), 0 0 0 1px rgba(212,175,55,0.1)",
              scale: 1.01
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Inner Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d4af37]/5 via-transparent to-[#d4af37]/5 pointer-events-none" />
            
            {/* Dynamic Corner Accents */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-radial from-[#d4af37]/10 to-transparent"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-radial from-[#d4af37]/8 to-transparent"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            
            {/* Animated Border Lines */}
            <motion.div
              className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />

            {/* Enhanced Logo Section */}
            <motion.div
              className="flex flex-col items-center mb-8"
              variants={itemVariants}
            >
              <motion.div 
                className="relative mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Logo Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#d4af37]/20 blur-xl scale-150"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 border border-[#d4af37]/30">
                  <Image
                    src="/GSlogo.svg"
                    alt="GambleShield Logo"
                    width={32}
                    height={32}
                    className="relative z-10"
                  />
                </div>
              </motion.div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] bg-clip-text text-transparent mb-1">
                  GAMBLE<span className="font-light">SHIELD</span>
                </h1>
                <p className="text-sm text-gray-400 font-light tracking-wide">
                  Secure Authentication Portal
                </p>
              </motion.div>
            </motion.div>

            {/* Modern Tab System */}
            <motion.div
              className="relative mb-8"
              variants={itemVariants}
              layout
            >
              <div className="relative flex bg-[#1a0805]/60 rounded-2xl p-1 border border-[#d4af37]/10">
                {/* Animated Tab Indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 rounded-xl border border-[#d4af37]/30"
                  animate={{
                    x: mode === "login" ? 0 : "calc(50% - 2px)",
                    width: "calc(50% - 2px)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                
                <motion.button
                  className={`relative z-10 flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-xl ${
                    mode === "login"
                      ? "text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setMode("login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign In</span>
                </motion.button>
                
                <motion.button
                  className={`relative z-10 flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 rounded-xl ${
                    mode === "register"
                      ? "text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setMode("register")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Create Account</span>
                </motion.button>
              </div>
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

            {/* Forms Container - Single AnimatePresence to prevent timing conflicts */}
            <AnimatePresence mode="wait" initial={false}>
              {mode === "login" && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, type: "tween" }}
                  key="login-form"
                >
                  <motion.div className="mb-6" variants={itemVariants}>
                    <motion.label
                      htmlFor="username"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      USERNAME
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        placeholder="Enter your username"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      {/* Input glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.div className="mb-8" variants={itemVariants}>
                    <motion.label
                      htmlFor="password"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      PASSWORD
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      {/* Input glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="group relative w-full bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] hover:from-[#e1bd45] hover:via-[#f7d045] hover:to-[#e1bd45] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_32px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.4)] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:ring-offset-2 focus:ring-offset-transparent overflow-hidden"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <div className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 mr-3 border-2 border-black/30 border-t-black rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="font-semibold tracking-wide">SIGNING IN...</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold tracking-wide">SIGN IN</span>
                          <motion.svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            initial={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </motion.svg>
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.form>
              )}
              
              {mode === "register" && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, type: "tween" }}
                  key="register-form"
                  style={{ pointerEvents: "auto" }}
                >
                  <motion.div className="mb-6" variants={itemVariants}>
                    <motion.label
                      htmlFor="username"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      USERNAME
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                        placeholder="Choose a username"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <motion.label
                      htmlFor="email"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      EMAIL ADDRESS
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        placeholder="Enter your email address"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <motion.label
                      htmlFor="password"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      PASSWORD
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        placeholder="Create a secure password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.div className="mb-8" variants={itemVariants}>
                    <motion.label
                      htmlFor="confirmPassword"
                      className="block text-[#d4af37] font-semibold mb-3 text-sm tracking-wide"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      CONFIRM PASSWORD
                    </motion.label>
                    <div className="relative group">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full pl-12 pr-4 py-4 bg-[#0f0605]/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl focus:outline-none focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 focus:shadow-[0_0_30px_rgba(212,175,55,0.15)] placeholder-gray-500 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[#d4af37]/40 focus:scale-[1.02]"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="Confirm your password"
                        style={{ caretColor: "#d4af37" }}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <motion.div
                          className="p-1 rounded-lg bg-[#d4af37]/10 group-focus-within:bg-[#d4af37]/20 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#d4af37] group-focus-within:text-[#f4c430] transition-colors duration-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="group relative w-full bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] hover:from-[#e1bd45] hover:via-[#f7d045] hover:to-[#e1bd45] text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_32px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.4)] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:ring-offset-2 focus:ring-offset-transparent overflow-hidden"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <div className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 mr-3 border-2 border-black/30 border-t-black rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="font-semibold tracking-wide">CREATING ACCOUNT...</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold tracking-wide">CREATE ACCOUNT</span>
                          <motion.svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            initial={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </motion.svg>
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Modern Footer Section */}
            <motion.div
              className="mt-10 pt-6 border-t border-[#d4af37]/10"
              variants={itemVariants}
            >
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                  <motion.a
                    href="#"
                    className="hover:text-[#d4af37] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="relative z-10">Terms of Service</span>
                    <div className="absolute inset-0 bg-[#d4af37]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </motion.a>
                  <div className="w-1 h-1 bg-[#d4af37]/30 rounded-full" />
                  <motion.a
                    href="#"
                    className="hover:text-[#d4af37] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="relative z-10">Privacy Policy</span>
                    <div className="absolute inset-0 bg-[#d4af37]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </motion.a>
                  <div className="w-1 h-1 bg-[#d4af37]/30 rounded-full" />
                  <motion.a
                    href="#"
                    className="hover:text-[#d4af37] transition-colors duration-300 relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="relative z-10">Support</span>
                    <div className="absolute inset-0 bg-[#d4af37]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </motion.a>
                </div>
                
                <motion.p
                  className="text-xs text-gray-500 font-light"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Secured with enterprise-grade encryption
                </motion.p>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span>System Status: Operational</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
