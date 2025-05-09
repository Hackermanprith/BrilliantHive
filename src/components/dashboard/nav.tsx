"use client";
import React from "react";
import {
  Archive,
  History,
  LayoutDashboard,
  Target,
  Languages,
  Clock,
  Calendar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

const links = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    name: "Archive",
    href: "/dashboard/archive",
    icon: Archive,
  },
  {
    name: "Subjects",
    href: "/dashboard/subjects",
    icon: Languages,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: LayoutDashboard,
  },
  {
    name: "StudyTimer",
    href: "/dashboard/study-timer",
    icon: Clock,
  },
  {
    name: "Tasks",
    href: "https://crumsmanager.vercel.app/", // Change 4000 to the actual port your other app is running on
    icon: Calendar,
    external: true, // Mark it as external
  },
];

const Nav = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
        <nav className="flex justify-between px-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return link.external ? (
              <a
                href={link.href}
                key={link.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 py-2 px-3 text-sm text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{link.name}</span>
              </a>
            ) : (
              <Link
                href={link.href}
                key={link.name}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <nav className="hidden md:flex gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return link.external ? (
            <a
              href={link.href}
              key={link.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-muted transition-colors"
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </div>
            </a>
          ) : (
            <Link href={link.href} key={link.name}>
              <div
                className={cn(
                  "flex items-center gap-2 py-2 px-4 rounded-md hover:bg-muted transition-colors",
                  isActive && "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Nav;
