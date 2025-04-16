"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    // Subscribe to toast events
    const handleToast = (event: CustomEvent<ToastProps>) => {
      const newToast = {
        ...event.detail,
        id: event.detail.id || String(new Date().getTime()),
      };

      setToasts((current) => [...current, newToast]);

      // Auto remove toast after duration
      if (newToast.duration !== 0) {
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== newToast.id));
        }, newToast.duration || 5000);
      }
    };

    // Add event listener with proper type
    document.addEventListener("toast", handleToast as EventListener);

    // Clean up
    return () => {
      document.removeEventListener("toast", handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastProps["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case "error":
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case "info":
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const getToastClasses = (type: ToastProps["type"]) => {
    const baseClasses =
      "rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-700 flex items-start space-x-3 transform transition-all duration-300 ease-in-out";

    switch (type) {
      case "success":
        return `${baseClasses} bg-white dark:bg-gray-800`;
      case "error":
        return `${baseClasses} bg-white dark:bg-gray-800`;
      case "info":
        return `${baseClasses} bg-white dark:bg-gray-800`;
      default:
        return baseClasses;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-50 flex flex-col space-y-2 top-4 right-4 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastClasses(toast.type)} animate-fade-in`}
          role="alert"
        >
          <div className="flex-shrink-0">{getIcon(toast.type)}</div>
          <div className="flex flex-col flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {toast.title}
            </div>
            {toast.message && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {toast.message}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to show toasts
export const toast = {
  show: (props: Omit<ToastProps, "id">) => {
    const event = new CustomEvent("toast", {
      detail: {
        id: String(new Date().getTime()),
        ...props,
      },
    });
    document.dispatchEvent(event);
  },
  success: (title: string, message?: string, duration?: number) => {
    toast.show({
      type: "success",
      title,
      message,
      duration,
    });
  },
  error: (title: string, message?: string, duration?: number) => {
    toast.show({
      type: "error",
      title,
      message,
      duration,
    });
  },
  info: (title: string, message?: string, duration?: number) => {
    toast.show({
      type: "info",
      title,
      message,
      duration,
    });
  },
};
