"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ShieldCheckIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";
import { useAuth } from "@/lib/authClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  rank: number;
  coins: number;
  created_at: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
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

      // Call users API
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users);
      setTotalUsers(data.total);
      setTotalPages(data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
      toast.error("Failed to load users");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    // Call API or sort locally
    const sortedUsers = [...users].sort((a, b) => {
      if (field === "rank" || field === "coins") {
        return sortDirection === "asc"
          ? a[field] - b[field]
          : b[field] - a[field];
      }

      return sortDirection === "asc"
        ? String(a[field]).localeCompare(String(b[field]))
        : String(b[field]).localeCompare(String(a[field]));
    });

    setUsers(sortedUsers);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("Cannot delete your own account");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setIsLoading(true);

        // Get token from local storage
        const token = localStorage.getItem("auth_token");
        if (!token) {
          toast.error("Authentication token not found");
          setIsLoading(false);
          return;
        }

        // Call delete API
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete user");
        }

        // Remove from the state
        setUsers(users.filter((user) => user.id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete user"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      setIsLoading(true);

      // Get token from local storage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Authentication token not found");
        setIsLoading(false);
        return;
      }

      // Call update API
      const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          rank: updatedUser.rank,
          coins: updatedUser.coins,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      // Update in the state
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? data.user : user))
      );
      toast.success("User updated successfully");
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRankName = (rank: number) => {
    const ranks = ["Tiro", "Gregarius", "Decanus", "Centurion", "Legatus"];
    return ranks[rank - 1] || "Unknown";
  };

  const getStatusColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[#d4af37] text-white";
      case "moderator":
        return "bg-indigo-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (isLoading && users.length === 0) {
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
          <UserIcon className="w-7 h-7 mr-2 text-[#d4af37]" />
          User Management
        </motion.h1>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] text-white rounded-lg hover:from-[#d4af37] hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </motion.div>
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

      {/* User Table */}
      <motion.div
        className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-[0_5px_30px_rgba(212,175,55,0.15)] transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Username</span>
                    {sortField === "username" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortField === "email" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    {sortField === "role" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    {sortField === "rank" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("coins")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Coins</span>
                    {sortField === "coins" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Joined</span>
                    {sortField === "created_at" && (
                      <ArrowsUpDownIcon className="h-4 w-4 text-[#d4af37]" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  className="hover:bg-gray-700/40 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3">
                        <span className="text-[#d4af37] font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white">
                        {user.username}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-[#d4af37] mr-2"></span>
                      {getRankName(user.rank)} ({user.rank})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-[#d4af37] mr-1" />
                      {user.coins.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={
                        user.id === currentUser?.id || user.role === "admin"
                      }
                      className={
                        user.id === currentUser?.id || user.role === "admin"
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-red-500 hover:text-red-400 transition-colors"
                      }
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-900/50 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {users.length} of {totalUsers} users
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-[#d4af37] text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit/Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-700 backdrop-blur-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal glowing effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-800 via-gray-800 to-amber-800 rounded-xl blur opacity-30"></div>

              <div className="relative">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-[#d4af37] mr-2" />
                    {selectedUser ? "Edit User" : "Create New User"}
                  </h3>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);

                    const formUser = {
                      id: selectedUser?.id || "",
                      username: formData.get("username") as string,
                      email: formData.get("email") as string,
                      role: formData.get("role") as string,
                      rank: parseInt(formData.get("rank") as string),
                      coins: parseInt(formData.get("coins") as string),
                      created_at:
                        selectedUser?.created_at || new Date().toISOString(),
                    };

                    handleUpdateUser(formUser);
                  }}
                  className="px-6 py-4 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      defaultValue={selectedUser?.username || ""}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={selectedUser?.email || ""}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Role
                    </label>
                    <select
                      name="role"
                      id="role"
                      defaultValue={selectedUser?.role || "user"}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="rank"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Rank
                    </label>
                    <select
                      name="rank"
                      id="rank"
                      defaultValue={selectedUser?.rank || 1}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    >
                      <option value={1}>1 - Tiro</option>
                      <option value={2}>2 - Gregarius</option>
                      <option value={3}>3 - Decanus</option>
                      <option value={4}>4 - Centurion</option>
                      <option value={5}>5 - Legatus</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="coins"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Coins
                    </label>
                    <input
                      type="number"
                      name="coins"
                      id="coins"
                      defaultValue={selectedUser?.coins || 100}
                      min={0}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-700 to-[#d4af37] hover:from-[#d4af37] hover:to-amber-700 text-white rounded-md transition-colors shadow-md"
                    >
                      {selectedUser ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
