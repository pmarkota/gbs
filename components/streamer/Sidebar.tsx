"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/authClient";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/streamer",
      icon: ChartBarIcon,
      current: pathname === "/streamer",
    },
    {
      name: "Polls",
      href: "/streamer/polls",
      icon: QuestionMarkCircleIcon,
      current:
        pathname === "/streamer/polls" ||
        pathname.startsWith("/streamer/polls/"),
    },
  ];

  const isActive = (path: string) => {
    if (path === "/streamer") {
      return pathname === "/streamer";
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-1 min-h-0 bg-gray-800">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center">
              <VideoCameraIcon className="w-8 h-8 text-purple-500" />
              <span className="ml-2 text-xl font-bold text-white">
                Streamer Portal
              </span>
            </Link>
          </div>
          <div className="flex flex-col px-2 mt-5">
            <div className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    flex items-center rounded-md px-2 py-2 text-sm font-medium w-full text-left
                    ${
                      isActive(item.href)
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive(item.href) ? "text-purple-500" : "text-gray-400"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 text-white bg-gray-600 rounded-full">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs font-medium text-gray-300">Streamer</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex-shrink-0 p-1 ml-auto text-gray-400 bg-gray-800 rounded-full hover:text-white"
              onClick={logout}
            >
              <span className="sr-only">Log out</span>
              <ArrowLeftOnRectangleIcon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
