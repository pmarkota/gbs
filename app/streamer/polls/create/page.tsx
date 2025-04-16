"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authClient";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toaster";

export default function CreatePoll() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState([
    { id: `temp-${Date.now()}-0`, text: "", votes: 0 },
    { id: `temp-${Date.now()}-1`, text: "", votes: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const addOption = () => {
    if (options.length >= 10) {
      toast.error("Maximum 10 options allowed");
      return;
    }

    setOptions([
      ...options,
      { id: `temp-${Date.now()}-${options.length}`, text: "", votes: 0 },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast.error("A poll must have at least 2 options");
      return;
    }

    setOptions(options.filter((option) => option.id !== id));
  };

  const validateForm = () => {
    // Check title
    if (title.trim().length < 3) {
      toast.error("Poll title must be at least 3 characters long");
      return false;
    }

    // Check if we have at least 2 options
    if (options.length < 2) {
      toast.error("A poll must have at least 2 options");
      return false;
    }

    // Check each option has text
    const emptyOptions = options.filter(
      (option) => option.text.trim().length === 0
    );
    if (emptyOptions.length > 0) {
      toast.error("All poll options must have text");
      return false;
    }

    // Check for duplicate options
    const optionTexts = options.map((option) =>
      option.text.trim().toLowerCase()
    );
    const uniqueOptions = [...new Set(optionTexts)];
    if (uniqueOptions.length !== options.length) {
      toast.error("Poll options must be unique");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Prepare data for creating a new poll
      const pollData = {
        title,
        options: options.map((option) => ({
          text: option.text,
        })),
      };

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        throw new Error("Failed to create poll");
      }

      // Success, but no need to use the response data
      toast.success("Poll created successfully");
      router.push("/streamer/polls");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 text-white">
        <div className="flex justify-center items-center h-64">
          <div className="relative h-16 w-16">
            <div className="absolute h-16 w-16 rounded-full border-4 border-t-purple-500 border-b-indigo-500 border-l-transparent border-r-transparent animate-spin"></div>
            <div className="absolute h-10 w-10 rounded-full border-4 border-t-pink-500 border-b-fuchsia-500 border-l-transparent border-r-transparent animate-spin animation-delay-150 left-3 top-3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Create New Poll</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="title" className="block mb-2 text-sm font-medium">
              Poll Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="What's your question?"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Poll Options</label>
              <span className="text-sm text-gray-400">
                {options.length}/10 options
              </span>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center">
                  <div className="flex-1 flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                    <span className="pl-4 pr-2 text-gray-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(option.id, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-2 py-3 bg-transparent focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="ml-2 p-2 text-gray-400 hover:text-white focus:outline-none"
                    aria-label="Remove option"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 10}
              className="mt-4 w-full px-4 py-2 flex items-center justify-center bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Option
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Poll"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/streamer/polls")}
              className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
