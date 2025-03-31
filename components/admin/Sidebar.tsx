"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authClient";
import {
  ChartPieIcon,
  UsersIcon,
  CogIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  ChevronLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type NavItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
  >;
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: ChartPieIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Ranks", href: "/admin/ranks", icon: ArrowTrendingUpIcon },
  { name: "Coins", href: "/admin/coins", icon: BanknotesIcon },
  { name: "Settings", href: "/admin/settings", icon: CogIcon },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-900 backdrop-blur-sm text-white transition-all duration-300 ease-in-out border-r border-gray-800 ${
        collapsed ? "w-20" : "w-64"
      } h-screen shadow-lg relative overflow-hidden`}
    >
      {/* Background decorative elements - reduced opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-r from-[#d4af37]/3 to-transparent blur-3xl"></div>
        <div className="absolute -right-24 bottom-16 w-36 h-36 rounded-full bg-gradient-to-r from-[#d4af37]/3 to-transparent blur-3xl"></div>
      </div>

      <div className="flex items-center justify-between p-4 border-b border-gray-800 relative">
        <Link
          href="/admin"
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 8px 2px rgba(212, 175, 55, 0.3)",
                  "0 0 12px 4px rgba(212, 175, 55, 0.5)",
                  "0 0 8px 2px rgba(212, 175, 55, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <ShieldCheckIcon className="w-8 h-8 text-[#d4af37]" />
          </div>
          {!collapsed && (
            <div className="text-xl font-bold">
              <span className="text-[#d4af37]">GAMBLE</span>
              <span className="text-white">SHIELD</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-gray-200 hover:text-[#d4af37] transition-colors ${
            collapsed ? "hidden" : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-[#d4af37]">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">{user?.username}</p>
              <p className="text-sm text-gray-300">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-5 px-2 relative z-10">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={item.name}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`group flex items-center p-3 text-base font-normal rounded-lg transition-all ${
                    isActive
                      ? "bg-gray-800 border-l-2 border-[#d4af37]"
                      : "hover:bg-gray-800 border-l-2 border-transparent"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-[#d4af37]"
                        : "text-gray-300 group-hover:text-white"
                    } transition-colors`}
                    aria-hidden="true"
                  />
                  {!collapsed && (
                    <span
                      className={`ml-3 ${
                        isActive ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                  {isActive && collapsed && (
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full absolute -right-0.5"></div>
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="pt-4 mt-4 border-t border-gray-800">
          <motion.li
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <Link
              href="/"
              className={`w-full group flex items-center p-3 text-base font-normal rounded-lg transition-all hover:bg-gray-800 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <HomeIcon
                className="w-5 h-5 text-gray-300 group-hover:text-[#d4af37] transition-colors"
                aria-hidden="true"
              />
              {!collapsed && (
                <span className="ml-3 text-gray-300">Home Page</span>
              )}
            </Link>
          </motion.li>

          <motion.button
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
            onClick={logout}
            className={`w-full group flex items-center p-3 text-base font-normal rounded-lg transition-all hover:bg-gray-800 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ArrowLeftOnRectangleIcon
              className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors"
              aria-hidden="true"
            />
            {!collapsed && <span className="ml-3 text-gray-300">Logout</span>}
          </motion.button>
        </div>
      </nav>

      {collapsed && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-[#d4af37] transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
