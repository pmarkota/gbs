"use client";

import { toast as toaster } from "./toaster";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

// Convert variant to the type our toaster expects
const variantToType = (variant?: "default" | "destructive") => {
  if (variant === "destructive") {
    return "error";
  }
  return "info"; // default to info
};

// Create a hook for toast functionality
export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, variant, duration } = props;
    const type = variantToType(variant);

    toaster[type](title, description, duration);
  };

  return { toast };
}

// Shorthand for direct use without the hook
export const toast = (props: ToastProps) => {
  const { title, description, variant, duration } = props;
  const type = variantToType(variant);

  toaster[type](title, description, duration);
};
