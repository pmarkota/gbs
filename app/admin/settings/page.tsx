"use client";

import { useState, useEffect } from "react";
import {
  CogIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";

interface GeneralSettings {
  siteName: string;
  maintenanceMode: boolean;
  userRegistration: boolean;
  defaultCoins: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "theme">("general");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "GambleShield",
    maintenanceMode: false,
    userRegistration: true,
    defaultCoins: 100,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication token not found");
        setIsLoading(false);
        return;
      }

      // In a real app, you would call a settings API endpoint
      // For now, we'll use mock data
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      toast.error("Failed to load settings");
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setIsSaving(true);

      // In a real app, you would call an API to save settings
      // For demonstration, we'll just show a success toast after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("General settings saved successfully");
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings"
      );
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-t-[#d4af37] border-b-amber-800 border-l-transparent border-r-transparent animate-spin"></div>
          <div className="absolute h-10 w-10 rounded-full border-4 border-t-amber-600 border-b-amber-700 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute left-1/4 -top-20 w-48 h-48 rounded-full bg-[#d4af37] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.3,
          }}
          className="absolute right-1/3 top-1/3 w-64 h-64 rounded-full bg-[#d4af37] blur-3xl"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.h1
          className="text-2xl font-bold text-white flex items-center"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <CogIcon className="w-7 h-7 mr-2 text-[#d4af37]" />
          Platform Settings
        </motion.h1>
      </div>

      {error && (
        <motion.div
          className="bg-red-900/40 border border-red-500 text-red-100 px-4 py-3 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700">
            <nav className="divide-y divide-gray-700">
              <button
                className={`w-full flex items-center px-6 py-4 text-left transition-colors ${
                  activeTab === "general"
                    ? "bg-gray-700/50 border-l-2 border-[#d4af37]"
                    : "hover:bg-gray-700/30"
                }`}
                onClick={() => setActiveTab("general")}
              >
                <ShieldCheckIcon className="w-5 h-5 mr-3 text-[#d4af37]" />
                <span className="text-white">General Settings</span>
              </button>
              <button
                className={`w-full flex items-center px-6 py-4 text-left transition-colors ${
                  activeTab === "theme"
                    ? "bg-gray-700/50 border-l-2 border-[#d4af37]"
                    : "hover:bg-gray-700/30"
                }`}
                onClick={() => setActiveTab("theme")}
              >
                <CogIcon className="w-5 h-5 mr-3 text-[#d4af37]" />
                <span className="text-white">Theme</span>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Content Panel */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.1)] transition-all duration-300">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 mr-2 text-[#d4af37]" />
                  General Settings
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="siteName"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Platform Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            siteName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="defaultCoins"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Default Coins for New Users
                      </label>
                      <input
                        type="number"
                        id="defaultCoins"
                        value={generalSettings.defaultCoins}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            defaultCoins: parseInt(e.target.value),
                          })
                        }
                        min="0"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Initial coin amount given to newly registered users
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div>
                        <h3 className="text-white font-medium">
                          Maintenance Mode
                        </h3>
                        <p className="text-sm text-gray-400">
                          Put the site in maintenance mode (only admins can
                          access)
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 ${
                            generalSettings.maintenanceMode
                              ? "bg-[#d4af37]"
                              : "bg-gray-700"
                          }`}
                          onClick={() =>
                            setGeneralSettings({
                              ...generalSettings,
                              maintenanceMode: !generalSettings.maintenanceMode,
                            })
                          }
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              generalSettings.maintenanceMode
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div>
                        <h3 className="text-white font-medium">
                          User Registration
                        </h3>
                        <p className="text-sm text-gray-400">
                          Allow new users to register
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 ${
                            generalSettings.userRegistration
                              ? "bg-[#d4af37]"
                              : "bg-gray-700"
                          }`}
                          onClick={() =>
                            setGeneralSettings({
                              ...generalSettings,
                              userRegistration:
                                !generalSettings.userRegistration,
                            })
                          }
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              generalSettings.userRegistration
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={handleSaveGeneral}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] text-white rounded-lg hover:from-[#d4af37] hover:to-amber-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      ) : (
                        <CheckIcon className="h-5 w-5" />
                      )}
                      <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === "theme" && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CogIcon className="w-6 h-6 mr-2 text-[#d4af37]" />
                  Theme Settings
                </h2>

                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-lg p-4 flex items-center border border-gray-700">
                    <InformationCircleIcon className="h-10 w-10 text-blue-400 mr-4 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Theme settings will be implemented in a future update. The
                      platform currently uses the Gold/Dark theme based on Roman
                      aesthetics.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="border-2 border-[#d4af37] rounded-lg p-2 cursor-not-allowed bg-gray-800">
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-md flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-[#d4af37]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]"></div>
                      </div>
                      <p className="text-center text-white text-sm mt-2 font-medium">
                        Gold/Dark (Current)
                      </p>
                    </div>

                    <div className="border-2 border-transparent rounded-lg p-2 cursor-not-allowed opacity-50">
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-blue-900 rounded-md flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 to-blue-400"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-400/20 border border-blue-400"></div>
                      </div>
                      <p className="text-center text-white text-sm mt-2">
                        Ocean Blue
                      </p>
                    </div>

                    <div className="border-2 border-transparent rounded-lg p-2 cursor-not-allowed opacity-50">
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-indigo-900 rounded-md flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 to-purple-400"></div>
                        <div className="w-8 h-8 rounded-full bg-purple-400/20 border border-purple-400"></div>
                      </div>
                      <p className="text-center text-white text-sm mt-2">
                        Royal Purple
                      </p>
                    </div>

                    <div className="border-2 border-transparent rounded-lg p-2 cursor-not-allowed opacity-50">
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-emerald-900 rounded-md flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-700 to-emerald-400"></div>
                        <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400"></div>
                      </div>
                      <p className="text-center text-white text-sm mt-2">
                        Emerald
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      disabled={true}
                      className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      <span>Coming Soon</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
