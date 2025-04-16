"use client";

import { toast } from "@/components/ui/toaster";

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiClient {
  async get<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "GET",
      ...options,
    });
  }

  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(
    url: string,
    data?: Record<string, unknown>,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "DELETE",
      ...options,
    });
  }

  private async request<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      // Get token from localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      // Set default headers
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Parse response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        const error =
          typeof data === "object" && data.message
            ? data.message
            : "Something went wrong";

        throw new Error(error);
      }

      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      console.error(`API Error: ${error}`);

      // Display error toast
      if (error instanceof Error) {
        toast.error("API Error", error.message);
      } else {
        toast.error("API Error", "An unexpected error occurred");
      }

      throw error;
    }
  }
}

const api = new ApiClient();
export default api;
