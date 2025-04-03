import React from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { auth } from "@/lib/auth";

const Navbar = async () => {
  const user = await auth({ required: false, redirect: false });

  const navLinks = [
    { href: "/dashboard", label: "", authRequired: true }
  ];

  return (
    <header className="fixed right-0 left-0 top-0 py-4 px-4 bg-black/40 backdrop-blur-lg z-[100] flex items-center border-b-[1px] border-neutral-900 justify-between">
      <aside className="flex items-center gap-[2px]">
        <p className="text-3xl font-bold">StudySync</p>
      </aside>
      <nav className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%] hidden md:block">
        <ul className="flex items-center gap-4 list-none">
          {navLinks.map((link) =>
            !link.authRequired || user ? (
              <li key={link.href}>
                <Link href={link.href} className="text-white hover:text-gray-300 transition-colors">
                  {link.label}
                </Link>
              </li>
            ) : null
          )}
        </ul>
      </nav>
      <aside className="flex items-center gap-4">
        {user ? (
          <LogoutLink className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
            <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Logout
            </span>
          </LogoutLink>
        ) : (
          <div className="flex gap-2">
            <LoginLink className="bg-white text-black px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
              Sign Up
            </LoginLink>
          </div>
        )}
        <MenuIcon className="md:hidden text-white" />
      </aside>
    </header>
  );
};

export default Navbar;

