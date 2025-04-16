"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authClient";
import React from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/toaster";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function EditPoll({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const pollId = params.id;

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<PollOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalPoll, setOriginalPoll] = useState<Poll | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && pollId) {
      fetchPollDetails();
    }
  }, [user, authLoading, pollId]);

  const fetchPollDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/polls/${pollId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch poll details");
      }

      const data = await response.json();
      setOriginalPoll(data);
      setTitle(data.title);
      setOptions(data.options);
    } catch (error) {
      console.error("Error fetching poll details:", error);
      setError("Failed to load poll details");
    } finally {
      setIsLoading(false);
    }
  };

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

    // Generate a temporary ID for the new option
    const newOption = {
      id: `temp-${Date.now()}-${options.length}`,
      text: "",
      votes: 0,
    };

    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    // Prevent removing if only 2 options left
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

    setIsSaving(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Prepare data for update
      const updatedPoll = {
        title,
        options: options.map((option) => ({
          id: option.id.startsWith("temp-") ? undefined : option.id,
          text: option.text,
        })),
      };

      const response = await fetch(`/api/polls/${pollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPoll),
      });

      if (!response.ok) {
        throw new Error("Failed to update poll");
      }

      toast.success("Poll updated successfully");
      router.push("/streamer/polls");
    } catch (error) {
      console.error("Error updating poll:", error);
      toast.error("Failed to update poll");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/streamer/polls/${pollId}`);
  };

  if (isLoading || authLoading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
          <button
            onClick={() => router.push("/streamer/polls")}
            className="mt-4 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-white"
          >
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Edit Poll</h1>
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

          {originalPoll && originalPoll.is_active && (
            <div className="mb-6 p-4 bg-amber-900/30 border border-amber-500/30 rounded-lg">
              <p className="text-amber-200 text-sm">
                <strong>Note:</strong> This poll is currently active. Editing it
                will affect the live poll that your audience can see and vote
                on.
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
